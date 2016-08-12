define([
    'angular',
    'lodash',
    'config',
  ],
  function (angular, _) {
    'use strict';

    var module = angular.module('grafana.services');

    module.service('healthSrv', function ($http, backendSrv) {
      var anomalyListUrl = "";
      this.anomalyUrlRoot = "";
      this.anomalyMetricsData = [];
      var _this = this;

      this.init = function () {
        backendSrv.get('/api/alertsource').then(function (result) {
          _this.anomalyUrlRoot = result.alert.alert_urlroot;
          anomalyListUrl = _this.anomalyUrlRoot + "/anomaly";
        });
      };
      this.load = function () {
        return $http({
          method: "get",
          url: anomalyListUrl
        }).then(function onSuccess(response) {
          _this.anomalyMetricsData = response.data.includedMetricHealths.concat(response.data.excludedMetricHealths);
          return response.data;
        }, function onFailed(response) {
          return response;
        });
      };

      this.exclude = function(metricName){
        $http({
          method: "post",
          url: anomalyListUrl + "/exclude",
          params: {
            metric: metricName
          }
        }).then(function onSuccess(response) {
          return response.data;
        }, function onFailed(response) {
          return response;
        });
      };

      this.include = function(metricName){
        $http({
          method: "post",
          url: anomalyListUrl + "/include",
          params: {
            metric: metricName
          }
        }).then(function onSuccess(response) {
          return response.data;
        }, function onFailed(response) {
          return response;
        });
      };

    });
  });
