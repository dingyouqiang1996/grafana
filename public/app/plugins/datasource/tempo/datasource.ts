import { identity, pick, pickBy, groupBy, startCase } from 'lodash';
import { EMPTY, from, merge, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, mergeMap, toArray } from 'rxjs/operators';

import {
  DataQuery,
  DataQueryRequest,
  DataQueryResponse,
  DataQueryResponseData,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataSourceJsonData,
  FieldType,
  isValidGoDuration,
  LoadingState,
  ScopedVars,
} from '@grafana/data';
import {
  config,
  BackendSrvRequest,
  DataSourceWithBackend,
  getBackendSrv,
  TemplateSrv,
  getTemplateSrv,
} from '@grafana/runtime';
import { NodeGraphOptions } from 'app/core/components/NodeGraphSettings';
import { TraceToLogsOptions } from 'app/core/components/TraceToLogs/TraceToLogsSettings';
import { serializeParams } from 'app/core/utils/fetch';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';

import { LokiOptions, LokiQuery } from '../loki/types';
import { PrometheusDatasource } from '../prometheus/datasource';
import { PromQuery } from '../prometheus/types';

import {
  failedMetric,
  histogramMetric,
  mapPromMetricsToServiceMap,
  serviceMapMetrics,
  totalsMetric,
  rateMetric,
  durationMetric,
  errorRateMetric,
} from './graphTransform';
import {
  transformTrace,
  transformTraceList,
  transformFromOTLP as transformFromOTEL,
  createTableFrameFromSearch,
} from './resultTransformer';

// search = Loki search, nativeSearch = Tempo search for backwards compatibility
export type TempoQueryType = 'search' | 'traceId' | 'serviceMap' | 'upload' | 'nativeSearch' | 'clear';

export interface TempoJsonData extends DataSourceJsonData {
  tracesToLogs?: TraceToLogsOptions;
  serviceMap?: {
    datasourceUid?: string;
  };
  search?: {
    hide?: boolean;
  };
  nodeGraph?: NodeGraphOptions;
  lokiSearch?: {
    datasourceUid?: string;
  };
}

export interface TempoQuery extends DataQuery {
  query: string;
  // Query to find list of traces, e.g., via Loki
  linkedQuery?: LokiQuery;
  search: string;
  queryType: TempoQueryType;
  serviceName?: string;
  spanName?: string;
  minDuration?: string;
  maxDuration?: string;
  limit?: number;
  serviceMapQuery?: string;
}

interface SearchQueryParams {
  minDuration?: string;
  maxDuration?: string;
  limit?: number;
  tags: string;
  start?: number;
  end?: number;
}

export const DEFAULT_LIMIT = 20;

export class TempoDatasource extends DataSourceWithBackend<TempoQuery, TempoJsonData> {
  tracesToLogs?: TraceToLogsOptions;
  serviceMap?: {
    datasourceUid?: string;
  };
  search?: {
    hide?: boolean;
  };
  nodeGraph?: NodeGraphOptions;
  lokiSearch?: {
    datasourceUid?: string;
  };
  uploadedJson?: string | ArrayBuffer | null = null;

