import { lastValueFrom } from 'rxjs';

import { getBackendSrv, getDataSourceSrv } from '@grafana/runtime';
import { RichHistoryQuery } from 'app/types/explore';

import { DataQuery } from '../../../../packages/grafana-data';
import { RichHistorySearchFilters, RichHistorySettings, SortOrder } from '../utils/richHistoryTypes';

import RichHistoryStorage, { RichHistoryStorageWarningDetails } from './RichHistoryStorage';
import { fromDTO, toDTO } from './remoteStorageConverter';

export type RichHistoryRemoteStorageDTO = {
  uid: string;
  createdAt: number;
  datasourceUid: string;
  starred: boolean;
  comment: string;
  queries: DataQuery[];
};

type RichHistoryRemoteStorageMigrationDTO = {
  datasourceUid: string;
  queries: DataQuery[];
  createdAt: number;
  starred: boolean;
  comment: string;
};

type RichHistoryRemoteStorageMigrationPayloadDTO = {
  queries: RichHistoryRemoteStorageMigrationDTO[];
};

type RichHistoryRemoteStorageResultsPayloadDTO = {
  result: {
    queryHistory: RichHistoryRemoteStorageDTO[];
  };
};

type RichHistoryRemoteStorageUpdatePayloadDTO = {
  result: RichHistoryRemoteStorageDTO;
};

export default class RichHistoryRemoteStorage implements RichHistoryStorage {
  async addToRichHistory(
    newRichHistoryQuery: Omit<RichHistoryQuery, 'id' | 'createdAt'>
  ): Promise<{ warning?: RichHistoryStorageWarningDetails; richHistoryQuery: RichHistoryQuery }> {
    const { result } = await getBackendSrv().post(`/api/query-history`, {
      dataSourceUid: newRichHistoryQuery.datasourceUid,
      queries: newRichHistoryQuery.queries,
    });
    return {
      richHistoryQuery: fromDTO(result),
    };
  }

  async deleteAll(): Promise<void> {
    throw new Error('not supported');
  }

  async deleteRichHistory(id: string): Promise<void> {
    await getBackendSrv().delete(`/api/query-history/${id}`);
  }

  async getRichHistory(filters: RichHistorySearchFilters): Promise<RichHistoryQuery[]> {
    const params = buildQueryParams(filters);
    const queryHistory = await lastValueFrom(
      getBackendSrv().fetch({
        method: 'GET',
        url: `/api/query-history?${params}`,
        // to ensure any previous requests are cancelled
        requestId: 'query-history-get-all',
      })
    );
    return ((queryHistory.data as RichHistoryRemoteStorageResultsPayloadDTO).result.queryHistory || []).map(fromDTO);
  }

  async getSettings(): Promise<RichHistorySettings> {
    return {
      activeDatasourceOnly: false,
      lastUsedDatasourceFilters: undefined,
      retentionPeriod: 14,
      starredTabAsFirstTab: false,
    };
  }

  async updateComment(id: string, comment: string | undefined): Promise<RichHistoryQuery> {
    const dto: RichHistoryRemoteStorageUpdatePayloadDTO = await getBackendSrv().patch(`/api/query-history/${id}`, {
      comment: comment,
    });
    return fromDTO(dto.result);
  }

  async updateSettings(settings: RichHistorySettings): Promise<void> {
    throw new Error('not supported yet');
  }

  async updateStarred(id: string, starred: boolean): Promise<RichHistoryQuery> {
    let dto: RichHistoryRemoteStorageUpdatePayloadDTO;
    if (starred) {
      dto = await getBackendSrv().post(`/api/query-history/star/${id}`);
    } else {
      dto = await getBackendSrv().delete(`/api/query-history/star/${id}`);
    }
    return fromDTO(dto.result);
  }

  /**
   * @internal Used only for migration purposes. Will be removed in future.
   */
  async migrate(richHistory: RichHistoryQuery[]) {
    await lastValueFrom(
      getBackendSrv().fetch({
        url: '/api/query-history/migrate',
        method: 'POST',
        data: { queries: richHistory.map(toDTO) } as RichHistoryRemoteStorageMigrationPayloadDTO,
        showSuccessAlert: false,
      })
    );
  }
}

function buildQueryParams(filters: RichHistorySearchFilters): string {
  let params = `${filters.datasourceFilters
    .map((datasourceName) => {
      const uid = getDataSourceSrv().getInstanceSettings(datasourceName)!.uid;
      return `datasourceUid=${encodeURIComponent(uid)}`;
    })
    .join('&')}`;
  if (filters.search) {
    params = params + `&searchString=${filters.search}`;
  }
  if (filters.sortOrder) {
    params = params + `&sort=${filters.sortOrder === SortOrder.Ascending ? 'time-asc' : 'time-desc'}`;
  }
  const relativeFrom = filters.from === 0 ? 'now' : `now-${filters.from}d`;
  const relativeTo = filters.to === 0 ? 'now' : `now-${filters.to}d`;
  // TODO: Unify: remote storage from/to params are swapped comparing to frontend and local storage filters
  params = params + `&to=${relativeFrom}`;
  params = params + `&from=${relativeTo}`;
  params = params + `&limit=100`;
  params = params + `&page=1`;
  if (filters.starred) {
    params = params + `&onlyStarred=${filters.starred}`;
  }
  return params;
}
