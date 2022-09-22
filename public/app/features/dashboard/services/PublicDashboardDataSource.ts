import { catchError, Observable, of, switchMap } from 'rxjs';

import {
  DataQuery,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceJsonData,
  DataSourcePluginMeta,
  DataSourceRef,
} from '@grafana/data';
import { BackendDataSourceResponse, getBackendSrv, toDataQueryResponse } from '@grafana/runtime';

import { MIXED_DATASOURCE_NAME } from '../../../plugins/datasource/mixed/MixedDataSource';

export const PUBLIC_DATASOURCE = '-- Public --';
export const DEFAULT_INTERVAL = '1min';

export class PublicDashboardDataSource extends DataSourceApi<DataQuery, DataSourceJsonData, {}> {
  constructor(datasource: DataSourceRef | string | DataSourceApi | null) {
    let meta = {} as DataSourcePluginMeta;
    if (PublicDashboardDataSource.isMixedDatasource(datasource)) {
      meta.mixed = true;
    }

    super({
      name: 'public-ds',
      id: 0,
      type: 'public-ds',
      meta,
      uid: PublicDashboardDataSource.resolveUid(datasource),
      jsonData: {},
      access: 'proxy',
      readOnly: true,
    });

    this.interval = PublicDashboardDataSource.resolveInterval(datasource);
  }

  /**
   * Get the datasource uid based on the many types a datasource can be.
   */
  private static resolveUid(datasource: DataSourceRef | string | DataSourceApi | null): string {
    if (typeof datasource === 'string') {
      return datasource;
    }

    return datasource?.uid ?? PUBLIC_DATASOURCE;
  }

  private static isMixedDatasource(datasource: DataSourceRef | string | DataSourceApi | null): boolean {
    if (typeof datasource === 'string' || datasource === null) {
      return false;
    }

    return datasource?.uid === MIXED_DATASOURCE_NAME;
  }

  private static resolveInterval(datasource: DataSourceRef | string | DataSourceApi | null): string {
    if (typeof datasource === 'string' || datasource === null) {
      return DEFAULT_INTERVAL;
    }

    const interval = 'interval' in datasource ? datasource.interval : undefined;

    return interval ?? DEFAULT_INTERVAL;
  }

  /**
   * Ideally final -- any other implementation may not work as expected
   */
  query(request: DataQueryRequest<DataQuery>): Observable<DataQueryResponse> {
    const { intervalMs, maxDataPoints, requestId, publicDashboardAccessToken, panelId } = request;
    let queries: DataQuery[];

    // Return early if no queries exist
    if (!request.targets.length) {
      return of({ data: [] });
    }

    const body: any = { intervalMs, maxDataPoints };

    return getBackendSrv()
      .fetch<BackendDataSourceResponse>({
        url: `/api/public/dashboards/${publicDashboardAccessToken}/panels/${panelId}/query`,
        method: 'POST',
        data: body,
        requestId,
      })
      .pipe(
        switchMap((raw) => {
          return of(toDataQueryResponse(raw, queries));
        }),
        catchError((err) => {
          return of(toDataQueryResponse(err));
        })
      );
  }

  testDatasource(): Promise<any> {
    return Promise.resolve(null);
  }
}
