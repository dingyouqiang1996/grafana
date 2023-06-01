import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { byRole, byText } from 'testing-library-selector';

import { FieldType } from '@grafana/data';

import { TestProvider } from '../../../../../../../test/helpers/TestProvider';
import { MatcherOperator } from '../../../../../../plugins/datasource/alertmanager/types';
import { Labels } from '../../../../../../types/unified-alerting-dto';
import { mockApi, setupMswServer } from '../../../mockApi';
import { mockAlertQuery } from '../../../mocks';
import { mockPreviewApiResponse } from '../../../mocks/alertRuleApi';
import * as dataSource from '../../../utils/datasource';
import { GRAFANA_RULES_SOURCE_NAME } from '../../../utils/datasource';

import * as notificationPreview from './NotificationPreview';
import {
  NotificationPreview,
  NotificationPreviewByAlertManager,
  useGetAlertManagersSourceNamesAndImage,
} from './NotificationPreview';

import 'core-js/stable/structured-clone';

jest.mock('../../../createRouteGroupsMatcherWorker');

jest
  .spyOn(notificationPreview, 'useGetAlertManagersSourceNamesAndImage')
  .mockReturnValue([{ name: GRAFANA_RULES_SOURCE_NAME, img: '' }]);
jest.spyOn(notificationPreview, 'useGetAlertManagersSourceNamesAndImage').mockReturnValue([
  { name: GRAFANA_RULES_SOURCE_NAME, img: '' },
  { name: GRAFANA_RULES_SOURCE_NAME, img: '' },
]);

jest.spyOn(dataSource, 'getDatasourceAPIUid').mockImplementation((ds: string) => ds);

const useGetAlertManagersSourceNamesAndImageMock = useGetAlertManagersSourceNamesAndImage as jest.MockedFunction<
  typeof useGetAlertManagersSourceNamesAndImage
>;

const ui = {
  routeButton: byRole('button', { name: /Notification policy/ }),
  loadingIndicator: byText('Loading routing preview...'),
  previewButton: byRole('button', { name: /preview routing/i }),
  grafanaAlertManagerLabel: byText(/alert manager:grafana/i),
  otherAlertManagerLabel: byText(/alert manager:other_am/i),
  seeDetails: byText(/see details/i),
  details: {
    title: byRole('heading', { name: /alert routing details/i }),
    modal: byRole('dialog'),
  },
};

const server = setupMswServer();

beforeEach(() => {
  jest.clearAllMocks();
});

const alertQuery = mockAlertQuery({ datasourceUid: 'whatever', refId: 'A' });

function mockOneAlertManager() {
  useGetAlertManagersSourceNamesAndImageMock.mockReturnValue([{ name: GRAFANA_RULES_SOURCE_NAME, img: '' }]);
  mockApi(server).getAlertmanagerConfig(GRAFANA_RULES_SOURCE_NAME, (amConfigBuilder) =>
    amConfigBuilder
      .withRoute((routeBuilder) =>
        routeBuilder
          .withReceiver('email')
          .addRoute((rb) => rb.withReceiver('slack').addMatcher('tomato', MatcherOperator.equal, 'red'))
          .addRoute((rb) => rb.withReceiver('opsgenie').addMatcher('team', MatcherOperator.equal, 'operations'))
      )
      .addReceivers((b) => b.withName('email').addEmailConfig((eb) => eb.withTo('test@example.com')))
      .addReceivers((b) => b.withName('slack'))
      .addReceivers((b) => b.withName('opsgenie'))
  );
}

function mockTwoAlertManagers() {
  useGetAlertManagersSourceNamesAndImageMock.mockReturnValue([
    { name: GRAFANA_RULES_SOURCE_NAME, img: '' },
    { name: 'OTHER_AM', img: '' },
  ]);
  mockApi(server).getAlertmanagerConfig(GRAFANA_RULES_SOURCE_NAME, (amConfigBuilder) =>
    amConfigBuilder
      .withRoute((routeBuilder) =>
        routeBuilder
          .withReceiver('email')
          .addRoute((rb) => rb.withReceiver('slack').addMatcher('tomato', MatcherOperator.equal, 'red'))
          .addRoute((rb) => rb.withReceiver('opsgenie').addMatcher('team', MatcherOperator.equal, 'operations'))
      )
      .addReceivers((b) => b.withName('email').addEmailConfig((eb) => eb.withTo('test@example.com')))
      .addReceivers((b) => b.withName('slack'))
      .addReceivers((b) => b.withName('opsgenie'))
  );
  mockApi(server).getAlertmanagerConfig('OTHER_AM', (amConfigBuilder) =>
    amConfigBuilder
      .withRoute((routeBuilder) =>
        routeBuilder
          .withReceiver('email')
          .addRoute((rb) => rb.withReceiver('slack').addMatcher('tomato', MatcherOperator.equal, 'red'))
          .addRoute((rb) => rb.withReceiver('opsgenie').addMatcher('team', MatcherOperator.equal, 'operations'))
      )
      .addReceivers((b) => b.withName('email').addEmailConfig((eb) => eb.withTo('test@example.com')))
      .addReceivers((b) => b.withName('slack'))
      .addReceivers((b) => b.withName('opsgenie'))
  );
}

