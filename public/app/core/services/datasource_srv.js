define([
  'angular',
  'lodash',
  '../core_module',
  'app/core/config',
  'app/core/utils/datemath',
],
function (angular, _, coreModule, config, dateMath) {
  'use strict';

  coreModule.default.service('datasourceSrv', function($q, $injector, $rootScope) {
    var self = this;

    this.init = function() {
      this.datasources = {};
      this.metricSources = [];
      this.annotationSources = [];

      _.each(config.datasources, function(value, key) {
        if (value.meta && value.meta.metrics) {
          self.metricSources.push({
            value: key === config.defaultDatasource ? null : key,
            name: key,
            meta: value.meta,
          });
        }
        if (value.meta && value.meta.annotations) {
          self.annotationSources.push(value);
        }
      });

      this.metricSources.sort(function(a, b) {
        if (a.meta.builtIn || a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
    };

    this.get = function(name) {
      if (!name) {
        return this.get(config.defaultDatasource);
      }

      if (this.datasources[name]) {
        return $q.when(this.datasources[name]);
      }

      return this.loadDatasource(name);
    };

    this.loadDatasource = function(name) {
      var dsConfig = config.datasources[name];
      if (!dsConfig) {
        return $q.reject({message: "Datasource named " + name + " was not found"});
      }

      var deferred = $q.defer();
      var pluginDef = dsConfig.meta;

      System.import(pluginDef.module).then(function(plugin) {
        // check if its in cache now
        if (self.datasources[name]) {
          deferred.resolve(self.datasources[name]);
          return;
        }

        // plugin module needs to export a constructor function named Datasource
        if (!plugin.Datasource) {
          throw "Plugin module is missing Datasource constructor";
        }

        var instance = $injector.instantiate(plugin.Datasource, {instanceSettings: dsConfig});
        instance.meta = pluginDef;
        instance.name = name;
        self.datasources[name] = instance;
        deferred.resolve(instance);
      }).catch(function(err) {
        $rootScope.appEvent('alert-error', [dsConfig.name + ' plugin failed', err.toString()]);
      });

      return deferred.promise;
    };

    this.getAll = function() {
      return config.datasources;
    };

    this.getAnnotationSources = function() {
      return this.annotationSources;
    };

    this.getMetricSources = function() {
      return this.metricSources;
    };

    this.getServiceStatus = function(query, startTime, endTime) {
      var end = endTime ? dateMath.parse(endTime, false).valueOf() : null;
      return this.get('opentsdb').then(function(datasource) {
        var service = _.getMetricName(query[0].metric);
        return datasource.performTimeSeriesQuery(query, dateMath.parse(startTime, false).valueOf(), end).then(function(response) {
          var status = null;
          var host = null;
          if (_.isEmpty(response.data)) {
            throw Error;
          }
          _.each(response.data, function (metricData) {
            host = metricData.tags.host;
            if (_.isObject(metricData)) {
              status = metricData.dps[Object.keys(metricData.dps)[0]];
            }
          });
          return {name: service, status: status, host: host};
        });
      });
    }

    this.init();
  });
});
