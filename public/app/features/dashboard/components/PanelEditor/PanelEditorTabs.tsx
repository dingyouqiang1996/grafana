import React from 'react';
import { config } from 'app/core/config';
import { css } from 'emotion';
import { TabsBar, Tab, stylesFactory, TabContent } from '@grafana/ui';
import { PanelEditorTab, PanelEditorTabId } from './types';
import { DashboardModel } from '../../state';
import { QueriesTab } from '../../panel_editor/QueriesTab';
import { PanelModel } from '../../state/PanelModel';
import { AlertTab } from 'app/features/alerting/AlertTab';

interface PanelEditorTabsProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  tabs: PanelEditorTab[];
  onChangeTab: (tab: PanelEditorTab) => void;
}

export const PanelEditorTabs: React.FC<PanelEditorTabsProps> = ({ panel, dashboard, tabs, onChangeTab }) => {
  const styles = getPanelEditorTabsStyles();
  const activeTab = tabs.find(item => item.active);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <TabsBar className={styles.tabBar}>
        {tabs.map(tab => {
          return <Tab key={tab.id} label={tab.text} active={tab.active} onChangeTab={() => onChangeTab(tab)} />;
        })}
      </TabsBar>
      <TabContent className={styles.tabContent}>
        {activeTab.id === PanelEditorTabId.Queries && <QueriesTab panel={panel} dashboard={dashboard} />}
        {activeTab.id === PanelEditorTabId.Alert && <AlertTab panel={panel} dashboard={dashboard} />}
        {activeTab.id === PanelEditorTabId.Transform && <div>TODO: Show Transform</div>}
      </TabContent>
    </div>
  );
};

const getPanelEditorTabsStyles = stylesFactory(() => {
  const { theme } = config;

  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      height: 100%;
    `,
    tabBar: css`
      padding: 0 ${theme.spacing.sm};
    `,
    tabContent: css`
      padding: 0;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 0;
    `,
  };
});