describe('NotificationPreview', () => {
  it('should render notification preview without alert manager label, when having only one alert manager configured to receive alerts', async () => {
    mockOneAlertManager();
    mockPreviewApiResponse(server, {
      schema: {
        fields: [
          { name: 'value', type: FieldType.number, labels: { tomato: 'red', avocate: 'green' } },
          { name: 'value', type: FieldType.number },
        ],
      },
    });

    render(<NotificationPreview alertQueries={[alertQuery]} customLabels={[]} condition="" />, {
      wrapper: TestProvider,
    });
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });
    await userEvent.click(ui.previewButton.get());
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });
    // we expect the alert manager label to be missing as there is only one alert manager configured to receive alerts
    expect(ui.grafanaAlertManagerLabel.query()).not.toBeInTheDocument();
    expect(ui.otherAlertManagerLabel.query()).not.toBeInTheDocument();

    const matchingPoliciesElements = ui.routeButton.queryAll();
    expect(matchingPoliciesElements).toHaveLength(1);
    expect(matchingPoliciesElements[0]).toHaveTextContent(/tomato = red/);
  });
  it('should render notification preview with alert manager sections, when having more than one alert manager configured to receive alerts', async () => {
    // two alert managers configured  to receive alerts
    mockTwoAlertManagers();
    mockPreviewApiResponse(server, {
      schema: {
        fields: [
          { name: 'value', type: FieldType.number, labels: { tomato: 'red', avocate: 'green' } },
          { name: 'value', type: FieldType.number },
        ],
      },
    });

    render(<NotificationPreview alertQueries={[alertQuery]} customLabels={[]} condition="" />, {
      wrapper: TestProvider,
    });
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });

    await userEvent.click(ui.previewButton.get());
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });

    // we expect the alert manager label to be present as there is more than one alert manager configured to receive alerts
    expect(ui.grafanaAlertManagerLabel.query()).toBeInTheDocument();
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });

    expect(ui.otherAlertManagerLabel.query()).toBeInTheDocument();

    const matchingPoliciesElements = ui.routeButton.queryAll();
    expect(matchingPoliciesElements).toHaveLength(2);
    expect(matchingPoliciesElements[0]).toHaveTextContent(/tomato = red/);
    expect(matchingPoliciesElements[1]).toHaveTextContent(/tomato = red/);
  });
  it('should render details modal when clicking see details button', async () => {
    // two alert managers configured  to receive alerts
    mockOneAlertManager();
    mockPreviewApiResponse(server, {
      schema: {
        fields: [
          { name: 'value', type: FieldType.number, labels: { tomato: 'red', avocate: 'green' } },
          { name: 'value', type: FieldType.number },
        ],
      },
    });

    render(<NotificationPreview alertQueries={[alertQuery]} customLabels={[]} condition="" />, {
      wrapper: TestProvider,
    });
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });

    await userEvent.click(ui.previewButton.get());
    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });
    //open details modal
    await userEvent.click(ui.seeDetails.get());
    expect(ui.details.title.query()).toBeInTheDocument();
    //we expect seeing the default policy
    expect(screen.getByText(/default policy/i)).toBeInTheDocument();
    //we expect seeing tomato = red twice, as we render in the matching labels and in the policy path
    const matchingPoliciesElements = within(ui.details.modal.get()).getAllByTestId('label-matchers');
    expect(matchingPoliciesElements).toHaveLength(2);
    expect(matchingPoliciesElements[0]).toHaveTextContent(/tomato = red/);
    expect(matchingPoliciesElements[1]).toHaveTextContent(/tomato = red/);
    expect(within(ui.details.modal.get()).getByText(/slack/i)).toBeInTheDocument();
  });
});

describe('NotificationPreviewByAlertmanager', () => {
  it('should render route matching preview for alertmanager', async () => {
    const potentialInstances: Labels[] = [
      { foo: 'bar', severity: 'critical' },
      { job: 'prometheus', severity: 'warning' },
    ];

    mockApi(server).getAlertmanagerConfig(GRAFANA_RULES_SOURCE_NAME, (amConfigBuilder) =>
      amConfigBuilder
        .withRoute((routeBuilder) =>
          routeBuilder
            .withReceiver('email')
            .addRoute((rb) => rb.withReceiver('slack').addMatcher('severity', MatcherOperator.equal, 'critical'))
            .addRoute((rb) => rb.withReceiver('opsgenie').addMatcher('team', MatcherOperator.equal, 'operations'))
        )
        .addReceivers((b) => b.withName('email').addEmailConfig((eb) => eb.withTo('test@example.com')))
        .addReceivers((b) => b.withName('slack'))
        .addReceivers((b) => b.withName('opsgenie'))
    );

    render(
      <NotificationPreviewByAlertManager
        alertManagerSource={{ name: GRAFANA_RULES_SOURCE_NAME, img: '' }}
        potentialInstances={potentialInstances}
        onlyOneAM={true}
      />,
      { wrapper: TestProvider }
    );

    await waitFor(() => {
      expect(ui.loadingIndicator.query()).not.toBeInTheDocument();
    });

    const matchingPoliciesElements = ui.routeButton.queryAll();
    expect(matchingPoliciesElements).toHaveLength(2);
    expect(matchingPoliciesElements[0]).toHaveTextContent(/severity = critical/);
    expect(matchingPoliciesElements[0]).toHaveTextContent(/slack/);
    expect(matchingPoliciesElements[1]).toHaveTextContent(/email/);
  });
});
