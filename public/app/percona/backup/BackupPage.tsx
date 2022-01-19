import React, { FC, useMemo } from 'react';

import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

import { FeatureLoader } from '../shared/components/Elements/FeatureLoader';
import { TabbedContent, ContentTab } from '../shared/components/Elements/TabbedContent';
import { TechnicalPreview } from '../shared/components/Elements/TechnicalPreview/TechnicalPreview';
import PageWrapper from '../shared/components/PageWrapper/PageWrapper';

import { Messages } from './Backup.messages';
import { TabKeys } from './Backup.types';
import { PAGE_MODEL } from './BackupPage.constants';
import { BackupInventory } from './components/BackupInventory';
import { RestoreHistory } from './components/RestoreHistory';
import { ScheduledBackups } from './components/ScheduledBackups';
import { StorageLocations } from './components/StorageLocations';

const BackupPage: FC<GrafanaRouteComponentProps<{ tab: string }>> = ({ match }) => {
  const tabs: ContentTab[] = useMemo(
    (): ContentTab[] => [
      {
        key: TabKeys.inventory,
        label: Messages.tabs.inventory,
        component: <BackupInventory />,
      },
      {
        key: TabKeys.restore,
        label: Messages.tabs.restore,
        component: <RestoreHistory />,
      },
      {
        key: TabKeys.scheduled,
        label: Messages.tabs.scheduled,
        component: <ScheduledBackups />,
      },
      {
        key: TabKeys.locations,
        label: Messages.tabs.locations,
        component: <StorageLocations />,
      },
    ],
    []
  );

  const { path: basePath } = PAGE_MODEL;
  const tab = match.params.tab;

  return (
    <PageWrapper pageModel={PAGE_MODEL}>
      <TechnicalPreview />
      <TabbedContent
        activeTabName={tab}
        tabs={tabs}
        basePath={basePath}
        renderTab={({ Content }) => (
          <FeatureLoader featureName={Messages.backupManagement} featureFlag="backupEnabled">
            <Content />
          </FeatureLoader>
        )}
      />
    </PageWrapper>
  );
};

export default BackupPage;
