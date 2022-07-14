package rules

import (
	"context"
	"errors"
	"fmt"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/dashboards"
	alert_models "github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/provisioning"
	"github.com/grafana/grafana/pkg/util"
)

type AlertRuleProvisioner interface {
	Provision(ctx context.Context, path string) error
}

func NewAlertRuleProvisioner(
	logger log.Logger,
	dashboardService dashboards.DashboardService,
	dashboardProvService dashboards.DashboardProvisioningService,
	ruleService provisioning.AlertRuleService) AlertRuleProvisioner {
	return &defaultAlertRuleProvisioner{
		logger:               logger,
		cfgReader:            newRulesConfigReader(logger),
		dashboardService:     dashboardService,
		dashboardProvService: dashboardProvService,
		ruleService:          ruleService,
	}
}

type defaultAlertRuleProvisioner struct {
	logger               log.Logger
	cfgReader            rulesConfigReader
	dashboardService     dashboards.DashboardService
	dashboardProvService dashboards.DashboardProvisioningService
	ruleService          provisioning.AlertRuleService
}

func Provision(
	ctx context.Context,
	path string,
	dashboardService dashboards.DashboardService,
	dashboardProvisioningService dashboards.DashboardProvisioningService,
	ruleService provisioning.AlertRuleService,
) error {
	ruleProvisioner := NewAlertRuleProvisioner(
		log.New("provisioning.alerting"),
		dashboardService,
		dashboardProvisioningService,
		ruleService,
	)
	return ruleProvisioner.Provision(ctx, path)
}

func (prov *defaultAlertRuleProvisioner) Provision(ctx context.Context,
	path string) error {
	prov.logger.Info("starting to provision the alert rules")
	ruleFiles, err := prov.cfgReader.readConfig(ctx, path)
	if err != nil {
		return fmt.Errorf("failed to read alert rules files: %w", err)
	}
	prov.logger.Debug("read all alert rules files", "file_count", len(ruleFiles))
	err = prov.provsionRuleFiles(ctx, ruleFiles)
	if err != nil {
		return fmt.Errorf("failed to provision alert rules: %w", err)
	}
	prov.logger.Info("finished to provision the alert rules")
	return nil
}

func (prov *defaultAlertRuleProvisioner) provsionRuleFiles(ctx context.Context,
	ruleFiles []*RuleFile) error {
	for _, file := range ruleFiles {
		for _, group := range file.Groups {
			folderUID, err := prov.getOrCreateFolderUID(ctx, group.Folder, group.OrgID)
			if err != nil {
				return err
			}
			prov.logger.Debug("provisioning alert rule group",
				"org", group.OrgID,
				"folder", group.Folder,
				"folderUID", folderUID,
				"name", group.Name)
			for _, rule := range group.Rules {
				rule.NamespaceUID = folderUID
				rule.RuleGroup = group.Name
				err = prov.provisionRule(ctx, group.OrgID, rule, group.Folder, folderUID)
				if err != nil {
					return err
				}
			}
			err = prov.ruleService.UpdateRuleGroup(ctx, group.OrgID, folderUID, group.Name, int64(group.Interval.Seconds()))
			if err != nil {
				return err
			}
		}
		for _, deleteRule := range file.DeleteRules {
			err := prov.ruleService.DeleteAlertRule(ctx, deleteRule.OrgID,
				deleteRule.UID, alert_models.ProvenanceFile)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (prov *defaultAlertRuleProvisioner) provisionRule(
	ctx context.Context,
	orgID int64,
	rule alert_models.AlertRule,
	folder,
	folderUID string) error {
	prov.logger.Debug("provisioning alert rule", "uid", rule.UID, "org", rule.OrgID)
	_, _, err := prov.ruleService.GetAlertRule(ctx, orgID, rule.UID)
	if err != nil && !errors.Is(err, alert_models.ErrAlertRuleNotFound) {
		return err
	} else if err != nil {
		prov.logger.Debug("creating rule", "uid", rule.UID, "org", rule.OrgID)
		_, err = prov.ruleService.CreateAlertRule(ctx, rule, alert_models.ProvenanceFile)
	} else {
		prov.logger.Debug("updating rule", "uid", rule.UID, "org", rule.OrgID)
		_, err = prov.ruleService.UpdateAlertRule(ctx, rule, alert_models.ProvenanceFile)
	}
	return err
}

func (prov *defaultAlertRuleProvisioner) getOrCreateFolderUID(
	ctx context.Context, folderName string, orgID int64) (string, error) {
	cmd := &models.GetDashboardQuery{
		Slug:  models.SlugifyTitle(folderName),
		OrgId: orgID,
	}
	err := prov.dashboardService.GetDashboard(ctx, cmd)
	if err != nil && !errors.Is(err, dashboards.ErrDashboardNotFound) {
		return "", err
	}

	// dashboard folder not found. create one.
	if errors.Is(err, dashboards.ErrDashboardNotFound) {
		dash := &dashboards.SaveDashboardDTO{}
		dash.Dashboard = models.NewDashboardFolder(folderName)
		dash.Dashboard.IsFolder = true
		dash.Overwrite = true
		dash.OrgId = orgID
		dash.Dashboard.SetUid(util.GenerateShortUID())
		dbDash, err := prov.dashboardProvService.SaveFolderForProvisionedDashboards(ctx, dash)
		if err != nil {
			return "", err
		}

		return dbDash.Uid, nil
	}

	if !cmd.Result.IsFolder {
		return "", fmt.Errorf("got invalid response. expected folder, found dashboard")
	}

	return cmd.Result.Uid, nil
}
