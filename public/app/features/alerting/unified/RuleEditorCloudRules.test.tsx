import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { renderRuleEditor, ui } from 'test/helpers/alertingRuleEditor';
import { clickSelectOption } from 'test/helpers/selectOptionInTest';

import { selectors } from '@grafana/e2e-selectors';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction } from 'app/types';

import { searchFolders } from '../../manage-dashboards/state/actions';

import { fetchRulerRules, fetchRulerRulesGroup, fetchRulerRulesNamespace, setRulerRuleGroup } from './api/ruler';
import { ExpressionEditorProps } from './components/rule-editor/ExpressionEditor';
import { mockFeatureDiscoveryApi, setupMswServer } from './mockApi';
import { grantUserPermissions, mockDataSource } from './mocks';
import { emptyExternalAlertmanagersResponse, mockAlertmanagersResponse } from './mocks/alertmanagerApi';
import { fetchRulerRulesIfNotFetchedYet } from './state/actions';
import { setupDataSources } from './testSetup/datasources';
import { buildInfoResponse } from './testSetup/featureDiscovery';

jest.mock('./components/rule-editor/ExpressionEditor', () => ({
  // eslint-disable-next-line react/display-name
  ExpressionEditor: ({ value, onChange }: ExpressionEditorProps) => (
    <input value={value} data-testid="expr" onChange={(e) => onChange(e.target.value)} />
  ),
}));

jest.mock('./api/ruler');
jest.mock('../../../../app/features/manage-dashboards/state/actions');

jest.mock('./components/rule-editor/util', () => {
  const originalModule = jest.requireActual('./components/rule-editor/util');
  return {
    ...originalModule,
    getThresholdsForQueries: jest.fn(() => ({})),
  };
});

const dataSources = {
  default: mockDataSource({ type: 'prometheus', name: 'Prom', isDefault: true }, { alerting: true }),
};

jest.mock('app/core/components/AppChrome/AppChromeUpdate', () => ({
  AppChromeUpdate: ({ actions }: { actions: React.ReactNode }) => <div>{actions}</div>,
}));

setupDataSources(dataSources.default);

const server = setupMswServer();

mockFeatureDiscoveryApi(server).discoverDsFeatures(dataSources.default, buildInfoResponse.mimir);
mockAlertmanagersResponse(server, emptyExternalAlertmanagersResponse);

// these tests are rather slow because we have to wait for various API calls and mocks to be called
// and wait for the UI to be in particular states, drone seems to time out quite often so
// we're increasing the timeout here to remove the flakey-ness of this test
// ideally we'd move this to an e2e test but it's quite involved to set up the test environment
jest.setTimeout(60 * 1000);

const mocks = {
  searchFolders: jest.mocked(searchFolders),
  api: {
    fetchRulerRulesGroup: jest.mocked(fetchRulerRulesGroup),
    setRulerRuleGroup: jest.mocked(setRulerRuleGroup),
    fetchRulerRulesNamespace: jest.mocked(fetchRulerRulesNamespace),
    fetchRulerRules: jest.mocked(fetchRulerRules),
    fetchRulerRulesIfNotFetchedYet: jest.mocked(fetchRulerRulesIfNotFetchedYet),
  },
};

describe('RuleEditor cloud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    contextSrv.isEditor = true;
    contextSrv.hasEditPermissionInFolders = true;
    grantUserPermissions([
      AccessControlAction.AlertingRuleRead,
      AccessControlAction.AlertingRuleUpdate,
      AccessControlAction.AlertingRuleDelete,
      AccessControlAction.AlertingRuleCreate,
      AccessControlAction.DataSourcesRead,
      AccessControlAction.DataSourcesWrite,
      AccessControlAction.DataSourcesCreate,
      AccessControlAction.AlertingRuleExternalRead,
      AccessControlAction.AlertingRuleExternalWrite,
    ]);
  });

  it('can create a new cloud alert', async () => {
    mocks.api.setRulerRuleGroup.mockResolvedValue();
    mocks.api.fetchRulerRulesNamespace.mockResolvedValue([]);
    mocks.api.fetchRulerRulesGroup.mockResolvedValue({
      name: 'group2',
      rules: [],
    });
    mocks.api.fetchRulerRules.mockResolvedValue({
      namespace1: [
        {
          name: 'group1',
          rules: [],
        },
      ],
      namespace2: [
        {
          name: 'group2',
          rules: [],
        },
      ],
    });
    mocks.searchFolders.mockResolvedValue([]);

    const user = userEvent.setup();

    renderRuleEditor();
    await waitForElementToBeRemoved(screen.queryAllByTestId('Spinner'));

    const removeExpressionsButtons = screen.getAllByLabelText('Remove expression');
    expect(removeExpressionsButtons).toHaveLength(2);

    // Needs to wait for featrue discovery API call to finish - Check if ruler enabled
    expect(await screen.findByText('Data source-managed')).toBeInTheDocument();

    const switchToCloudButton = screen.getByText('Data source-managed');
    expect(switchToCloudButton).toBeInTheDocument();
    expect(switchToCloudButton).toBeEnabled();

    await user.click(switchToCloudButton);

    //expressions are removed after switching to data-source managed
    expect(screen.queryAllByLabelText('Remove expression')).toHaveLength(0);

    expect(screen.getByTestId(selectors.components.DataSourcePicker.inputV2)).toBeInTheDocument();

    const dataSourceSelect = await ui.inputs.dataSource.find();
    await user.click(dataSourceSelect);
    await user.click(screen.getByText('Prom'));
    await waitFor(() => expect(mocks.api.fetchRulerRules).toHaveBeenCalled());

    await user.type(await ui.inputs.expr.find(), 'up == 1');

    await user.type(ui.inputs.name.get(), 'my great new rule');
    await clickSelectOption(ui.inputs.namespace.get(), 'namespace2');
    await clickSelectOption(ui.inputs.group.get(), 'group2');

    await user.type(ui.inputs.annotationValue(0).get(), 'some summary');
    await user.type(ui.inputs.annotationValue(1).get(), 'some description');

    // TODO remove skipPointerEventsCheck once https://github.com/jsdom/jsdom/issues/3232 is fixed
    await user.click(ui.buttons.addLabel.get());

    // save and check what was sent to backend
    await user.click(ui.buttons.saveAndExit.get());
    await waitFor(() => expect(mocks.api.setRulerRuleGroup).toHaveBeenCalled());
    expect(mocks.api.setRulerRuleGroup).toHaveBeenCalledWith(
      { dataSourceName: 'Prom', apiVersion: 'config' },
      'namespace2',
      {
        name: 'group2',
        rules: [
          {
            alert: 'my great new rule',
            annotations: { description: 'some description', summary: 'some summary' },
            expr: 'up == 1',
            for: '1m',
            labels: {},
            keep_firing_for: undefined,
          },
        ],
      }
    );
  });
});
