import isString from 'lodash/isString';
import {
  DataSourceApi,
  DataQueryRequest,
  PanelData,
  LoadingState,
  toLegacyResponseData,
  isSeriesData,
  toSeriesData,
  DataQueryError,
  DataStreamObserver,
  DataStreamState,
  SeriesData,
} from '@grafana/ui';
import { getProcessedSeriesData } from './PanelQueryRunner';
import { getBackendSrv } from 'app/core/services/backend_srv';
import isEqual from 'lodash/isEqual';
import * as dateMath from 'app/core/utils/datemath';

export class PanelQueryState {
  // The current/last running request
  request = {
    startTime: 0,
    endTime: 1000, // Somethign not zero
  } as DataQueryRequest;

  // The best known state of data (but ignore the request object)
  results = {
    state: LoadingState.NotStarted,
    series: [],
  } as PanelData;

  // Active stream results
  streams: DataStreamState[] = [];

  sendSeries = false;
  sendLegacy = false;

  // A promise for the running query
  private executor: Promise<PanelData> = {} as any;
  private rejector = (reason?: any) => {};
  private datasource: DataSourceApi = {} as any;

  isFinished(state: LoadingState) {
    return state === LoadingState.Done || state === LoadingState.Error;
  }

  isRunning() {
    const state = this.results.state;
    return state === LoadingState.Loading || state === LoadingState.Streaming;
  }

  isStarted() {
    return this.results.state !== LoadingState.NotStarted;
  }

  isSameQuery(ds: DataSourceApi, req: DataQueryRequest) {
    if (ds !== this.datasource) {
      return false;
    }

    // For now just check that the targets look the same
    return isEqual(this.request.targets, req.targets);
  }

  getCurrentExecutor() {
    return this.executor;
  }

  cancel(reason: string) {
    const { request } = this;
    try {
      if (!request.endTime) {
        request.endTime = Date.now();

        this.rejector('Canceled:' + reason);
      }

      // Cancel any open HTTP request with the same ID
      if (request.requestId) {
        getBackendSrv().resolveCancelerIfExists(request.requestId);
      }
    } catch (err) {
      console.log('Error canceling request');
    }

    // Close any open streams
    this.closeStreams(true);
  }

  execute(ds: DataSourceApi, req: DataQueryRequest): Promise<PanelData> {
    this.request = req;

    // Return early if there are no queries to run
    if (!req.targets.length) {
      console.log('No queries, so return early');
      this.request.endTime = Date.now();
      this.closeStreams();
      return Promise.resolve(
        (this.results = {
          state: LoadingState.Done,
          series: [], // Clear the data
          legacy: [],
          request: req,
        })
      );
    }

    // Set the loading state immediatly
    this.results.state = LoadingState.Loading;
    return (this.executor = new Promise<PanelData>((resolve, reject) => {
      this.rejector = reject;

      return ds
        .query(this.request, this.streamDataObserver)
        .then(resp => {
          this.request.endTime = Date.now();

          // Make sure we send something back -- called run() w/o subscribe!
          if (!(this.sendSeries || this.sendLegacy)) {
            this.sendSeries = true;
          }

          // Save the result state
          this.results = {
            state: LoadingState.Done,
            request: this.request,
            series: this.sendSeries ? getProcessedSeriesData(resp.data) : [],
            legacy: this.sendLegacy
              ? resp.data.map(v => {
                  if (isSeriesData(v)) {
                    return toLegacyResponseData(v);
                  }
                  return v;
                })
              : undefined,
          };
          resolve(this.getPanelData());
        })
        .catch(err => {
          resolve(this.setError(err));
        });
    }));
  }

  // Send a notice when the stream has updated the current model
  streamCallback: () => void;

