import { css } from '@emotion/css';
import { memo, useEffect } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import { GrafanaTheme2 } from '@grafana/data';
import { FilterInput, useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { t } from 'app/core/internationalization';
import { ActionRow } from 'app/features/search/page/components/ActionRow';
import { getGrafanaSearcher } from 'app/features/search/service';

import { useDispatch } from '../../types';

import { useRecentlyDeletedStateManager } from './api/useRecentlyDeletedStateManager';
import { RecentlyDeletedActions } from './components/RecentlyDeletedActions';
import { RecentlyDeletedEmptyState } from './components/RecentlyDeletedEmptyState';
import { SearchView } from './components/SearchView';
import { getFolderPermissions } from './permissions';
import { setAllSelection, useHasSelection } from './state';

const RecentlyDeletedPage = memo(() => {
  const dispatch = useDispatch();
  const styles = useStyles2(getStyles);

  const [searchState, stateManager] = useRecentlyDeletedStateManager();
  const hasSelection = useHasSelection();

  const { canEditFolders, canEditDashboards } = getFolderPermissions();
  const canSelect = canEditFolders || canEditDashboards;

  useEffect(() => {
    stateManager.initStateFromUrl(undefined);

    // Clear selected state when folderUID changes
    dispatch(
      setAllSelection({
        isSelected: false,
        folderUID: undefined,
      })
    );
  }, [dispatch, stateManager]);

  return (
    <Page navId="dashboards/recently-deleted">
      <Page.Contents className={styles.pageContents}>
        <FilterInput
          placeholder={t('recentlyDeleted.filter.placeholder', 'Search for dashboards')}
          value={searchState.query}
          escapeRegex={false}
          onChange={stateManager.onQueryChange}
        />

        {hasSelection ? (
          <RecentlyDeletedActions />
        ) : (
          <ActionRow
            state={searchState}
            getTagOptions={stateManager.getTagOptions}
            getSortOptions={getGrafanaSearcher().getSortOptions}
            sortPlaceholder={getGrafanaSearcher().sortPlaceholder}
            onLayoutChange={stateManager.onLayoutChange}
            onSortChange={stateManager.onSortChange}
            onTagFilterChange={stateManager.onTagFilterChange}
            onDatasourceChange={stateManager.onDatasourceChange}
            onPanelTypeChange={stateManager.onPanelTypeChange}
            onSetIncludePanels={stateManager.onSetIncludePanels}
          />
        )}

        <div className={styles.subView}>
          <AutoSizer>
            {({ width, height }) => (
              <SearchView
                canSelect={canSelect}
                width={width}
                height={height}
                searchStateManager={stateManager}
                searchState={searchState}
                emptyState={<RecentlyDeletedEmptyState searchState={searchState} />}
              />
            )}
          </AutoSizer>
        </div>
      </Page.Contents>
    </Page>
  );
});

const getStyles = (theme: GrafanaTheme2) => ({
  pageContents: css({
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    height: '100%',
    rowGap: theme.spacing(1),
  }),

  // AutoSizer needs an element to measure the full height available
  subView: css({
    height: '100%',
  }),
});

RecentlyDeletedPage.displayName = 'RecentlyDeletedPage';
export default RecentlyDeletedPage;
