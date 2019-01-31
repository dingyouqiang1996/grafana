import _ from 'lodash';

export default class ExpQuery {
  datasource: any;
  qs: any;
  options: any;

  /** @ngInject */
  constructor(datasource) {
    this.datasource = datasource;
    this.qs = [];
  }

  registerTarget(target, options) {
    this.qs.push(this.convertTargetToQuery(target));
    this.options = options;
  }

  getPromises() {
    const start = this.datasource.convertToTSDBTime(this.options.rangeRaw.from, false);
    const end = this.datasource.convertToTSDBTime(this.options.rangeRaw.to, true);

    const queries = _.compact(this.qs);

    // No valid targets, return the empty result to save a round trip.
    if (_.isEmpty(queries)) {
      const d = this.datasource.$q.defer();
      d.resolve({ data: [] });
      return d.promise;
    }

    const groupByTags = {};
    _.each(queries, query => {
      if (query.filters && query.filters.length > 0) {
        _.each(query.filters, val => {
          groupByTags[val.tagk] = true;
        });
      } else {
        _.each(query.tags, (val, key) => {
          groupByTags[key] = true;
        });
      }
    });

    const queriesPromises = [];
    if (queries.length > 0) {
      for (let qIndex = 0; qIndex < queries.length; qIndex++) {
        const queriesPromise = this.performTimeSeriesQuery(qIndex, queries[qIndex], start, end, this.options).then(
          response => {
            const targets = this.options.targets;

            const targetIndex = this.mapMetricsToTargets(response.outputs, response.config.url);

            const result = _.map(response.data, queryData => {
              let index = targetIndex;
              if (index === -1) {
                index = 0;
              }
              return this.transformMetricData(queryData, targets[index], this.datasource.tsdbResolution);
            });

            return result.filter(value => {
              return value !== false;
            });
          }
        );

        queriesPromises.push(queriesPromise);
      }
    }
    return queriesPromises;
  }

  performTimeSeriesQuery(idx, exp, start, end, globalOptions) {
    let urlParams = '?expIndex=' + idx;
    urlParams = this.datasource.templateSrv.replace(urlParams, globalOptions.scopedVars, 'pipe');
    exp['time']['start'] = start;
    const options = {
      method: 'POST',
      url: this.datasource.url + '/api/query/exp' + urlParams,
      data: exp,
    };
    if (end) {
      exp['time']['end'] = end;
    }

    this.datasource._addCredentialOptions(options);
    return this.datasource.backendSrv.datasourceRequest(options);
  }

  transformMetricData(exp, target, tsdbResolution) {
    if (typeof target === 'undefined') {
      // the metric is hidden
      return false;
    }

    const metricLabel = this.createMetricLabel(exp);
    const dps = this.getDatapointsAtCorrectResolution(exp, tsdbResolution);
    return { target: metricLabel, datapoints: dps };
  }

  getDatapointsAtCorrectResolution(result, tsdbResolution) {
    const dps = [];

    // TSDB returns datapoints has a hash of ts => value.
    // Can't use _.pairs(invert()) because it stringifies keys/values
    _.each(result.outputs.dps, (v, k) => {
      if (tsdbResolution === 2) {
        dps.push([v, k * 1]);
      } else {
        dps.push([v, k * 1000]);
      }
    });

    return dps;
  }

  createMetricLabel(md) {
    const label = md.id;
    return label;
  }

  convertTargetToQuery(target) {
    // filter out a target if it is 'hidden'
    if (target.hide === true) {
      return null;
    }
    return JSON.parse(target.exp);
  }

  mapMetricsToTargets(outputs, queryUrl) {
    // extract gexpIndex from URL
    const regex = /.+expIndex=(\d+).*/;
    const expIndex = queryUrl.match(regex);

    if (!expIndex) {
      return -1;
    }

    return expIndex[1];
  }
}
