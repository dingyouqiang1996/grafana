import {
  CoreApp,
  DataQuery,
  DataQueryRequest,
  DataSourceApi,
  PanelData,
  rangeUtil,
  ScopedVars,
  TimeRange,
  TimeZone,
} from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { cloneDeep } from 'lodash';
import { Observable, ReplaySubject, Unsubscribable } from 'rxjs';
import { getNextRequestId } from './PanelQueryRunner';
import { preProcessPanelData, runRequest } from './runRequest';

export interface QueryRunnerOptions {
  datasource: string | DataSourceApi | null;
  queries: DataQuery[];
  panelId?: number;
  dashboardId?: number;
  timezone: TimeZone;
  timeRange: TimeRange;
  timeInfo?: string; // String description of time range for display
  maxDataPoints: number;
  minInterval: string | undefined | null;
  scopedVars?: ScopedVars;
  cacheTimeout?: string;
  app?: string;
}

export class QueryRunner {
  private subject: ReplaySubject<PanelData>;
  private subscription?: Unsubscribable;
  private lastResult?: PanelData;

  constructor() {
    this.subject = new ReplaySubject(1);
  }

  get(): Observable<PanelData> {
    return this.subject;
  }

  async run(options: QueryRunnerOptions) {
    const {
      queries,
      timezone,
      datasource,
      panelId,
      app,
      dashboardId,
      timeRange,
      timeInfo,
      cacheTimeout,
      maxDataPoints,
      scopedVars,
      minInterval,
    } = options;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    const request: DataQueryRequest = {
      app: app ?? CoreApp.Unknown,
      requestId: getNextRequestId(),
      timezone,
      panelId,
      dashboardId,
      range: timeRange,
      timeInfo,
      interval: '',
      intervalMs: 0,
      targets: cloneDeep(queries),
      maxDataPoints: maxDataPoints,
      scopedVars: scopedVars || {},
      cacheTimeout,
      startTime: Date.now(),
    };

    // Add deprecated property
    (request as any).rangeRaw = timeRange.raw;

    try {
      const ds = await getDataSource(datasource, request.scopedVars);

      // Attach the datasource name to each query
      request.targets = request.targets.map((query) => {
        if (!query.datasource) {
          query.datasource = ds.name;
        }
        return query;
      });

      const lowerIntervalLimit = minInterval ? getTemplateSrv().replace(minInterval, request.scopedVars) : ds.interval;
      const norm = rangeUtil.calculateInterval(timeRange, maxDataPoints, lowerIntervalLimit);

      // make shallow copy of scoped vars,
      // and add built in variables interval and interval_ms
      request.scopedVars = Object.assign({}, request.scopedVars, {
        __interval: { text: norm.interval, value: norm.interval },
        __interval_ms: { text: norm.intervalMs.toString(), value: norm.intervalMs },
      });

      request.interval = norm.interval;
      request.intervalMs = norm.intervalMs;

      this.subscription = runRequest(ds, request).subscribe({
        next: (data) => {
          this.lastResult = preProcessPanelData(data, this.lastResult);
          // Store preprocessed query results for applying overrides later on in the pipeline
          this.subject.next(this.lastResult);
        },
      });
    } catch (err) {
      console.error('PanelQueryRunner Error', err);
    }
  }
}

async function getDataSource(
  datasource: string | DataSourceApi | null,
  scopedVars: ScopedVars
): Promise<DataSourceApi> {
  if (datasource && (datasource as any).query) {
    return datasource as DataSourceApi;
  }
  return await getDatasourceSrv().get(datasource as string, scopedVars);
}
