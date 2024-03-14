import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2, ScopeDashboard } from '@grafana/data';
import { SceneComponentProps, SceneObjectBase, SceneObjectState } from '@grafana/scenes';
import { CustomScrollbar, Icon, Input, useStyles2 } from '@grafana/ui';

export interface ScopesDashboardsSceneState extends SceneObjectState {
  dashboards: ScopeDashboard[];
  filteredDashboards: ScopeDashboard[];
  isLoading: boolean;
  searchQuery: string;
}

export class ScopesDashboardsScene extends SceneObjectBase<ScopesDashboardsSceneState> {
  static Component = ScopesDashboardsSceneRenderer;

  constructor() {
    super({
      dashboards: [],
      filteredDashboards: [],
      isLoading: false,
      searchQuery: '',
    });
  }

  public async fetchDashboards(scope: string | undefined) {
    if (!scope) {
      return this.setState({ dashboards: [], filteredDashboards: [], isLoading: false });
    }

    this.setState({ isLoading: true });

    setTimeout(() => {
      const dashboards = [
        {
          uid: '20a5aec7-8381-4c91-94b7-4e8d17c75672',
          title: `My Dashboard ${Math.floor(Math.random() * 10) + 1}`,
        },
        {
          uid: 'c677f72a-ab93-4442-b50f-367f4a2849c7',
          title: `My Dashboard ${Math.floor(Math.random() * 10) + 1}`,
        },
      ];

      this.setState({
        dashboards,
        filteredDashboards: this.filterDashboards(dashboards, this.state.searchQuery),
        isLoading: false,
      });
    }, 500);
  }

  public changeSearchQuery(searchQuery: string) {
    this.setState({
      filteredDashboards: searchQuery
        ? this.filterDashboards(this.state.dashboards, searchQuery)
        : this.state.dashboards,
      searchQuery: searchQuery ?? '',
    });
  }

  private filterDashboards(dashboards: ScopeDashboard[], searchQuery: string) {
    const lowerCasedSearchQuery = searchQuery.toLowerCase();
    return dashboards.filter((dashboard) => dashboard.title.toLowerCase().includes(lowerCasedSearchQuery));
  }
}

export function ScopesDashboardsSceneRenderer({ model }: SceneComponentProps<ScopesDashboardsScene>) {
  const { filteredDashboards, isLoading } = model.useState();
  const styles = useStyles2(getStyles);

  const ac = [];

  for (let i = 0; i < 100; i++) {
    ac.push(...filteredDashboards);
  }

  return (
    <>
      <div className={styles.searchInputContainer}>
        <Input
          prefix={<Icon name="search" />}
          disabled={isLoading}
          onChange={(evt) => model.changeSearchQuery(evt.currentTarget.value)}
        />
      </div>

      <CustomScrollbar>
        {ac.map((dashboard, idx) => (
          <div key={idx} className={styles.dashboardItem}>
            {dashboard.title}
          </div>
        ))}
      </CustomScrollbar>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    searchInputContainer: css({
      flex: '0 1 auto',
    }),
    dashboardItem: css({
      padding: theme.spacing(1, 0),
      borderBottom: `1px solid ${theme.colors.border.weak}`,

      ':first-child': {
        paddingTop: 0,
      },
    }),
  };
};
