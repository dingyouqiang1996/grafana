import { renderHook, waitFor } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import { PropsWithChildren } from 'react';
import { Router } from 'react-router-dom';
import { TestProvider } from 'test/helpers/TestProvider';
import { render, screen } from 'test/test-utils';

import { setupMswServer } from 'app/features/alerting/unified/mockApi';
import { setFolderAccessControl } from 'app/features/alerting/unified/mocks/server/configure';
import { AlertManagerDataSourceJsonData, AlertManagerImplementation } from 'app/plugins/datasource/alertmanager/types';
import { AccessControlAction } from 'app/types';
import { CombinedRule } from 'app/types/unified-alerting';

import { getCloudRule, getGrafanaRule, grantUserPermissions, mockDataSource } from '../mocks';
import { AlertmanagerProvider } from '../state/AlertmanagerContext';
import { setupDataSources } from '../testSetup/datasources';
import { DataSourceType, GRAFANA_RULES_SOURCE_NAME } from '../utils/datasource';

import {
  AlertRuleAction,
  AlertmanagerAction,
  useAlertmanagerAbilities,
  useAlertmanagerAbility,
  useAllAlertRuleAbilities,
  useAllAlertmanagerAbilities,
} from './useAbilities';

/**
 * This test will write snapshots with a record of the current permissions assigned to actions.
 * We encourage that every change to the snapshot is inspected _very_ thoroughly!
 */
describe('alertmanager abilities', () => {
  it("should report Create / Update / Delete actions aren't supported for external vanilla alertmanager", () => {
    setupDataSources(
      mockDataSource<AlertManagerDataSourceJsonData>({
        name: GRAFANA_RULES_SOURCE_NAME,
        type: DataSourceType.Alertmanager,
        jsonData: { implementation: AlertManagerImplementation.prometheus },
      })
    );

    const abilities = renderHook(() => useAllAlertmanagerAbilities(), {
      wrapper: createAlertmanagerWrapper('does-not-exist'),
    });
    expect(abilities.result.current).toMatchSnapshot();
  });

  it('should report everything is supported for builtin alertmanager', () => {
    setupDataSources(
      mockDataSource<AlertManagerDataSourceJsonData>({
        name: GRAFANA_RULES_SOURCE_NAME,
        type: DataSourceType.Alertmanager,
      })
    );

    grantUserPermissions([AccessControlAction.AlertingNotificationsRead, AccessControlAction.AlertingInstanceRead]);

    const abilities = renderHook(() => useAllAlertmanagerAbilities(), {
      wrapper: createAlertmanagerWrapper(GRAFANA_RULES_SOURCE_NAME),
    });

    Object.values(abilities.result.current).forEach(([supported]) => {
      expect(supported).toBe(true);
    });

    // since we only granted "read" permissions, only those should be allowed
    const viewAbility = renderHook(() => useAlertmanagerAbility(AlertmanagerAction.ViewSilence), {
      wrapper: createAlertmanagerWrapper(GRAFANA_RULES_SOURCE_NAME),
    });

    const [viewSupported, viewAllowed] = viewAbility.result.current;

    expect(viewSupported).toBe(true);
    expect(viewAllowed).toBe(true);

    // editing should not be allowed, but supported
    const editAbility = renderHook(() => useAlertmanagerAbility(AlertmanagerAction.ViewSilence), {
      wrapper: createAlertmanagerWrapper(GRAFANA_RULES_SOURCE_NAME),
    });

    const [editSupported, editAllowed] = editAbility.result.current;

    expect(editSupported).toBe(true);
    expect(editAllowed).toBe(true);

    // record the snapshot to prevent future regressions
    expect(abilities.result.current).toMatchSnapshot();
  });

  it('should report everything except exporting for Mimir alertmanager', () => {
    setupDataSources(
      mockDataSource<AlertManagerDataSourceJsonData>({
        name: 'mimir',
        type: DataSourceType.Alertmanager,
        jsonData: {
          implementation: AlertManagerImplementation.mimir,
        },
      })
    );

    grantUserPermissions([
      AccessControlAction.AlertingNotificationsExternalRead,
      AccessControlAction.AlertingNotificationsExternalWrite,
      AccessControlAction.AlertingInstancesExternalRead,
      AccessControlAction.AlertingInstancesExternalWrite,
    ]);

    const abilities = renderHook(() => useAllAlertmanagerAbilities(), {
      wrapper: createAlertmanagerWrapper('mimir'),
    });

    expect(abilities.result.current).toMatchSnapshot();
  });

  it('should be able to return multiple abilities', () => {
    setupDataSources(
      mockDataSource<AlertManagerDataSourceJsonData>({
        name: GRAFANA_RULES_SOURCE_NAME,
        type: DataSourceType.Alertmanager,
      })
    );

    grantUserPermissions([AccessControlAction.AlertingNotificationsRead]);

    const abilities = renderHook(
      () =>
        useAlertmanagerAbilities([
          AlertmanagerAction.ViewContactPoint,
          AlertmanagerAction.CreateContactPoint,
          AlertmanagerAction.ExportContactPoint,
        ]),
      {
        wrapper: createAlertmanagerWrapper(GRAFANA_RULES_SOURCE_NAME),
      }
    );

    expect(abilities.result.current).toHaveLength(3);
    expect(abilities.result.current[0]).toStrictEqual([true, true]);
    expect(abilities.result.current[1]).toStrictEqual([true, false]);
    expect(abilities.result.current[2]).toStrictEqual([true, true]);
  });
});

