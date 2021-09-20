package notifier

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/services/ngalert/logging"

	gokit_log "github.com/go-kit/kit/log"
	"github.com/prometheus/alertmanager/cluster"
	"github.com/prometheus/client_golang/prometheus"

	"github.com/grafana/grafana/pkg/infra/kvstore"
	"github.com/grafana/grafana/pkg/infra/log"
	api "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/store"
	"github.com/grafana/grafana/pkg/setting"
)

var (
	ErrNoAlertmanagerForOrg = fmt.Errorf("Alertmanager does not exist for this organization")
	ErrAlertmanagerNotReady = fmt.Errorf("Alertmanager is not ready yet")
)

type MultiOrgAlertmanager struct {
	alertmanagersMtx sync.RWMutex
	alertmanagers    map[int64]*Alertmanager

	settings *setting.Cfg
	logger   log.Logger

	// clusterPeer represents the clustering peers of Alertmanagers between Grafana instances.
	peer         ClusterPeer
	settleCancel context.CancelFunc

	configStore store.AlertingStore
	orgStore    store.OrgStore
	kvStore     kvstore.KVStore

	metrics *metrics.MultiOrgAlertmanager
}

func NewMultiOrgAlertmanager(cfg *setting.Cfg, configStore store.AlertingStore, orgStore store.OrgStore, kvStore kvstore.KVStore, m *metrics.MultiOrgAlertmanager, l log.Logger) (*MultiOrgAlertmanager, error) {
	moa := &MultiOrgAlertmanager{
		logger:        l,
		settings:      cfg,
		alertmanagers: map[int64]*Alertmanager{},
		configStore:   configStore,
		orgStore:      orgStore,
		kvStore:       kvStore,
		metrics:       m,
	}

	clusterLogger := gokit_log.With(gokit_log.NewLogfmtLogger(logging.NewWrapper(l)), "component", "cluster")
	moa.peer = &NilPeer{}
	if len(cfg.HAPeers) > 0 {
		peer, err := cluster.Create(
			clusterLogger,
			m.Registerer,
			cfg.HAListenAddr,
			cfg.HAAdvertiseAddr,
			cfg.HAPeers, // peers
			true,
			cfg.HAPushPullInterval,
			cfg.HAGossipInterval,
			cluster.DefaultTcpTimeout,
			cluster.DefaultProbeTimeout,
			cluster.DefaultProbeInterval,
			nil,
		)

		if err != nil {
			return nil, fmt.Errorf("unable to initialize gossip mesh: %w", err)
		}

		err = peer.Join(cluster.DefaultReconnectInterval, cluster.DefaultReconnectTimeout)
		if err != nil {
			l.Error("msg", "unable to join gossip mesh while initializing cluster for high availability mode", "err", err)
		}
		// Attempt to verify the number of peers for 30s every 2s. The risk here is what we send a notification "too soon".
		// Which should _never_ happen given we share the notification log via the database so the risk of double notification is very low.
		var ctx context.Context
		ctx, moa.settleCancel = context.WithTimeout(context.Background(), 30*time.Second)
		go peer.Settle(ctx, cluster.DefaultGossipInterval*10)
		moa.peer = peer
	}

	return moa, nil
}

func (moa *MultiOrgAlertmanager) Run(ctx context.Context) error {
	moa.logger.Info("starting MultiOrg Alertmanager")

	for {
		select {
		case <-ctx.Done():
			moa.StopAndWait()
			return nil
		case <-time.After(moa.settings.AlertmanagerConfigPollInterval):
			if err := moa.LoadAndSyncAlertmanagersForOrgs(ctx); err != nil {
				moa.logger.Error("error while synchronizing Alertmanager orgs", "err", err)
			}
		}
	}
}

func (moa *MultiOrgAlertmanager) LoadAndSyncAlertmanagersForOrgs(ctx context.Context) error {
	moa.logger.Debug("synchronizing Alertmanagers for orgs")
	// First, load all the organizations from the database.
	orgIDs, err := moa.orgStore.GetOrgs(ctx)
	if err != nil {
		return err
	}

	// Then, sync them by creating or deleting Alertmanagers as necessary.
	moa.metrics.DiscoveredConfigurations.Set(float64(len(orgIDs)))
	moa.SyncAlertmanagersForOrgs(ctx, orgIDs)

	moa.logger.Debug("done synchronizing Alertmanagers for orgs")

	return nil
}

// getLatestConfigs retrieves the latest Alertmanager configuration for every organization. It returns a map where the key is the ID of each organization and the value is the configuration.
func (moa *MultiOrgAlertmanager) getLatestConfigs(ctx context.Context) (map[int64]*models.AlertConfiguration, error) {
	configs, err := moa.configStore.GetAllLatestAlertmanagerConfiguration(ctx)
	if err != nil {
		return nil, err
	}

	result := make(map[int64]*models.AlertConfiguration, len(configs))
	for _, config := range configs {
		result[config.OrgID] = config
	}

	return result, nil
}

