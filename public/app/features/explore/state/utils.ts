import {
  DataSourceApi,
  EventBusExtended,
  ExploreUrlState,
  getDefaultTimeRange,
  HistoryItem,
  LoadingState,
  LogsDedupStrategy,
  PanelData,
} from '@grafana/data';

import { ExploreItemState } from 'app/types/explore';
import { getDatasourceSrv } from '../../plugins/datasource_srv';
import store from '../../../core/store';
import { clearQueryKeys, lastUsedDatasourceKeyForOrgId } from '../../../core/utils/explore';
import { toRawTimeRange } from '../utils/time';

export const DEFAULT_RANGE = {
  from: 'now-6h',
  to: 'now',
};

/**
 * Returns a fresh Explore area state
 */
export const makeExplorePaneState = (): ExploreItemState => ({
  containerWidth: 0,
  datasourceInstance: null,
  datasourceMissing: false,
  history: [],
  queries: [],
  initialized: false,
  range: {
    from: null,
    to: null,
    raw: DEFAULT_RANGE,
  } as any,
  absoluteRange: {
    from: null,
    to: null,
  } as any,
  scanning: false,
  loading: false,
  queryKeys: [],
  latency: 0,
  isLive: false,
  isPaused: false,
  queryResponse: createEmptyQueryResponse(),
  tableResult: null,
  graphResult: null,
  logsResult: null,
  dedupStrategy: LogsDedupStrategy.none,
  eventBridge: (null as unknown) as EventBusExtended,
});

export const createEmptyQueryResponse = (): PanelData => ({
  state: LoadingState.NotStarted,
  series: [],
  timeRange: getDefaultTimeRange(),
});

export async function loadAndInitDatasource(
  orgId: number,
  datasourceName?: string
): Promise<{ history: HistoryItem[]; instance: DataSourceApi }> {
  let instance;
  try {
    instance = await getDatasourceSrv().get(datasourceName);
  } catch (error) {
    // Falling back to the default data source in case the provided data source was not found.
    // It may happen if last used data source or the data source provided in the URL has been
    // removed or it is not provisioned anymore.
    console.error(error);
    instance = await getDatasourceSrv().get();
    console.info('Default datasource loaded.');
  }
  if (instance.init) {
    try {
      instance.init();
    } catch (err) {
      // TODO: should probably be handled better
      console.error(err);
    }
  }

  const historyKey = `grafana.explore.history.${instance.meta?.id}`;
  const history = store.getObject(historyKey, []);
  // Save last-used datasource

  store.set(lastUsedDatasourceKeyForOrgId(orgId), instance.uid);
  return { history, instance };
}

export function getUrlStateFromPaneState(pane: ExploreItemState): ExploreUrlState {
  return {
    // datasourceInstance should not be undefined anymore here but in case there is some path for it to be undefined
    // lets just fallback instead of crashing.
    datasource: pane.datasourceInstance?.name || '',
    queries: pane.queries.map(clearQueryKeys),
    range: toRawTimeRange(pane.range),
  };
}
