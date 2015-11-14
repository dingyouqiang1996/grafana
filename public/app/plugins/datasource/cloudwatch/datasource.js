define([
  'angular',
  'lodash',
  'moment',
  './query_ctrl',
  './directives',
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('CloudWatchDatasource', function($q, backendSrv, templateSrv) {

    function CloudWatchDatasource(datasource) {
      this.type = 'cloudwatch';
      this.name = datasource.name;
      this.supportMetrics = true;
      this.proxyUrl = datasource.url;
      this.defaultRegion = datasource.jsonData.defaultRegion;
    }

    CloudWatchDatasource.prototype.query = function(options) {
      var start = convertToCloudWatchTime(options.range.from);
      var end = convertToCloudWatchTime(options.range.to);

      var queries = [];
      _.each(options.targets, _.bind(function(target) {
        if (target.hide || !target.namespace || !target.metricName || _.isEmpty(target.statistics)) {
          return;
        }

        var query = {};
        query.region = templateSrv.replace(target.region, options.scopedVars);
        query.namespace = templateSrv.replace(target.namespace, options.scopedVars);
        query.metricName = templateSrv.replace(target.metricName, options.scopedVars);
        query.dimensions = convertDimensionFormat(target.dimensions, options.scopedVars);
        query.statistics = target.statistics;

        var range = end - start;
        query.period = parseInt(target.period, 10) || 60;

        if (range / query.period >= 1440) {
          query.period = Math.ceil(range / 1440 / 60) * 60;
        }

        queries.push(query);
      }, this));

      // No valid targets, return the empty result to save a round trip.
      if (_.isEmpty(queries)) {
        var d = $q.defer();
        d.resolve({ data: [] });
        return d.promise;
      }

      var allQueryPromise = _.map(queries, function(query) {
        return this.performTimeSeriesQuery(query, start, end);
      }, this);

      return $q.all(allQueryPromise).then(function(allResponse) {
        var result = [];

        _.each(allResponse, function(response, index) {
          var metrics = transformMetricData(response, options.targets[index]);
          result = result.concat(metrics);
        });

        return { data: result };
      });
    };

    CloudWatchDatasource.prototype.performTimeSeriesQuery = function(query, start, end) {
      return this.awsRequest({
        region: query.region,
        action: 'GetMetricStatistics',
        parameters:  {
          namespace: query.namespace,
          metricName: query.metricName,
          dimensions: query.dimensions,
          statistics: query.statistics,
          startTime: start,
          endTime: end,
          period: query.period
        }
      });
    };

    CloudWatchDatasource.prototype.getRegions = function() {
      return this.awsRequest({action: '__GetRegions'});
    };

    CloudWatchDatasource.prototype.getNamespaces = function() {
      return this.awsRequest({action: '__GetNamespaces'});
    };

    CloudWatchDatasource.prototype.getMetrics = function(namespace) {
      return this.awsRequest({
        action: '__GetMetrics',
        parameters: {
          namespace: templateSrv.replace(namespace)
        }
      });
    };

    CloudWatchDatasource.prototype.getDimensionKeys = function(namespace) {
      return this.awsRequest({
        action: '__GetDimensions',
        parameters: {
          namespace: templateSrv.replace(namespace)
        }
      });
    };

    CloudWatchDatasource.prototype.getDimensions = function(region, namespace, metricName, filterDimensions) {
      var request = {
        region: templateSrv.replace(region),
        action: 'ListMetrics',
        parameters: {
          namespace: templateSrv.replace(namespace),
          metricName: templateSrv.replace(metricName),
          dimensions: convertDimensionFormat(filterDimensions, {}),
        }
      };

      return this.awsRequest(request).then(function(result) {
        return _.pluck(result.Metrics, 'Dimensions');
      });
    };

    CloudWatchDatasource.prototype.getDimensionValues = function(region, namespace, metricName, dimensionKey, filterDimensions) {
      return this.getDimensions(region, namespace, metricName, filterDimensions).then(function(dimensions) {
        return _.chain(dimensions)
        .flatten()
        .filter(function(dimension) {
          return dimension.Name === dimensionKey;
        })
        .pluck('Value').uniq().sortBy().value();
      });
    };

    CloudWatchDatasource.prototype.performEC2DescribeInstances = function(region, filters, instanceIds) {
      return this.awsRequest({
        region: region,
        action: 'DescribeInstances',
        parameters: { filter: filters, instanceIds: instanceIds }
      });
    };

    CloudWatchDatasource.prototype.metricFindQuery = function(query) {
      var region;
      var namespace;
      var metricName;
      var dimensionPart;
      var dimensions;

      var transformSuggestData = function(suggestData) {
        return _.map(suggestData, function(v) {
          return { text: v };
        });
      };

      var parseDimensions = function(dimensionPart) {
        if (_.isEmpty(dimensionPart)) {
          return {};
        }
        var dimensions = {};
        _.each(dimensionPart.split(','), function(v) {
          var t = v.split('=');
          if (t.length !== 2) {
            throw new Error('Invalid query format');
          }
          dimensions[t[0]] = t[1];
        });
        return dimensions;
      };

      var regionQuery = query.match(/^regions\(\)/);
      if (regionQuery) {
        return this.getRegions();
      }

      var namespaceQuery = query.match(/^namespaces\(\)/);
      if (namespaceQuery) {
        return this.getNamespaces();
      }

      var metricNameQuery = query.match(/^metrics\(([^\)]+?)\)/);
      if (metricNameQuery) {
        return this.getMetrics(metricNameQuery[1]);
      }

      var dimensionKeysQuery = query.match(/^dimension_keys\(([^\)]+?)\)/);
      if (dimensionKeysQuery) {
        return this.getDimensionKeys(dimensionKeysQuery[1]);
      }

      var dimensionValuesQuery = query.match(/^dimension_values\(([^,]+?),\s?([^,]+?),\s?([^,]+?),\s?([^,]+?)(,\s?([^)]*))?\)/);
      if (dimensionValuesQuery) {
        region = templateSrv.replace(dimensionValuesQuery[1]);
        namespace = templateSrv.replace(dimensionValuesQuery[2]);
        metricName = templateSrv.replace(dimensionValuesQuery[3]);
        var dimensionKey = templateSrv.replace(dimensionValuesQuery[4]);
        dimensionPart = templateSrv.replace(dimensionValuesQuery[6]);

        dimensions = parseDimensions(dimensionPart);
        return this.getDimensionValues(region, namespace, metricName, dimensionKey, dimensions).then(function(result) {
          return _.map(result, function(dimension_value) {
            return { text: dimension_value };
          });
        });
      }

      var dimensionsQuery = query.match(/^dimensions\(([^,]+?),\s?([^,]+?),\s?([^,]+?)(,\s?([^)]*))?\)/);
      if (dimensionsQuery) {
        region = templateSrv.replace(dimensionsQuery[1]);
        namespace = templateSrv.replace(dimensionsQuery[2]);
        metricName = templateSrv.replace(dimensionsQuery[3]);
        dimensionPart = templateSrv.replace(dimensionsQuery[5]);

        dimensions = parseDimensions(dimensionPart);
        return this.getDimensions(region, namespace, metricName, dimensions).then(function(result) {
          return _.map(result, function(dimensions) {
            var values = _.chain(dimensions)
            .sortBy(function(dimension) {
              return dimension.Name;
            })
            .map(function(dimension) {
              return dimension.Name + '=' + dimension.Value;
            })
            .value().join(',');

            return { text: values };
          });
        });
      }

      var ebsVolumeIdsQuery = query.match(/^ebs_volume_ids\(([^,]+?),\s?([^,]+?)\)/);
      if (ebsVolumeIdsQuery) {
        region = templateSrv.replace(ebsVolumeIdsQuery[1]);
        var instanceId = templateSrv.replace(ebsVolumeIdsQuery[2]);
        var instanceIds = [
          instanceId
        ];

        return this.performEC2DescribeInstances(region, [], instanceIds).then(function(result) {
          var volumeIds = _.map(result.Reservations[0].Instances[0].BlockDeviceMappings, function(mapping) {
            return mapping.Ebs.VolumeId;
          });

          return transformSuggestData(volumeIds);
        });
      }

      return $q.when([]);
    };

    CloudWatchDatasource.prototype.testDatasource = function() {
      /* use billing metrics for test */
      var region = this.defaultRegion;
      var namespace = 'AWS/Billing';
      var metricName = 'EstimatedCharges';
      var dimensions = {};

      return this.getDimensions(region, namespace, metricName, dimensions).then(function () {
        return { status: 'success', message: 'Data source is working', title: 'Success' };
      });
    };

    CloudWatchDatasource.prototype.awsRequest = function(data) {
      var options = {
        method: 'POST',
        url: this.proxyUrl,
        data: data
      };

      return backendSrv.datasourceRequest(options).then(function(result) {
        return result.data;
      });
    };

    CloudWatchDatasource.prototype.getDefaultRegion = function() {
      return this.defaultRegion;
    };

    function transformMetricData(md, options) {
      var aliasRegex = /\{\{(.+?)\}\}/g;
      var aliasPattern = options.alias || '{{metric}}_{{stat}}';
      var aliasData = {
        region: templateSrv.replace(options.region),
        namespace: templateSrv.replace(options.namespace),
        metric: templateSrv.replace(options.metricName),
      };
      _.extend(aliasData, options.dimensions);

      return _.map(options.statistics, function(stat) {
        var dps = _.chain(md.Datapoints).map(function(dp) {
          return [dp[stat], new Date(dp.Timestamp).getTime()];
        })
        .sortBy(function(dp) {
          return dp[1];
        }).value();

        aliasData.stat = stat;
        var seriesName = aliasPattern.replace(aliasRegex, function(match, g1) {
          if (aliasData[g1]) {
            return aliasData[g1];
          }
          return g1;
        });

        return {target: seriesName, datapoints: dps};
      });
    }

    function convertToCloudWatchTime(date) {
      return Math.round(date.valueOf() / 1000);
    }

    function convertDimensionFormat(dimensions, scopedVars) {
      return _.map(dimensions, function(value, key) {
        return {
          Name: templateSrv.replace(key, scopedVars),
          Value: templateSrv.replace(value, scopedVars)
        };
      });
    }

    return CloudWatchDatasource;
  });

});