setupMswServer();

/**
 * Render the hook result in a component so we can more reliably check that the result has settled
 * after API requests. Without this approach, the hook might return `[false, false]` whilst
 * API requests are still loading
 */
const RenderActionPermissions = ({ rule, action }: { rule: CombinedRule; action: AlertRuleAction }) => {
  const result = useAllAlertRuleAbilities(rule);
  const [isSupported, isAllowed] = result[action];
  return (
    <>
      {isSupported && 'supported'}
      {isAllowed && 'allowed'}
    </>
  );
};

describe('AlertRule abilities', () => {
  it('should report that all actions are supported for a Grafana Managed alert rule', async () => {
    const rule = getGrafanaRule();

    const abilities = renderHook(() => useAllAlertRuleAbilities(rule), { wrapper: TestProvider });

    await waitFor(() => {
      const results = Object.values(abilities.result.current);

      for (const [supported, _allowed] of results) {
        expect(supported).toBe(true);
      }
    });

    expect(abilities.result.current).toMatchSnapshot();
  });

  it('grants correct silence permissions for folder with silence create permission', async () => {
    setFolderAccessControl({ [AccessControlAction.AlertingSilenceCreate]: true });

    const rule = getGrafanaRule();

    render(<RenderActionPermissions rule={rule} action={AlertRuleAction.Silence} />);

    expect(await screen.findByText(/supported/)).toBeInTheDocument();
    expect(await screen.findByText(/allowed/)).toBeInTheDocument();
  });

  it('does not grant silence permissions for folder without silence create permission', async () => {
    setFolderAccessControl({ [AccessControlAction.AlertingSilenceCreate]: false });

    const rule = getGrafanaRule();

    render(<RenderActionPermissions rule={rule} action={AlertRuleAction.Silence} />);

    expect(await screen.findByText(/supported/)).toBeInTheDocument();
    expect(screen.queryByText(/allowed/)).not.toBeInTheDocument();
  });

  it('should report no permissions while we are loading data for cloud rule', async () => {
    const rule = getCloudRule();

    const abilities = renderHook(() => useAllAlertRuleAbilities(rule), { wrapper: TestProvider });

    await waitFor(() => {
      expect(abilities.result.current).not.toBeUndefined();
    });

    expect(abilities.result.current).toMatchSnapshot();
  });

  it('should not allow certain actions for provisioned rules', () => {});

  it('should not allow certain actions for federated rules', () => {});
});

function createAlertmanagerWrapper(alertmanagerSourceName: string) {
  const wrapper = (props: PropsWithChildren) => (
    <Router history={createBrowserHistory()}>
      <AlertmanagerProvider accessType={'notification'} alertmanagerSourceName={alertmanagerSourceName}>
        {props.children}
      </AlertmanagerProvider>
    </Router>
  );

  return wrapper;
}
