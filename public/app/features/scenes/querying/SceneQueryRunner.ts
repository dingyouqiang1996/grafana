import { cloneDeep } from 'lodash';
import { Unsubscribable } from 'rxjs';

import {
  CoreApp,
  DataQuery,
  DataQueryRequest,
  DataSourceApi,
  DataSourceRef,
  PanelData,
  rangeUtil,
  ScopedVars,
  TimeRange,
} from '@grafana/data';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { getNextRequestId } from 'app/features/query/state/PanelQueryRunner';
import { runRequest } from 'app/features/query/state/runRequest';

import { SceneObjectBase } from '../core/SceneObjectBase';
import { SceneObjectStatePlain } from '../core/types';
import { VariableDependencyConfig } from '../variables/VariableDependencyConfig';

export interface QueryRunnerState extends SceneObjectStatePlain {
  data?: PanelData;
  queries: DataQueryExtended[];
  datasource?: DataSourceRef;
  minInterval?: string;
  maxDataPoints?: number;
  // Non persisted state
  maxDataPointsFromWidth?: boolean;
}

export interface DataQueryExtended extends DataQuery {
  [key: string]: any;
}

export class SceneQueryRunner extends SceneObjectBase<QueryRunnerState> {
  private _querySub?: Unsubscribable;
  private _containerWidth?: number;

  protected _variableDependency = new VariableDependencyConfig(this, {
    statePaths: ['queries'],
    onReferencedVariableValueChanged: () => this.runQueries(),
  });

  public activate() {
    super.activate();

    const timeRange = this.getTimeRange();

    this._subs.add(
      timeRange.subscribeToState({
        next: (timeRange) => {
          this.runWithTimeRange(timeRange);
        },
      })
    );

    if (this.shouldRunQueriesOnActivate()) {
      this.runQueries();
    }
  }

  private shouldRunQueriesOnActivate() {
    // If we already have data, no need
    // TODO validate that time range is similar and if not we should run queries again
    if (this.state.data) {
      return false;
    }

    // If no hardset max data points we need might to wait for container width to be set from the outside
    if (!this.state.maxDataPoints && this.state.maxDataPointsFromWidth && !this._containerWidth) {
      return false;
    }

    return true;
  }

  public deactivate(): void {
    super.deactivate();

    if (this._querySub) {
      this._querySub.unsubscribe();
      this._querySub = undefined;
    }
  }

  public setContainerWidth(width: number) {
    if (!width || !this.state.maxDataPointsFromWidth || this.state.maxDataPoints) {
      return;
    }

    // If we don't have a width we should run queries
    if (!this._containerWidth) {
      this._containerWidth = width;
      // as this is called from render path we need to wait for next tick before running queries
      setTimeout(() => {
        if (this.isActive) {
          this.runQueries();
        }
      }, 0);
    } else {
      // let's just remember the width until next query issue
      this._containerWidth = width;
    }
  }

  public runQueries() {
    const timeRange = this.getTimeRange();
    this.runWithTimeRange(timeRange.state);
  }

  private getMaxDataPoints() {
    return this.state.maxDataPoints ?? this._containerWidth ?? 500;
  }

  private async runWithTimeRange(timeRange: TimeRange) {
    const { datasource, minInterval, queries } = this.state;

    const request: DataQueryRequest = {
      app: CoreApp.Dashboard,
      requestId: getNextRequestId(),
      timezone: 'browser',
      panelId: 1,
      dashboardId: 1,
      range: timeRange,
      interval: '1s',
      intervalMs: 1000,
      targets: cloneDeep(queries),
      maxDataPoints: this.getMaxDataPoints(),
      scopedVars: {},
      startTime: Date.now(),
    };

    try {
      const ds = await getDataSource(datasource, request.scopedVars);

      // Attach the data source name to each query
      request.targets = request.targets.map((query) => {
        if (!query.datasource) {
          query.datasource = ds.getRef();
        }
        return query;
      });

      // TODO interpolate minInterval
      const lowerIntervalLimit = minInterval ? minInterval : ds.interval;
      const norm = rangeUtil.calculateInterval(timeRange, request.maxDataPoints!, lowerIntervalLimit);

      // make shallow copy of scoped vars,
      // and add built in variables interval and interval_ms
      request.scopedVars = Object.assign({}, request.scopedVars, {
        __interval: { text: norm.interval, value: norm.interval },
        __interval_ms: { text: norm.intervalMs.toString(), value: norm.intervalMs },
      });

      request.interval = norm.interval;
      request.intervalMs = norm.intervalMs;

      this._querySub = runRequest(ds, request).subscribe({
        next: this.onDataReceived,
      });
    } catch (err) {
      console.error('PanelQueryRunner Error', err);
    }
  }

  private onDataReceived = (data: PanelData) => {
    this.setState({ data });
  };
}

async function getDataSource(datasource: DataSourceRef | undefined, scopedVars: ScopedVars): Promise<DataSourceApi> {
  if (datasource && (datasource as any).query) {
    return datasource as DataSourceApi;
  }
  return await getDatasourceSrv().get(datasource as string, scopedVars);
}
