import React, { useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, TabsBar, TabContent, Tab } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { PluginDetailsSignature } from '../components/PluginDetailsSignature';
import { PluginDetailsHeader } from '../components/PluginDetailsHeader';
import { PluginDetailsBody } from '../components/PluginDetailsBody';
import { Page as PluginPage } from '../components/Page';
import { Loader } from '../components/Loader';
import { PluginTabLabels, PluginDetailsTab } from '../types';
import { useGetSingle, useFetchStatus } from '../state/hooks';
import { usePluginDetailsTabs } from '../hooks/usePluginDetailsTabs';

type Props = GrafanaRouteComponentProps<{ pluginId?: string }>;

type State = {
  tabs: PluginDetailsTab[];
  activeTabIndex: number;
};

const DefaultState = {
  tabs: [{ label: PluginTabLabels.OVERVIEW }, { label: PluginTabLabels.VERSIONS }],
  activeTabIndex: 0,
};

export default function PluginDetails({ match }: Props): JSX.Element | null {
  const { pluginId = '' } = match.params;
  const [state, setState] = useState<State>(DefaultState);
  const plugin = useGetSingle(pluginId); // fetches the localplugin settings
  const { tabs } = usePluginDetailsTabs(plugin, DefaultState.tabs);
  const { activeTabIndex } = state;
  const { isLoading } = useFetchStatus();
  const styles = useStyles2(getStyles);
  const setActiveTab = (activeTabIndex: number) => setState({ ...state, activeTabIndex });

  if (isLoading) {
    return (
      <Page>
        <Loader />
      </Page>
    );
  }

  if (!plugin) {
    // TODO<Return with a 404 component here>
    return <>Plugin not found.</>;
  }

  return (
    <Page>
      <PluginPage>
        <PluginDetailsHeader currentUrl={match.url} plugin={plugin} />

        {/* Tab navigation */}
        <TabsBar>
          {tabs.map((tab: PluginDetailsTab, idx: number) => (
            <Tab
              key={tab.label}
              label={tab.label}
              active={idx === activeTabIndex}
              onChangeTab={() => setActiveTab(idx)}
            />
          ))}
        </TabsBar>

        {/* Active tab */}
        <TabContent className={styles.tabContent}>
          {/* TODO: Cannot get plugin meta data. e.g. cannot talk to gcom and plugin is not installed. */}
          {/* {pluginConfig.loadError && (
            <Alert severity={AppNotificationSeverity.Error} title="Error Loading Plugin">
              <>
                Check the server startup logs for more information. <br />
                If this plugin was loaded from git, make sure it was compiled.
              </>
            </Alert>
          )} */}
          <PluginDetailsSignature plugin={plugin} className={styles.signature} />
          <PluginDetailsBody tab={tabs[activeTabIndex]} plugin={plugin} />
        </TabContent>
      </PluginPage>
    </Page>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    signature: css`
      margin: ${theme.spacing(3)};
      margin-bottom: 0;
    `,
    // Needed due to block formatting context
    tabContent: css`
      overflow: auto;
    `,
  };
};
