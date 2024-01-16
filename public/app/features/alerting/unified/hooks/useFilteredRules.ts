import uFuzzy from '@leeoniya/ufuzzy';
import { produce } from 'immer';
import { chain, compact, isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';

import { getDataSourceSrv } from '@grafana/runtime';
import { Matcher } from 'app/plugins/datasource/alertmanager/types';
import { CombinedRuleGroup, CombinedRuleNamespace, Rule } from 'app/types/unified-alerting';
import { isPromAlertingRuleState, PromRuleType, RulerGrafanaRuleDTO } from 'app/types/unified-alerting-dto';

import { applySearchFilterToQuery, getSearchFilterFromQuery, RulesFilter } from '../search/rulesSearchParser';
import { labelsMatchMatchers, matcherToMatcherField, parseMatchers } from '../utils/alertmanager';
import { isCloudRulesSource } from '../utils/datasource';
import { parseMatcher } from '../utils/matchers';
import { getRuleHealth, isAlertingRule, isGrafanaRulerRule, isPromRuleType } from '../utils/rules';

import { calculateGroupTotals, calculateRuleFilteredTotals, calculateRuleTotals } from './useCombinedRuleNamespaces';
import { useURLSearchParams } from './useURLSearchParams';

export function useRulesFilter() {
  const [queryParams, updateQueryParams] = useURLSearchParams();
  const searchQuery = queryParams.get('search') ?? '';

  const filterState = useMemo(() => getSearchFilterFromQuery(searchQuery), [searchQuery]);
  const hasActiveFilters = useMemo(() => Object.values(filterState).some((filter) => !isEmpty(filter)), [filterState]);

  const updateFilters = useCallback(
    (newFilter: RulesFilter) => {
      const newSearchQuery = applySearchFilterToQuery(searchQuery, newFilter);
      updateQueryParams({ search: newSearchQuery });
    },
    [searchQuery, updateQueryParams]
  );

  const setSearchQuery = useCallback(
    (newSearchQuery: string | undefined) => {
      updateQueryParams({ search: newSearchQuery });
    },
    [updateQueryParams]
  );

  // Handle legacy filters
  useEffect(() => {
    const legacyFilters = {
      dataSource: queryParams.get('dataSource') ?? undefined,
      alertState: queryParams.get('alertState') ?? undefined,
      ruleType: queryParams.get('ruleType') ?? undefined,
      labels: parseMatchers(queryParams.get('queryString') ?? '').map(matcherToMatcherField),
    };

    const hasLegacyFilters = Object.values(legacyFilters).some((legacyFilter) => !isEmpty(legacyFilter));
    if (hasLegacyFilters) {
      updateQueryParams({ dataSource: undefined, alertState: undefined, ruleType: undefined, queryString: undefined });
      // Existing query filters takes precedence over legacy ones
      updateFilters(
        produce(filterState, (draft) => {
          draft.dataSourceNames ??= legacyFilters.dataSource ? [legacyFilters.dataSource] : [];
          if (legacyFilters.alertState && isPromAlertingRuleState(legacyFilters.alertState)) {
            draft.ruleState ??= legacyFilters.alertState;
          }
          if (legacyFilters.ruleType && isPromRuleType(legacyFilters.ruleType)) {
            draft.ruleType ??= legacyFilters.ruleType;
          }
          if (draft.labels.length === 0 && legacyFilters.labels.length > 0) {
            const legacyLabelsAsStrings = legacyFilters.labels.map(
              ({ name, operator, value }) => `${name}${operator}${value}`
            );
            draft.labels.push(...legacyLabelsAsStrings);
          }
        })
      );
    }
  }, [queryParams, updateFilters, filterState, updateQueryParams]);

  return { filterState, hasActiveFilters, searchQuery, setSearchQuery, updateFilters };
}

export const useFilteredRules = (namespaces: CombinedRuleNamespace[], filterState: RulesFilter) => {
  return useMemo(() => {
    const filteredRules = filterRules(namespaces, filterState);

    // Totals recalculation is a workaround for the lack of server-side filtering
    filteredRules.forEach((namespace) => {
      namespace.groups.forEach((group) => {
        group.rules.forEach((rule) => {
          if (isAlertingRule(rule.promRule)) {
            rule.instanceTotals = calculateRuleTotals(rule.promRule);
            rule.filteredInstanceTotals = calculateRuleFilteredTotals(rule.promRule);
          }
        });

        group.totals = calculateGroupTotals({
          rules: group.rules.map((r) => r.promRule).filter((r): r is Rule => !!r),
        });
      });
    });

    return filteredRules;
  }, [namespaces, filterState]);
};

// Options details can be found here https://github.com/leeoniya/uFuzzy#options
// The following configuration complies with Damerau-Levenshtein distance
// https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
const ufuzzy = new uFuzzy({
  intraMode: 1,
  intraIns: 1,
  intraSub: 1,
  intraTrn: 1,
  intraDel: 1,
});

export const filterRules = (
  namespaces: CombinedRuleNamespace[],
  filterState: RulesFilter = { dataSourceNames: [], labels: [], freeFormWords: [] }
): CombinedRuleNamespace[] => {
  let filteredNamespaces = namespaces;

  const dataSourceFilter = filterState.dataSourceNames;
  if (dataSourceFilter.length) {
    filteredNamespaces = filteredNamespaces.filter(({ rulesSource }) =>
      isCloudRulesSource(rulesSource) ? dataSourceFilter.includes(rulesSource.name) : true
    );
  }

  const namespaceFilter = filterState.namespace;

  if (namespaceFilter) {
    const namespaceHaystack = filteredNamespaces.map((ns) => ns.name);

    const [idxs, info, order] = ufuzzy.search(namespaceHaystack, namespaceFilter);
    if (info && order) {
      filteredNamespaces = order.map((idx) => filteredNamespaces[info.idx[idx]]);
    } else if (idxs) {
      filteredNamespaces = idxs.map((idx) => filteredNamespaces[idx]);
    }
  }

  // If a namespace and group have rules that match the rules filters then keep them.
  return filteredNamespaces.reduce<CombinedRuleNamespace[]>(reduceNamespaces(filterState), []);
};

const reduceNamespaces = (filterState: RulesFilter) => {
  return (namespaceAcc: CombinedRuleNamespace[], namespace: CombinedRuleNamespace) => {
    const groupNameFilter = filterState.groupName;
    let filteredGroups = namespace.groups;

    if (groupNameFilter) {
      const groupsHaystack = filteredGroups.map((g) => g.name);
      const [idxs, info, order] = ufuzzy.search(groupsHaystack, groupNameFilter);
      if (info && order) {
        filteredGroups = order.map((idx) => filteredGroups[info.idx[idx]]);
      } else if (idxs) {
        filteredGroups = idxs.map((idx) => filteredGroups[idx]);
      }
    }

    filteredGroups = filteredGroups.reduce<CombinedRuleGroup[]>(reduceGroups(filterState), []);

    if (filteredGroups.length) {
      namespaceAcc.push({
        ...namespace,
        groups: filteredGroups,
      });
    }

    return namespaceAcc;
  };
};

// Reduces groups to only groups that have rules matching the filters
const reduceGroups = (filterState: RulesFilter) => {
  const ruleNameQuery = filterState.ruleName ?? filterState.freeFormWords.join(' ');

  return (groupAcc: CombinedRuleGroup[], group: CombinedRuleGroup) => {
    let filteredRules = group.rules;

    if (ruleNameQuery) {
      const rulesHaystack = filteredRules.map((r) => r.name);
      const [idxs, info, order] = ufuzzy.search(rulesHaystack, ruleNameQuery);
      if (info && order) {
        filteredRules = order.map((idx) => filteredRules[info.idx[idx]]);
      } else if (idxs) {
        filteredRules = idxs.map((idx) => filteredRules[idx]);
      }
    }

    filteredRules = filteredRules.filter((rule) => {
      const promRuleDefition = rule.promRule;

      // this will track what properties we're checking predicates for
      // all predicates must be "true" to include the rule in the result set
      // (this will result in an AND operation for our matchers)
      const matchesFilterFor = chain(filterState)
        // ⚠️ keep this list of properties we filter for here up-to-date ⚠️
        // We are ignoring predicates we've matched before we get here (like "freeFormWords")
        .pick(['ruleType', 'dataSourceNames', 'ruleHealth', 'labels', 'ruleState'])
        .omitBy(isEmpty)
        .mapValues(() => false)
        .value();

      if ('ruleType' in matchesFilterFor && filterState.ruleType === promRuleDefition?.type) {
        matchesFilterFor.ruleType = true;
      }

      if ('dataSourceNames' in matchesFilterFor) {
        const doesNotQueryDs = isGrafanaRulerRule(rule.rulerRule) && isQueryingDataSource(rule.rulerRule, filterState);

        if (doesNotQueryDs) {
          matchesFilterFor.dataSourceNames = true;
        }
      }

      if ('ruleHealth' in filterState && promRuleDefition) {
        const ruleHealth = getRuleHealth(promRuleDefition.health);
        const match = filterState.ruleHealth === ruleHealth;

        if (match) {
          matchesFilterFor.ruleHealth = true;
        }
      }

      // Query strings can match alert name, label keys, and label values
      if ('labels' in matchesFilterFor) {
        const matchers = compact(filterState.labels.map(looseParseMatcher));

        // check if the label we query for exists in _either_ the rule definition or in any of its alerts
        const doRuleLabelsMatchQuery = matchers.length > 0 && labelsMatchMatchers(rule.labels, matchers);
        const doAlertsContainMatchingLabels =
          matchers.length > 0 &&
          promRuleDefition &&
          promRuleDefition.type === PromRuleType.Alerting &&
          promRuleDefition.alerts &&
          promRuleDefition.alerts.some((alert) => labelsMatchMatchers(alert.labels, matchers));

        if (doRuleLabelsMatchQuery || doAlertsContainMatchingLabels) {
          matchesFilterFor.labels = true;
        }
      }

      if ('ruleState' in matchesFilterFor) {
        const promRule = rule.promRule;
        const hasPromRuleDefinition = promRule && isAlertingRule(promRule);

        const ruleStateMatches = hasPromRuleDefinition && promRule.state === filterState.ruleState;

        if (ruleStateMatches) {
          matchesFilterFor.ruleState = true;
        }
      }

      return Object.values(matchesFilterFor).every((match) => match === true);
    });

    // Add rules to the group that match the rule list filters
    if (filteredRules.length) {
      groupAcc.push({
        ...group,
        rules: filteredRules,
      });
    }
    return groupAcc;
  };
};

function looseParseMatcher(matcherQuery: string): Matcher | undefined {
  try {
    return parseMatcher(matcherQuery);
  } catch {
    // Try to createa a matcher than matches all values for a given key
    return { name: matcherQuery, value: '', isRegex: true, isEqual: true };
  }
}

const isQueryingDataSource = (rulerRule: RulerGrafanaRuleDTO, filterState: RulesFilter): boolean => {
  if (!filterState.dataSourceNames?.length) {
    return true;
  }

  return !!rulerRule.grafana_alert.data.find((query) => {
    if (!query.datasourceUid) {
      return false;
    }
    const ds = getDataSourceSrv().getInstanceSettings(query.datasourceUid);
    return ds?.name && filterState?.dataSourceNames?.includes(ds.name);
  });
};