  constructor(
    private instanceSettings: DataSourceInstanceSettings<TempoJsonData>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);
    this.tracesToLogs = instanceSettings.jsonData.tracesToLogs;
    this.serviceMap = instanceSettings.jsonData.serviceMap;
    this.search = instanceSettings.jsonData.search;
    this.nodeGraph = instanceSettings.jsonData.nodeGraph;
    this.lokiSearch = instanceSettings.jsonData.lokiSearch;
  }

  query(options: DataQueryRequest<TempoQuery>): Observable<DataQueryResponse> {
    const subQueries: Array<Observable<DataQueryResponse>> = [];
    const filteredTargets = options.targets.filter((target) => !target.hide);
    const targets: { [type: string]: TempoQuery[] } = groupBy(filteredTargets, (t) => t.queryType || 'traceId');

    if (targets.clear) {
      return of({ data: [], state: LoadingState.Done });
    }

    const logsDatasourceUid = this.getLokiSearchDS();

    // Run search queries on linked datasource
    if (logsDatasourceUid && targets.search?.length > 0) {
      const dsSrv = getDatasourceSrv();
      subQueries.push(
        from(dsSrv.get(logsDatasourceUid)).pipe(
          mergeMap((linkedDatasource: DataSourceApi) => {
            // Wrap linked query into a data request based on original request
            const linkedRequest: DataQueryRequest = { ...options, targets: targets.search.map((t) => t.linkedQuery!) };
            // Find trace matchers in derived fields of the linked datasource that's identical to this datasource
            const settings: DataSourceInstanceSettings<LokiOptions> = (linkedDatasource as any).instanceSettings;
            const traceLinkMatcher: string[] =
              settings.jsonData.derivedFields
                ?.filter((field) => field.datasourceUid === this.uid && field.matcherRegex)
                .map((field) => field.matcherRegex) || [];

            if (!traceLinkMatcher || traceLinkMatcher.length === 0) {
              return throwError(
                () =>
                  new Error(
                    'No Loki datasource configured for search. Set up Derived Fields for traces in a Loki datasource settings and link it to this Tempo datasource.'
                  )
              );
            } else {
              return (linkedDatasource.query(linkedRequest) as Observable<DataQueryResponse>).pipe(
                map((response) =>
                  response.error ? response : transformTraceList(response, this.uid, this.name, traceLinkMatcher)
                )
              );
            }
          })
        )
      );
    }

    if (targets.nativeSearch?.length) {
      try {
        const timeRange = config.featureToggles.tempoBackendSearch
          ? { startTime: options.range.from.unix(), endTime: options.range.to.unix() }
          : undefined;
        const query = this.applyVariables(targets.nativeSearch[0], options.scopedVars);
        const searchQuery = this.buildSearchQuery(query, timeRange);
        subQueries.push(
          this._request('/api/search', searchQuery).pipe(
            map((response) => {
              return {
                data: [createTableFrameFromSearch(response.data.traces, this.instanceSettings)],
              };
            }),
            catchError((error) => {
              return of({ error: { message: error.data.message }, data: [] });
            })
          )
        );
      } catch (error) {
        return of({ error: { message: error.message }, data: [] });
      }
    }

    if (targets.upload?.length) {
      if (this.uploadedJson) {
        const otelTraceData = JSON.parse(this.uploadedJson as string);
        if (!otelTraceData.batches) {
          subQueries.push(of({ error: { message: 'JSON is not valid OpenTelemetry format' }, data: [] }));
        } else {
          subQueries.push(of(transformFromOTEL(otelTraceData.batches, this.nodeGraph?.enabled)));
        }
      } else {
        subQueries.push(of({ data: [], state: LoadingState.Done }));
      }
    }

    if (this.serviceMap?.datasourceUid && targets.serviceMap?.length > 0) {
      const dsid = this.serviceMap.datasourceUid;

      subQueries.push(
        firstServiceMapQuery(options, this.serviceMap.datasourceUid).pipe(
          concatMap((result) => secondServiceMapQuery(options, result, dsid, this.name))
        )
      );
    }

    if (targets.traceId?.length > 0) {
      subQueries.push(this.handleTraceIdQuery(options, targets.traceId));
    }

    return merge(...subQueries);
  }

  applyTemplateVariables(query: TempoQuery, scopedVars: ScopedVars): Record<string, any> {
    return this.applyVariables(query, scopedVars);
  }

  interpolateVariablesInQueries(queries: TempoQuery[], scopedVars: ScopedVars): TempoQuery[] {
    if (!queries || queries.length === 0) {
      return [];
    }

    return queries.map((query) => {
      return {
        ...query,
        datasource: this.getRef(),
        ...this.applyVariables(query, scopedVars),
      };
    });
  }

  applyVariables(query: TempoQuery, scopedVars: ScopedVars) {
    const expandedQuery = { ...query };

    if (query.linkedQuery) {
      expandedQuery.linkedQuery = {
        ...query.linkedQuery,
        expr: this.templateSrv.replace(query.linkedQuery?.expr ?? '', scopedVars),
      };
    }

    return {
      ...expandedQuery,
      query: this.templateSrv.replace(query.query ?? '', scopedVars),
      search: this.templateSrv.replace(query.search ?? '', scopedVars),
      minDuration: this.templateSrv.replace(query.minDuration ?? '', scopedVars),
      maxDuration: this.templateSrv.replace(query.maxDuration ?? '', scopedVars),
    };
  }

  /**
   * Handles the simplest of the queries where we have just a trace id and return trace data for it.
   * @param options
   * @param targets
   * @private
   */
  private handleTraceIdQuery(
    options: DataQueryRequest<TempoQuery>,
    targets: TempoQuery[]
  ): Observable<DataQueryResponse> {
    const validTargets = targets.filter((t) => t.query);
    if (!validTargets.length) {
      return EMPTY;
    }

    const traceRequest: DataQueryRequest<TempoQuery> = { ...options, targets: validTargets };
    return super.query(traceRequest).pipe(
      map((response) => {
        if (response.error) {
          return response;
        }
        return transformTrace(response, this.nodeGraph?.enabled);
      })
    );
  }

  async metadataRequest(url: string, params = {}) {
    return await this._request(url, params, { method: 'GET', hideFromInspector: true }).toPromise();
  }

  private _request(apiUrl: string, data?: any, options?: Partial<BackendSrvRequest>): Observable<Record<string, any>> {
    const params = data ? serializeParams(data) : '';
    const url = `${this.instanceSettings.url}${apiUrl}${params.length ? `?${params}` : ''}`;
    const req = { ...options, url };

    return getBackendSrv().fetch(req);
  }

  async testDatasource(): Promise<any> {
    const options: BackendSrvRequest = {
      headers: {},
      method: 'GET',
      url: `${this.instanceSettings.url}/api/echo`,
    };
    const response = await getBackendSrv().fetch<any>(options).toPromise();

    if (response?.ok) {
      return { status: 'success', message: 'Data source is working' };
    }
  }

  getQueryDisplayText(query: TempoQuery) {
    if (query.queryType === 'nativeSearch') {
      let result = [];
      for (const key of ['serviceName', 'spanName', 'search', 'minDuration', 'maxDuration', 'limit']) {
        if (query.hasOwnProperty(key) && query[key as keyof TempoQuery]) {
          result.push(`${startCase(key)}: ${query[key as keyof TempoQuery]}`);
        }
      }
      return result.join(', ');
    }
    return query.query;
  }

  buildSearchQuery(query: TempoQuery, timeRange?: { startTime: number; endTime?: number }): SearchQueryParams {
    let tags = query.search ?? '';

    let tempoQuery = pick(query, ['minDuration', 'maxDuration', 'limit']);
    // Remove empty properties
    tempoQuery = pickBy(tempoQuery, identity);

    if (query.serviceName) {
      tags += ` service.name="${query.serviceName}"`;
    }
    if (query.spanName) {
      tags += ` name="${query.spanName}"`;
    }

    // Set default limit
    if (!tempoQuery.limit) {
      tempoQuery.limit = DEFAULT_LIMIT;
    }

    // Validate query inputs and remove spaces if valid
    if (tempoQuery.minDuration) {
      tempoQuery.minDuration = this.templateSrv.replace(tempoQuery.minDuration ?? '');
      if (!isValidGoDuration(tempoQuery.minDuration)) {
        throw new Error('Please enter a valid min duration.');
      }
      tempoQuery.minDuration = tempoQuery.minDuration.replace(/\s/g, '');
    }
    if (tempoQuery.maxDuration) {
      tempoQuery.maxDuration = this.templateSrv.replace(tempoQuery.maxDuration ?? '');
      if (!isValidGoDuration(tempoQuery.maxDuration)) {
        throw new Error('Please enter a valid max duration.');
      }
      tempoQuery.maxDuration = tempoQuery.maxDuration.replace(/\s/g, '');
    }

    if (!Number.isInteger(tempoQuery.limit) || tempoQuery.limit <= 0) {
      throw new Error('Please enter a valid limit.');
    }

    let searchQuery: SearchQueryParams = { tags, ...tempoQuery };

    if (timeRange) {
      searchQuery.start = timeRange.startTime;
      searchQuery.end = timeRange.endTime;
    }

    return searchQuery;
  }

  async getServiceGraphLabels() {
    const ds = await getDatasourceSrv().get(this.serviceMap!.datasourceUid);
    return ds.getTagKeys!();
  }

  async getServiceGraphLabelValues(key: string) {
    const ds = await getDatasourceSrv().get(this.serviceMap!.datasourceUid);
    return ds.getTagValues!({ key });
  }

  // Get linked loki search datasource. Fall back to legacy loki search/trace to logs config
  getLokiSearchDS = (): string | undefined => {
    const legacyLogsDatasourceUid =
      this.tracesToLogs?.lokiSearch !== false && this.lokiSearch === undefined
        ? this.tracesToLogs?.datasourceUid
        : undefined;
    return this.lokiSearch?.datasourceUid ?? legacyLogsDatasourceUid;
  };
}

