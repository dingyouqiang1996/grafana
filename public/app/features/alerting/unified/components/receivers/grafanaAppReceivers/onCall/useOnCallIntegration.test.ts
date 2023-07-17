import { renderHook, waitFor } from '@testing-library/react';
import { TestProvider } from 'test/helpers/TestProvider';

import { mockApi, setupMswServer } from 'app/features/alerting/unified/mockApi';
import { onCallPluginMetaMock } from 'app/features/alerting/unified/mocks';

import { ReceiverTypes } from './onCall';
import {
  GRAFANA_ONCALL_INTEGRATION_TYPE,
  OnCallIntegrationSetting,
  OnCallIntegrationType,
  useOnCallIntegration,
} from './useOnCallIntegration';

const server = setupMswServer();

beforeEach(() => {
  server.resetHandlers();
});

describe('useOnCallIntegration', () => {
  test('extendOnCalReceivers should add new settings to the oncall receiver', async () => {
    mockApi(server).plugins.getPluginSettings({ ...onCallPluginMetaMock, enabled: true });
    mockApi(server).oncall.getOnCallIntegrations([]);

    const { result } = renderHook(() => useOnCallIntegration(), { wrapper: TestProvider });

    await waitFor(() => expect(result.current.isLoadingOnCallIntegration).toBe(false));

    const { extendOnCalReceivers } = result.current;

    const receiver = extendOnCalReceivers({
      name: 'OnCall Conctact point',
      grafana_managed_receiver_configs: [
        {
          name: 'Oncall-integration',
          type: ReceiverTypes.OnCall,
          settings: {
            url: 'https://oncall-endpoint.example.com',
          },
          disableResolveMessage: false,
        },
      ],
    });

    const receiverConfig = receiver.grafana_managed_receiver_configs![0];

    expect(receiverConfig.settings[OnCallIntegrationSetting.IntegrationType]).toBe(
      OnCallIntegrationType.ExistingIntegration
    );
    expect(receiverConfig.settings[OnCallIntegrationSetting.IntegrationName]).toBeUndefined();
    expect(receiverConfig.settings['url']).toBe('https://oncall-endpoint.example.com');
  });

  test('createOnCallIntegrations should provide integration name and url validators', async () => {
    mockApi(server).plugins.getPluginSettings({ ...onCallPluginMetaMock, enabled: true });
    mockApi(server).oncall.getOnCallIntegrations([
      (ib) =>
        ib
          .withVerbalName('grafana-integration')
          .withIntegration(GRAFANA_ONCALL_INTEGRATION_TYPE)
          .withIntegrationUrl('https://oncall.com/grafana-integration'),
      (ib) =>
        ib
          .withVerbalName('alertmanager-integration')
          .withIntegration('Alertmanager')
          .withIntegrationUrl('https://oncall.com/alertmanager-integration'),
    ]);
    mockApi(server).oncall.createIntegraion();

    const { result } = renderHook(() => useOnCallIntegration(), { wrapper: TestProvider });

    // await waitFor(() => expect(result.current.isLoadingOnCallIntegration).toBe(true));
    await waitFor(() => expect(result.current.isLoadingOnCallIntegration).toBe(false));

    const { onCallFormValidators } = result.current;

    expect(onCallFormValidators.integration_name('grafana-integration')).toBe(
      'Integration of this name already exists in OnCall'
    );
    expect(onCallFormValidators.integration_name('alertmanager-integration')).toBe(
      'Integration of this name already exists in OnCall'
    );

    // ULR validator should check if the provided URL already exists
    expect(onCallFormValidators.url('https://oncall.com/grafana-integration')).toBe(true);

    // URL validator should check only among integrations of "grafana_alerting" type
    // So the following URL is invalid because it already exists but has different integration type
    expect(onCallFormValidators.url('https://oncall.com/alertmanager-integration')).toBe(
      'Selection of existing OnCall integration is required'
    );
  });

  // write a test checking if extendOnCallNotifierFeatures adds the correct notifier features
  test('extendOnCallNotifierFeatures should add integration type and name options and swap url to a select option', async () => {
    mockApi(server).plugins.getPluginSettings({ ...onCallPluginMetaMock, enabled: true });
    mockApi(server).oncall.getOnCallIntegrations([
      (ib) =>
        ib
          .withVerbalName('grafana-integration')
          .withIntegration(GRAFANA_ONCALL_INTEGRATION_TYPE)
          .withIntegrationUrl('https://oncall.com/grafana-integration'),
      (ib) =>
        ib
          .withVerbalName('alertmanager-integration')
          .withIntegration('Alertmanager')
          .withIntegrationUrl('https://oncall.com/alertmanager-integration'),
    ]);

    const { result } = renderHook(() => useOnCallIntegration(), { wrapper: TestProvider });

    await waitFor(() => expect(result.current.isLoadingOnCallIntegration).toBe(false));

    const { extendOnCallNotifierFeatures } = result.current;

    const notifier = extendOnCallNotifierFeatures({
      name: 'Grafana OnCall',
      type: 'oncall',
      options: [],
      description: '',
      heading: '',
    });

    expect(notifier.options).toHaveLength(3);
    expect(notifier.options[0].propertyName).toBe(OnCallIntegrationSetting.IntegrationType);
    expect(notifier.options[1].propertyName).toBe(OnCallIntegrationSetting.IntegrationName);
    expect(notifier.options[2].propertyName).toBe('url');

    expect(notifier.options[0].element).toBe('radio');
    expect(notifier.options[2].element).toBe('select');

    expect(notifier.options[2].selectOptions).toHaveLength(1);
    expect(notifier.options[2].selectOptions![0]).toMatchObject({
      label: 'grafana-integration',
      value: 'https://oncall.com/grafana-integration',
    });
  });
});
