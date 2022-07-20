package kvstore

import (
	"context"

	"github.com/grafana/grafana/pkg/infra/kvstore"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/secrets"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/grafana/grafana/pkg/setting"
)

// PluginSecretMigrationService This migrator will handle migration of datasource secrets (aka Unified secrets)
// into the plugin secrets configured
type PluginSecretMigrationService struct {
	secretsStore   SecretsKVStore
	cfg            *setting.Cfg
	logger         log.Logger
	sqlStore       sqlstore.Store
	secretsService secrets.Service
	remoteCheck    UseRemoteSecretsPluginCheck
	kvstore        kvstore.KVStore
}

func ProvidePluginSecretMigrationService(
	secretsStore SecretsKVStore,
	cfg *setting.Cfg,
	sqlStore sqlstore.Store,
	secretsService secrets.Service,
	remoteCheck UseRemoteSecretsPluginCheck,
	kvstore kvstore.KVStore,
) *PluginSecretMigrationService {
	return &PluginSecretMigrationService{
		secretsStore:   secretsStore,
		cfg:            cfg,
		logger:         log.New("sec-plugin-mig"),
		sqlStore:       sqlStore,
		secretsService: secretsService,
		remoteCheck:    remoteCheck,
		kvstore:        kvstore,
	}
}

func (s *PluginSecretMigrationService) Migrate(ctx context.Context) error {
	// Check if we should migrate to plugin - default false
	if s.cfg.SectionWithEnvOverrides("secrets").Key("migrate_to_plugin").MustBool(false) && s.remoteCheck.ShouldUseRemoteSecretsPlugin() {
		s.logger.Debug("starting migration of unified secrets to the plugin")
		// we need to instantiate the secretsKVStore as this is not on wire, and in this scenario,
		// the secrets store would be the plugin.
		secretsSql := &secretsKVStoreSQL{
			sqlStore:       s.sqlStore,
			secretsService: s.secretsService,
			log:            s.logger,
			decryptionCache: decryptionCache{
				cache: make(map[int64]cachedDecrypted),
			},
		}

		// before we start migrating, check see if plugin startup failures were already fatal
		namespacedKVStore := GetNamespacedKVStore(s.kvstore)
		wasFatal, _ := isPluginStartupErrorFatal(ctx, namespacedKVStore)

		allSec, err := secretsSql.GetAll(ctx)
		if err != nil {
			return nil
		}
		// We just set it again as the current secret store should be the plugin secret
		for _, sec := range allSec {
			err = s.secretsStore.Set(ctx, *sec.OrgId, *sec.Namespace, *sec.Type, sec.Value)
			if err != nil {
				return err
			}
		}
		s.logger.Debug("migrated unified secrets to plugin", "number of secrets", len(allSec))
		// as no err was returned, when we delete all the secrets from the sql store
		for index, sec := range allSec {
			err = secretsSql.Del(ctx, *sec.OrgId, *sec.Namespace, *sec.Type)
			if err != nil {
				s.logger.Error("plugin migrator encountered error while deleting unified secrets")
				if index == 0 && !wasFatal {
					// old unified secrets still exists, so plugin startup errors are still not fatal, unless they were before we started
					err := setPluginStartupErrorFatal(ctx, namespacedKVStore, false)
					if err != nil {
						s.logger.Error("error reverting plugin failure fatal status", "error", err.Error())
					} else {
						s.logger.Debug("application will continue to function without the secrets plugin")
					}
				}
				return err
			}
		}
		s.logger.Debug("deleted unified secrets after migration", "number of secrets", len(allSec))
	}
	return nil
}
