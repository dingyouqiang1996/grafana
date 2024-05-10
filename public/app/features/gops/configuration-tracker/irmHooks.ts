import { useMemo } from 'react';

import { locationService } from '@grafana/runtime';
import { createUrl } from 'app/features/alerting/unified/utils/url';

import {
  isOnCallContactPointReady,
  useGetContactPoints,
  useGetDefaultContactPoint,
  useIsCreateAlertRuleDone,
} from './alerting/hooks';
import { isContactPointReady } from './alerting/utils';
import { ConfigurationStepsEnum, DataSourceConfigurationData, IrmCardConfiguration } from './components/ConfigureIRM';
import { useGetIncidentPluginConfig } from './incidents/hooks';
import { useOnCallChatOpsConnections, useOnCallOptions } from './onCall/hooks';

interface UrlLink {
  url: string;
  queryParams?: Record<string, string>;
}
export interface StepButtonDto {
  type: 'openLink' | 'dropDown';
  label: string;
  labelOnDone?: string;
  urlLink?: UrlLink; // only for openLink
  urlLinkOnDone?: UrlLink; // only for openLink
  options?: Array<{ label: string; value: string }>; // only for dropDown
  onClickOption?: (value: string) => void; // only for dropDown
  stepNotAvailableText?: string;
}
export interface SectionDtoStep {
  title: string;
  description: string;
  button: StepButtonDto;
  done?: boolean;
}
export interface SectionDto {
  title: string;
  description: string;
  steps: SectionDtoStep[];
}
export interface SectionsDto {
  sections: SectionDto[];
}

export interface EssentialsConfigurationData {
  essentialContent: SectionsDto;
  stepsDone: number;
  totalStepsToDo: number;
  isLoading: boolean;
}

