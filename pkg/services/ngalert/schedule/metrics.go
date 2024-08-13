package schedule

import (
	"fmt"
	"hash/fnv"
	"sort"

	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	models "github.com/grafana/grafana/pkg/services/ngalert/models"
)

// hashUIDs returns a fnv64 hash of the UIDs for all alert rules.
// The order of the alert rules does not matter as hashUIDs sorts
// the UIDs in increasing order.
func hashUIDs(alertRules []*models.AlertRule) uint64 {
	h := fnv.New64()
	for _, uid := range sortedUIDs(alertRules) {
		// We can ignore err as fnv64 does not return an error
		// nolint:errcheck,gosec
		h.Write([]byte(uid))
	}
	return h.Sum64()
}

// sortedUIDs returns a slice of sorted UIDs.
func sortedUIDs(alertRules []*models.AlertRule) []string {
	uids := make([]string, 0, len(alertRules))
	for _, alertRule := range alertRules {
		uids = append(uids, alertRule.UID)
	}
	sort.Strings(uids)
	return uids
}

type ruleKey struct {
	orgID    int64
	ruleType models.RuleType
	state    string
}

func (sch *schedule) updateRulesMetrics(alertRules []*models.AlertRule) {
	// main rule_group_rules metric labels
	buckets := make(map[ruleKey]int64)
	// gauge for rules with notification settings per org
	orgsNfSettings := make(map[int64]int64)
	// gauge for groups per org
	groupsPerOrg := make(map[int64]map[string]struct{})

	for _, rule := range alertRules {
		// Count rules by org, type and state
		state := metrics.AlertRuleActiveLabelValue
		if rule.IsPaused {
			state = metrics.AlertRulePausedLabelValue
		}
		key := ruleKey{
			orgID:    rule.OrgID,
			ruleType: rule.Type(),
			state:    state,
		}
		buckets[key]++

		// Count rules with notification settings per org
		if len(rule.NotificationSettings) > 0 {
			orgsNfSettings[rule.OrgID]++
		}

		// Count groups per org
		orgGroups, ok := groupsPerOrg[rule.OrgID]
		if !ok {
			orgGroups = make(map[string]struct{})
			groupsPerOrg[rule.OrgID] = orgGroups
		}
		orgGroups[rule.RuleGroup] = struct{}{}
	}

	// Set metrics
	sch.metrics.GroupRules.Reset()
	for key, count := range buckets {
		sch.metrics.GroupRules.WithLabelValues(fmt.Sprint(key.orgID), key.ruleType.String(), key.state).Set(float64(count))
	}
	for orgID, numRulesNfSettings := range orgsNfSettings {
		sch.metrics.SimpleNotificationRules.WithLabelValues(fmt.Sprint(orgID)).Set(float64(numRulesNfSettings))
	}
	for orgID, groups := range groupsPerOrg {
		sch.metrics.Groups.WithLabelValues(fmt.Sprint(orgID)).Set(float64(len(groups)))
	}
	// While these are the rules that we iterate over, at the moment there's no 100% guarantee that they'll be
	// scheduled as rules could be removed before we get a chance to evaluate them.
	sch.metrics.SchedulableAlertRules.Set(float64(len(alertRules)))
	sch.metrics.SchedulableAlertRulesHash.Set(float64(hashUIDs(alertRules)))
}