  // This gets all stream events and keeps track of them
  // it will then delegate real changes to the PanelQueryRunner
  streamDataObserver: DataStreamObserver = (stream: DataStreamState) => {
    // Streams only work with the 'series' format
    this.sendSeries = true;

    // Add the stream to our list
    let found = false;
    const active = this.streams.map(s => {
      if (s.key === stream.key) {
        found = true;
        return stream;
      }
      return s;
    });

    if (!found) {
      if (shouldDisconnect(this.request, stream)) {
        stream.unsubscribe();
        return;
      }
      active.push(stream);
    }
    this.streams = active;
    this.streamCallback();
  };

  closeStreams(keepSeries = false) {
    if (this.streams.length) {
      const series: SeriesData[] = [];
      for (const stream of this.streams) {
        if (stream.series) {
          series.push.apply(series, stream.series);
        }
        try {
          stream.unsubscribe();
        } catch {}
      }
      this.streams = [];

      // Move the series from streams to the resposne
      if (keepSeries) {
        this.results = {
          ...this.results,
          series: [...this.results.series, ...series],
        };
      }
    }
  }

  getPanelData(): PanelData {
    const { results, streams, request } = this;

    // Without streams it is just the result
    if (!streams.length) {
      return {
        ...results,
        request: request,
      };
    }

    let done = this.isFinished(results.state);
    const series = [...results.series];
    const active: DataStreamState[] = [];
    for (const stream of this.streams) {
      if (shouldDisconnect(request, stream)) {
        stream.unsubscribe();
        continue;
      }

      active.push(stream);
      series.push.apply(series, stream.series);
      if (!this.isFinished(stream.state)) {
        done = false;
      }
    }
    this.streams = active;

    // Update the time range
    let timeRange = this.request.range;
    if (isString(timeRange.raw.from)) {
      timeRange = {
        from: dateMath.parse(timeRange.raw.from, false),
        to: dateMath.parse(timeRange.raw.to, true),
        raw: timeRange.raw,
      };
    }

    return {
      state: done ? LoadingState.Done : LoadingState.Streaming,
      series, // Union of series from response and all streams
      legacy: this.sendLegacy ? series.map(s => toLegacyResponseData(s)) : undefined,
      request: {
        ...this.request,
        range: timeRange, // update the time range
      },
    };
  }

  /**
   * Make sure all requested formats exist on the data
   */
  getDataAfterCheckingFormats(): PanelData {
    const { results, sendLegacy, sendSeries } = this;
    if (sendLegacy && (!results.legacy || !results.legacy.length)) {
      results.legacy = results.series.map(v => toLegacyResponseData(v));
    }
    if (sendSeries && !results.series.length && results.legacy) {
      results.series = results.legacy.map(v => toSeriesData(v));
    }
    return this.getPanelData();
  }

  setError(err: any): PanelData {
    if (!this.request.endTime) {
      this.request.endTime = Date.now();
    }
    this.closeStreams(true);
    this.results = {
      ...this.results, // Keep any existing data
      state: LoadingState.Error,
      error: toDataQueryError(err),
    };
    return this.getPanelData();
  }
}

export function shouldDisconnect(source: DataQueryRequest, state: DataStreamState) {
  // It came from the same the same request, so keep it
  if (source === state.request || state.request.requestId.startsWith(source.requestId)) {
    return false;
  }

  // We should be able to check that it is the same query regardless of
  // if it came from the same request. This will be important for #16676

  return true;
}

export function toDataQueryError(err: any): DataQueryError {
  const error = (err || {}) as DataQueryError;
  if (!error.message) {
    if (typeof err === 'string' || err instanceof String) {
      return { message: err } as DataQueryError;
    }

    let message = 'Query error';
    if (error.message) {
      message = error.message;
    } else if (error.data && error.data.message) {
      message = error.data.message;
    } else if (error.data && error.data.error) {
      message = error.data.error;
    } else if (error.status) {
      message = `Query error: ${error.status} ${error.statusText}`;
    }
    error.message = message;
  }
  return error;
}