function queryServiceMapPrometheus(request: DataQueryRequest<PromQuery>, datasourceUid: string) {
  return from(getDatasourceSrv().get(datasourceUid)).pipe(
    mergeMap((ds) => {
      return (ds as PrometheusDatasource).query(request);
    })
  );
}

function firstServiceMapQuery(request: DataQueryRequest<TempoQuery>, datasourceUid: string) {
  const serviceMapRequest = makePromServiceMapRequest(request);
  serviceMapRequest.targets = makeApmMetricsRequest([rateMetric], request).concat(serviceMapRequest.targets as any);

  return queryServiceMapPrometheus(serviceMapRequest, datasourceUid).pipe(
    // Just collect all the responses first before processing into node graph data
    toArray(),
    map((responses: DataQueryResponse[]) => {
      const errorRes = responses.find((res) => !!res.error);
      if (errorRes) {
        throw new Error(errorRes.error!.message);
      }

      const { nodes, edges } = mapPromMetricsToServiceMap(responses, request.range);
      nodes.fields[0].config = {
        links: [
          makePromLink(
            'Request rate',
            `rate(${totalsMetric}{server="\${__data.fields.id}"}[$__rate_interval])`,
            datasourceUid,
            false
          ),
          makePromLink(
            'Request histogram',
            `histogram_quantile(0.9, sum(rate(${histogramMetric}{server="\${__data.fields.id}"}[$__rate_interval])) by (le, client, server))`,
            datasourceUid,
            false
          ),
          makePromLink(
            'Failed request rate',
            `rate(${failedMetric}{server="\${__data.fields.id}"}[$__rate_interval])`,
            datasourceUid,
            false
          ),
        ],
      };

      return {
        data: [responses, nodes, edges],
        state: LoadingState.Done,
      };
    })
  );
}

