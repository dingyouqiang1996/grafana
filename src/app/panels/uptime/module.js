/** @scratch /panels/5
 * include::panels/uptime.asciidoc[]
 */

/** @scratch /panels/uptime/0
 * == uptime
 * Status: *Experimental*
 *
 * The uptime panel is used for displaying percent uptime, where uptime is defined as the time that a
 * given metric is below a given threshold.
 *
 */
define([
  'angular',
  'app',
  'jquery',
  'underscore',
  'kbn',
  '../graphite/timeSeries',
],
function (angular, app, $, _, kbn, moment, timeSeries) {
  'use strict';

  var module = angular.module('kibana.panels.text', []);
  app.useModule(module);

  module.controller('uptime', function($scope, $rootScope, filterSrv, datasourceSrv, $timeout, annotationsSrv) {
    $scope.panelMeta = {
      description : "An text panel that displayed percent uptime, where uptime is the percent of time that a given metric is below a given threshold"
    };

    // Set and populate defaults
    var _d = {
      /** @scratch /panels/text/5
       * metric:: the metric to measure
       *
       *
       */
      metric    : "", // 'html','markdown','text'
      /** @scratch /panels/text/5
       * threshold:: the threshold when, if exceeded, the metric is "down"
       */
      threshold : "",
      uptime: "",
      style: {},
    };
    _.defaults($scope.panel,_d);

    $scope.init = function() {
      $scope.initPanel($scope);
      $scope.datasources = datasourceSrv.listOptions();
      $scope.setDatasource($scope.panel.datasource);
    };

    $scope.setDatasource = function(datasource) {
      $scope.panel.datasource = datasource;
      $scope.datasource = datasourceSrv.get(datasource);
      if (!$scope.datasource) {
        $scope.panel.error = "Cannot find datasource " + datasource;
        console.log("Cannot find datasource",datasource);
        return;
      }
      $scope.get_data();
    };

    $scope.dataHandler = function(data) {
        var sla = [ 5000,  0.1 ];

        // compute uptime from response data
        var response = data.data;
        var timesegments_total = 0.0;
        var timesegments_out_of_sla = 0;
        // convert the response, which is separate series, into one
        var results = {};
        for (var i in response) {
            var datapoints = response[i].datapoints;
            for (var j in datapoints) {
                var value = datapoints[j][0];
                var timestamp = datapoints[j][1];
                if (!(timestamp in results)) {
                    results[timestamp] = {};
                }
                results[timestamp][i] = value;
            }
        }
        // now scan and generate uptime
        for (i in results) {
            var metric0 = parseFloat(results[i][0]);
            var metric1 = parseFloat(results[i][1]);
            timesegments_total += 1;
            var out_of_sla = false;
            if (metric0 > sla[0])  {
                timesegments_out_of_sla += 1;
                out_of_sla = true;
            }
            if (metric1 > sla[1]) {
                timesegments_out_of_sla += 1;
                out_of_sla = true;
            }
            //console.log( results[i][0] + "=" + p95 + ":" + results[i][1] + "=" + error_percentage + ":" + out_of_sla);
        }
        var uptime = (1.0 - (timesegments_out_of_sla/timesegments_total)) * 100.0;
        // round to 2 decimals
        uptime = parseFloat(Math.round(uptime * 100) / 100).toFixed(2);
        console.log("xxx gotdata computed uptime",timesegments_out_of_sla,"/",timesegments_total,"=",uptime);
        $scope.uptime = uptime;
    }

    $scope.updateTimeRange = function () {
      $scope.range = filterSrv.timeRange();
      $scope.rangeUnparsed = filterSrv.timeRange(false);
      $scope.resolution = Math.ceil(($(window).width() * ($scope.panel.span / 12)) / 2);
      $scope.interval = '10m';
      if ($scope.range) {
        $scope.interval = kbn.secondsToHms(
          kbn.calculate_interval($scope.range.from, $scope.range.to, $scope.resolution, 0) / 1000
        );
      }
    };

    $scope.get_data = function() {
      $scope.updateTimeRange();
      delete $scope.panel.error;
      var graphiteQuery = {
        range: $scope.rangeUnparsed,
        interval: $scope.interval,
        targets: [ 
            { target: "maxSeries(api-production-iad.timers.httpd.api._total_node_requests.*.*.upper_95.total_max)" } ,
            { target: "asPercent( sumSeries(api-production-iad.timers.httpd.api._total_node_requests.*.500.count_ps.total_sum), sumSeries(api-production-iad.timers.httpd.api._total_node_requests.*.*.count_ps.total_sum))" },
        ],
        format: "json",
        maxDataPoints: 10000,
        datasource: $scope.datasource
      };

      return $scope.datasource.query(graphiteQuery)
        .then($scope.dataHandler)
        .then(null, function(err) {
            console.log("datasource.query error:");
            console.log(err.stack);
          $scope.panel.error = err.message || "Graphite HTTP Request Error";
        });

    };


    $scope.render = function(data) {
      $scope.$emit('render', data);
    };


  });

  module.directive('uptime', function() {
    return {
      restrict: 'E',
      link: function(scope, element) {

        scope.$on('render', function() {
          render_panel();
        });

        scope.$on('refresh',function() {
          scope.get_data();
        });

        function render_panel() {
            // console.log("render_panel: ",scope.panel.metric,scope.panel.threshold,scope.panel.uptime);
            // element.html("xxblah blah:" + scope.panel.metric + ":" + scope.panel.threshold + ":" + scope.panel.uptime);
            // For whatever reason, this fixes chrome. I don't like it, I think
            // it makes things slow?
            //if(!scope.$$phase) { scope.$apply(); }
        }

        render_panel();
      }
    };
  });




});