export function useGetEssentialsConfiguration(): EssentialsConfigurationData {
  const { contactPoints, isLoading: isLoadingContactPoints } = useGetContactPoints();
  const { defaultContactpoint, isLoading: isLoadingDefaultContactPoint } = useGetDefaultContactPoint();
  const {
    isChatOpsInstalled,
    isInstalled: isIncidentsInstalled,
    isLoading: isIncidentsConfigLoading,
  } = useGetIncidentPluginConfig();
  const onCallOptions = useOnCallOptions();
  const chatOpsConnections = useOnCallChatOpsConnections();
  const { isDone: isCreateAlertRuleDone, isLoading: isLoadingAlertCreatedDone } = useIsCreateAlertRuleDone();
  const isLoading =
    isLoadingContactPoints || isLoadingDefaultContactPoint || isLoadingAlertCreatedDone || isIncidentsConfigLoading;
  function onIntegrationClick(integrationId: string, url: string) {
    const urlToGoWithIntegration = createUrl(url + integrationId, {
      returnTo: location.pathname + location.search,
    });
    locationService.push(urlToGoWithIntegration);
  }

  const essentialContent: SectionsDto = {
    sections: [
      {
        title: 'Detect',
        description: 'Configure Grafana Alerting',
        steps: [
          {
            title: 'Update default email contact point',
            description: 'Add a valid email to the default email contact point.',
            button: {
              type: 'openLink',
              urlLink: {
                url: `/alerting/notifications/receivers/${defaultContactpoint}/edit`,
                queryParams: { alertmanager: 'grafana' },
              },
              label: 'Edit',
              labelOnDone: 'View',
              urlLinkOnDone: {
                url: `/alerting/notifications`,
              },
            },
            done: isContactPointReady(defaultContactpoint, contactPoints),
          },
          {
            title: 'Connect alerting to OnCall',
            description: 'Create an OnCall integration for an alerting contact point.',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/alerting/notifications/receivers/new',
              },
              label: 'Connect',
              urlLinkOnDone: {
                url: '/alerting/notifications',
              },
              labelOnDone: 'View',
            },
            done: isOnCallContactPointReady(contactPoints),
          },
          {
            title: 'Create alert rule',
            description: 'Create an alert rule to monitor your system.',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/alerting/new',
              },
              label: 'Create',
              urlLinkOnDone: {
                url: '/alerting/list',
              },
              labelOnDone: 'View',
            },
            done: isCreateAlertRuleDone,
          },
        ],
      },
      {
        title: 'Respond',
        description: 'Configure OnCall and Incident',
        steps: [
          {
            title: 'Initialize Incident plugin',
            description: 'Initialize the Incident plugin to declare and manage incidents.',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/a/grafana-incident-app/walkthrough/generate-key',
              },
              label: 'Initialize',
              urlLinkOnDone: {
                url: '/a/grafana-incident-app',
              },
              labelOnDone: 'View',
            },
            done: isIncidentsInstalled,
          },
          {
            title: 'Connect your Messaging workspace to OnCall',
            description: 'Receive alerts and oncall notifications within your chat environment.',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/a/grafana-oncall-app/settings',
                queryParams: { tab: 'ChatOps', chatOpsTab: 'Slack' },
              },
              label: 'Connect',
              urlLinkOnDone: {
                url: '/a/grafana-oncall-app/settings',
                queryParams: { tab: 'ChatOps' },
              },
              labelOnDone: 'View',
            },
            done: chatOpsConnections.is_chatops_connected,
          },
          {
            title: 'Connect your Messaging workspace to Incident',
            description:
              'Automatically create an incident channel and manage incidents directly within your chat environment.',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/a/grafana-incident-app/integrations/grate.slack',
              },
              label: 'Connect',
              urlLinkOnDone: {
                url: '/a/grafana-incident-app/integrations',
              },
            },
            done: isChatOpsInstalled,
          },
          {
            title: 'Add Messaging workspace channel to OnCall Integration',
            description: 'Select ChatOps channels to route notifications',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/a/grafana-oncall-app/integrations/',
              },
              label: 'Add',
              urlLinkOnDone: {
                url: '/a/grafana-oncall-app/integrations/',
              },
              labelOnDone: 'View',
            },
            done: chatOpsConnections.is_integration_chatops_connected,
          },
        ],
      },
      {
        title: 'Test your configuration',
        description: '',
        steps: [
          {
            title: 'Send OnCall demo alert',
            description: 'In the integration page, click Send demo alert, to review your notification',
            button: {
              type: 'dropDown',
              label: 'Select integration',
              options: onCallOptions,
              onClickOption: (value) => onIntegrationClick(value, '/a/grafana-oncall-app/integrations/'),
              stepNotAvailableText: 'No integrations available',
            },
          },
          {
            title: 'Create Incident drill',
            description: 'Practice solving an Incident',
            button: {
              type: 'openLink',
              urlLink: {
                url: '/a/grafana-incident-app',
                queryParams: { declare: 'new', drill: '1' },
              },
              label: 'Start drill',
            },
          },
        ],
      },
    ],
  };
  const { stepsDone, totalStepsToDo } = essentialContent.sections.reduce(
    (acc, section) => {
      const stepsDone = section.steps.filter((step) => step.done).length;
      const totalStepsToForSection = section.steps.reduce((acc, step) => (step.done !== undefined ? acc + 1 : acc), 0);
      return {
        stepsDone: acc.stepsDone + stepsDone,
        totalStepsToDo: acc.totalStepsToDo + totalStepsToForSection,
      };
    },
    { stepsDone: 0, totalStepsToDo: 0 }
  );
  return { essentialContent, stepsDone, totalStepsToDo, isLoading };
}
interface UseConfigurationProps {
  dataSourceConfigurationData: DataSourceConfigurationData;
  essentialsConfigurationData: EssentialsConfigurationData;
}

export const useGetConfigurationForUI = ({
  dataSourceConfigurationData: { dataSourceCompatibleWithAlerting },
  essentialsConfigurationData: { stepsDone, totalStepsToDo },
}: UseConfigurationProps): IrmCardConfiguration[] => {
  return useMemo(() => {
    function getConnectDataSourceConfiguration() {
      const description = dataSourceCompatibleWithAlerting
        ? 'You have connected a datasource.'
        : 'Connect at least one data source to start receiving data.';
      const actionButtonTitle = dataSourceCompatibleWithAlerting ? 'View' : 'Connect';
      return {
        id: ConfigurationStepsEnum.CONNECT_DATASOURCE,
        title: 'Connect data source',
        description,
        actionButtonTitle,
        isDone: dataSourceCompatibleWithAlerting,
      };
    }
    return [
      getConnectDataSourceConfiguration(),
      {
        id: ConfigurationStepsEnum.ESSENTIALS,
        title: 'Essentials',
        titleIcon: 'star',
        description: 'Configure the features you need to start using Grafana IRM workflows',
        actionButtonTitle: 'Start',
        stepsDone,
        totalStepsToDo,
      },
    ];
  }, [dataSourceCompatibleWithAlerting, stepsDone, totalStepsToDo]);
};