// we need the response from the first query to get the rate span_name(s),
// -> which determine the error rate span_name(s) we need to query
function secondServiceMapQuery(
  request: DataQueryRequest<TempoQuery>,
  firstResponses: DataQueryResponse,
  datasourceUid: string,
  tempoDatasourceUid: string
) {
  const spanNames = firstResponses.data[0][0].data[0].fields[1].values.toArray().join('|');
  const errorRateExprWithErrorSpanNames = buildExpr(errorRateMetric, '{span_name=~"' + spanNames + '"}');
  const serviceMapRequest = makePromServiceMapRequest(request);
  serviceMapRequest.targets = makeApmMetricsRequest([errorRateExprWithErrorSpanNames, durationMetric], request);

  return queryServiceMapPrometheus(serviceMapRequest, datasourceUid).pipe(
    // Just collect all the responses first before processing into node graph data
    toArray(),
    map((secondResponses: DataQueryResponse[]) => {
      const errorRes = secondResponses.find((res) => !!res.error);
      if (errorRes) {
        throw new Error(errorRes.error!.message);
      }

      const apmTable = getApmTable(
        request,
        firstResponses,
        secondResponses[0],
        errorRateExprWithErrorSpanNames,
        datasourceUid,
        tempoDatasourceUid
      );

      return {
        data: [apmTable, firstResponses.data[1], firstResponses.data[2]],
        state: LoadingState.Done,
      };
    })
  );
}

function makePromLink(title: string, expr: string, datasourceUid: string, instant: boolean) {
  return {
    url: '',
    title,
    internal: {
      query: {
        expr: expr,
        range: !instant,
        exemplar: !instant,
        instant: instant,
      } as PromQuery,
      datasourceUid,
      datasourceName: 'Prometheus',
    },
  };
}

function makePromServiceMapRequest(options: DataQueryRequest<TempoQuery>): DataQueryRequest<PromQuery> {
  return {
    ...options,
    targets: serviceMapMetrics.map((metric) => {
      return {
        refId: metric,
        // options.targets[0] is not correct here, but not sure what should happen if you have multiple queries for
        // service map at the same time anyway
        expr: `rate(${metric}${options.targets[0].serviceMapQuery || ''}[$__range])`,
        instant: true,
      };
    }),
  };
}

// APM Table
/////////////////////////

