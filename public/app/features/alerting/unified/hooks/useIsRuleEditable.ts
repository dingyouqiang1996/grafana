import { contextSrv } from 'app/core/services/context_srv';
import { RulerRuleDTO } from 'app/types/unified-alerting-dto';

import { getRulesPermissions } from '../utils/access-control';
import { isGrafanaRulerRule } from '../utils/rules';

import { useFolder } from './useFolder';
import { useUnifiedAlertingSelector } from './useUnifiedAlertingSelector';

interface ResultBag {
  isEditable?: boolean;
  isRemovable?: boolean;
  loading: boolean;
}

export function useIsRuleEditable(rulesSourceName: string, rule?: RulerRuleDTO): ResultBag {
  const dataSources = useUnifiedAlertingSelector((state) => state.dataSources);
  const folderUID = rule && isGrafanaRulerRule(rule) ? rule.grafana_alert.namespace_uid : undefined;

  const rulePermission = getRulesPermissions(rulesSourceName);

  const { folder, loading } = useFolder(folderUID);

  if (!rule) {
    return { isEditable: false, isRemovable: false, loading: false };
  }

  // Grafana rules can be edited if user can edit the folder they're in
  // When RBAC is disabled access to a folder is the only requirement for managing rules
  if (isGrafanaRulerRule(rule)) {
    if (!folderUID) {
      throw new Error(
        `Rule ${rule.grafana_alert.title} does not have a folder uid, cannot determine if it is editable.`
      );
    }
    return {
      isEditable: contextSrv.hasAccess(rulePermission.update, folder?.canSave ?? false),
      isRemovable: contextSrv.hasAccess(rulePermission.delete, folder?.canSave ?? false),
      loading,
    };
  }

  // prom rules are only editable by users with Editor role and only if rules source supports editing
  const isRulerAvailable = Boolean(dataSources[rulesSourceName]?.result?.rulerConfig);
  return {
    isEditable: contextSrv.hasAccess(rulePermission.update, contextSrv.isEditor) && isRulerAvailable,
    isRemovable: contextSrv.hasAccess(rulePermission.delete, contextSrv.isEditor) && isRulerAvailable,
    loading: dataSources[rulesSourceName]?.loading,
  };
}