func (moa *MultiOrgAlertmanager) SyncAlertmanagersForOrgs(ctx context.Context, orgIDs []int64) {
	orgsFound := make(map[int64]struct{}, len(orgIDs))
	dbConfigs, err := moa.getLatestConfigs(ctx)
	if err != nil {
		moa.logger.Error("failed to load Alertmanager configurations", "err", err)
		return
	}
	moa.alertmanagersMtx.Lock()
	for _, orgID := range orgIDs {
		orgsFound[orgID] = struct{}{}

		dbConfig, cfgFound := dbConfigs[orgID]

		var cfg *api.PostableUserConfig
		if cfgFound {
			var err error
			cfg, loadErr = Load([]byte(dbConfig.AlertmanagerConfiguration))
			if err != nil {
				moa.logger.Error("failed to parse Alertmanager config for org", "org", orgID, "id", dbConfig.ID, "err", err)
				continue
			}
		}

		alertmanager, found := moa.alertmanagers[orgID]
		if !found {
			// These metrics are not exported by Grafana and are mostly a placeholder.
			// To export them, we need to translate the metrics from each individual registry and,
			// then aggregate them on the main registry.
			m := metrics.NewAlertmanagerMetrics(moa.metrics.GetOrCreateOrgRegistry(orgID))
			am, err := newAlertmanager(orgID, moa.settings, moa.configStore, moa.kvStore, moa.peer, m)
			if err != nil {
				moa.logger.Error("unable to create Alertmanager for org", "org", orgID, "err", err)
			}
			alertmanager = am
		}

		if cfgFound {
			err := alertmanager.ApplyConfig(cfg)
			if err != nil {
				moa.logger.Error("failed to apply Alertmanager config for org", "org", orgID, "id", dbConfig.ID, "err", err)
				continue
			}
		} else {
			if found {
				//This means that the configuration is gone but the organization as well as the Alertmanager exists
				moa.logger.Warn("Alertmanager exists for org but the configuration is gone. Applying the default configuration", "org", orgID)
			}
			err := alertmanager.SaveAndApplyDefaultConfig()
			if err != nil {
				moa.logger.Error("failed to apply the default Alertmanager configuration", "org", orgID)
				continue
			}
		}

		//if everything went well and this is a new alert manager, add it to the map
		if !found {
			moa.alertmanagers[orgID] = alertmanager
		}
	}

	amsToStop := map[int64]*Alertmanager{}
	for orgId, am := range moa.alertmanagers {
		if _, exists := orgsFound[orgId]; !exists {
			amsToStop[orgId] = am
			delete(moa.alertmanagers, orgId)
			moa.metrics.RemoveOrgRegistry(orgId)
		}
	}
	moa.metrics.ActiveConfigurations.Set(float64(len(moa.alertmanagers)))
	moa.alertmanagersMtx.Unlock()

	// Now, we can stop the Alertmanagers without having to hold a lock.
	for orgID, am := range amsToStop {
		moa.logger.Info("stopping Alertmanager", "org", orgID)
		am.StopAndWait()
		moa.logger.Info("stopped Alertmanager", "org", orgID)
	}
}

func (moa *MultiOrgAlertmanager) StopAndWait() {
	moa.alertmanagersMtx.Lock()
	defer moa.alertmanagersMtx.Unlock()

	for _, am := range moa.alertmanagers {
		am.StopAndWait()
	}

	p, ok := moa.peer.(*cluster.Peer)
	if ok {
		moa.settleCancel()
		if err := p.Leave(10 * time.Second); err != nil {
			moa.logger.Warn("unable to leave the gossip mesh", "err", err)
		}
	}
}

// AlertmanagerFor returns the Alertmanager instance for the organization provided.
// When the organization does not have an active Alertmanager, it returns a ErrNoAlertmanagerForOrg.
// When the Alertmanager of the organization is not ready, it returns a ErrAlertmanagerNotReady.
func (moa *MultiOrgAlertmanager) AlertmanagerFor(orgID int64) (*Alertmanager, error) {
	moa.alertmanagersMtx.RLock()
	defer moa.alertmanagersMtx.RUnlock()

	orgAM, existing := moa.alertmanagers[orgID]
	if !existing {
		return nil, ErrNoAlertmanagerForOrg
	}

	if !orgAM.Ready() {
		return nil, ErrAlertmanagerNotReady
	}

	return orgAM, nil
}

// NilPeer and NilChannel implements the Alertmanager clustering interface.
type NilPeer struct{}

func (p *NilPeer) Position() int                   { return 0 }
func (p *NilPeer) WaitReady(context.Context) error { return nil }
func (p *NilPeer) AddState(string, cluster.State, prometheus.Registerer) cluster.ClusterChannel {
	return &NilChannel{}
}

type NilChannel struct{}

func (c *NilChannel) Broadcast([]byte) {}