function getApmTable(
  request: DataQueryRequest<TempoQuery>,
  firstResponse: DataQueryResponse,
  secondResponse: DataQueryResponse,
  errorRateExprWithErrorSpanNames: string,
  datasourceUid: string,
  tempoDatasourceUid: string
) {
  var df: any = {};
  // filter does not return table results
  // if (response.data.length <= 4) {
  //   df = toDataFrame([]);
  // } else {

  const rateExpr = buildExpr(rateMetric, request.targets[0].serviceMapQuery);
  const rate = firstResponse.data[0][0].data.filter((x: { refId: string }) => {
    return x.refId === rateExpr;
  });
  const errorRateExpr = buildExpr(errorRateMetric, request.targets[0].serviceMapQuery);
  const errorRate = secondResponse.data.filter((x) => {
    return x.refId === errorRateExprWithErrorSpanNames;
  });
  const durationExpr = buildExpr(durationMetric, request.targets[0].serviceMapQuery);
  const duration = secondResponse.data.filter((x) => {
    return x.refId === durationExpr;
  });

  df.fields = [];
  if (rate.length > 0 && rate[0].fields?.length > 2) {
    df.fields.push({
      ...rate[0].fields[1],
      name: 'Name',
    });

    df.fields.push({
      ...rate[0].fields[2],
      name: 'Rate',
      config: {
        links: [makePromLink('Rate', rateExpr, datasourceUid, false)],
        decimals: 2,
      },
    });

    df.fields.push({
      ...rate[0].fields[2],
      name: ' ',
      labels: null,
      config: {
        color: {
          mode: 'continuous-BlPu',
        },
        custom: {
          displayMode: 'lcd-gauge',
        },
        decimals: 3,
      },
    });
  }

  if (errorRate.length > 0 && errorRate[0].fields?.length > 2) {
    const values = getErrorRateValues(rate, errorRate);

    df.fields.push({
      ...errorRate[0].fields[2],
      name: 'Error Rate',
      values: values,
      config: {
        links: [makePromLink('Error Rate', errorRateExpr, datasourceUid, false)],
        decimals: 2,
      },
    });

    df.fields.push({
      ...errorRate[0].fields[2],
      name: '  ',
      values: values,
      labels: null,
      config: {
        color: {
          mode: 'continuous-RdYlGr',
        },
        custom: {
          displayMode: 'lcd-gauge',
        },
        decimals: 3,
      },
    });
  }

  if (duration.length > 0 && duration[0].fields?.length > 1) {
    df.fields.push({
      ...duration[0].fields[1],
      name: 'Duration (p90)',
      config: {
        links: [makePromLink('Duration', durationExpr, datasourceUid, false)],
        unit: 'ms',
      },
    });
  }

  if (df.fields.length > 0 && df.fields[0].values) {
    df.fields.push({
      name: 'Links',
      type: FieldType.string,
      values: df.fields[0].values.map(() => {
        return 'Tempo';
      }),
      config: {
        links: [makeTempoLink('Tempo', tempoDatasourceUid, '')],
      },
    });
  }
  // }

  return df;
}

function buildExpr(metric: string, serviceMapQuery: string | undefined) {
  if (!serviceMapQuery || serviceMapQuery === '{}') {
    const replaceString = metric.includes(',-REPLACE-') ? ',-REPLACE-' : '-REPLACE-';
    return `${metric.replace(replaceString, '')}`;
  }
  // map serviceGraph metric tags to APM metric tags
  serviceMapQuery = serviceMapQuery.replace('client', 'service').replace('server', 'service');
  serviceMapQuery = serviceMapQuery.replace('{', '').replace('}', '');
  return `${metric.replace('-REPLACE-', serviceMapQuery)}`;
}

function getErrorRateValues(rate: DataQueryResponseData[], errorRate: DataQueryResponseData[]) {
  const errorRateNames = errorRate[0].fields[1].values.toArray();
  const errorRateValues = errorRate[0].fields[2].values.toArray();
  const rateNames = rate[0].fields[1].values.toArray().sort();

  let tempRateNames = rate[0].fields[1].values.toArray().sort();
  let values: string[] = [];
  let errorRateMap: any = {};
  errorRateNames.map((name: string, index: number) => {
    errorRateMap[name] = { name: name, value: errorRateValues[index] };
  });
  errorRateMap = Object.keys(errorRateMap)
    .sort()
    .reduce((obj: any, key) => {
      obj[key] = errorRateMap[key];
      return obj;
    }, {});

  for (var i = 0; i < rateNames.length; i++) {
    if (tempRateNames[i]) {
      if (tempRateNames[i] === Object.keys(errorRateMap)[i]) {
        values.push(errorRateMap[Object.keys(errorRateMap)[i]].value);
      } else {
        i--;
        tempRateNames = tempRateNames.slice(1);
        values.push('0');
      }
    }
  }

  return values;
}

function makeApmMetricsRequest(apmMetrics: any[], request: DataQueryRequest<TempoQuery>) {
  const metrics = apmMetrics.map((metric) => {
    const expr = buildExpr(metric, request.targets[0].serviceMapQuery);
    return {
      refId: expr,
      expr: expr,
      instant: true,
    };
  });
  return metrics;
}

function makeTempoLink(title: string, tempoDatasourceUid: string, query: string) {
  return {
    url: '',
    title,
    internal: {
      query: {
        queryType: 'nativeSearch',
        serviceName: 'app',
        spanName: 'HTTP Client',
      } as TempoQuery,
      datasourceUid: tempoDatasourceUid,
      datasourceName: 'Tempo',
    },
  };
}
