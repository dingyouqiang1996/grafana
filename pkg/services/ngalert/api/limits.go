package api

import (
	"context"

	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/quota"
	"github.com/grafana/grafana/pkg/setting"
)

func RegisterQuotas(cfg *setting.Cfg, qs quota.Service, rules RuleStore) error {
	defaultLimits, err := readQuotaConfig(cfg)
	if err != nil {
		return err
	}

	return qs.RegisterQuotaReporter(&quota.NewUsageReporter{
		TargetSrv:     models.QuotaTargetSrv,
		DefaultLimits: defaultLimits,
		Reporter:      UsageReporter(rules),
	})
}

func UsageReporter(store RuleStore) quota.UsageReporterFunc {
	return func(ctx context.Context, scopeParams *quota.ScopeParameters) (*quota.Map, error) {
		u := &quota.Map{}

		var orgID int64 = 0
		if scopeParams != nil {
			orgID = scopeParams.OrgID
		}

		if orgUsage, err := store.Count(ctx, orgID); err != nil {
			return u, err
		} else {
			tag, err := quota.NewTag(models.QuotaTargetSrv, models.QuotaTarget, quota.OrgScope)
			if err != nil {
				return u, err
			}
			u.Set(tag, orgUsage)
		}

		if globalUsage, err := store.Count(ctx, 0); err != nil {
			return u, err
		} else {
			tag, err := quota.NewTag(models.QuotaTargetSrv, models.QuotaTarget, quota.GlobalScope)
			if err != nil {
				return u, err
			}
			u.Set(tag, globalUsage)
		}

		return u, nil
	}
}

func readQuotaConfig(cfg *setting.Cfg) (*quota.Map, error) {
	limits := &quota.Map{}

	if cfg == nil {
		return limits, nil
	}

	var alertOrgQuota int64
	var alertGlobalQuota int64

	if cfg.UnifiedAlerting.IsEnabled() {
		alertOrgQuota = cfg.Quota.Org.AlertRule
		alertGlobalQuota = cfg.Quota.Global.AlertRule
	}

	globalQuotaTag, err := quota.NewTag(models.QuotaTargetSrv, models.QuotaTarget, quota.GlobalScope)
	if err != nil {
		return limits, err
	}
	orgQuotaTag, err := quota.NewTag(models.QuotaTargetSrv, models.QuotaTarget, quota.OrgScope)
	if err != nil {
		return limits, err
	}

	limits.Set(globalQuotaTag, alertGlobalQuota)
	limits.Set(orgQuotaTag, alertOrgQuota)
	return limits, nil
}
