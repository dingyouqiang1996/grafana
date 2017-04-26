define([
    'angular',
    'lodash',
    'app/core/utils/datemath',
  ],
  function (angular, _, dateMath) {
    'use strict';

    var module = angular.module('grafana.controllers');

    module.controller('SystemsummaryCtrl', function ($scope, backendSrv, contextSrv, datasourceSrv, alertMgrSrv, healthSrv) {

      var panelMeta = {
          "collapse": false,
          "editable": false,
          "height": "260px",
          "panels": [
            {
              "aliasColors": {
                "test_health": "#EAB839"
              },
              "bars": false,
              "datasource": null,
              "editable": true,
              "error": false,
              "fill": 0,
              "id": 2,
              "lines": true,
              "linewidth": 2,
              "nullPointMode": "connected",
              "percentage": false,
              "renderer": "flot",
              "seriesOverrides": [],
              "span": 12,
              "stack": false,
              "steppedLine": false,
              "targets": [{
                "aggregator": "",
                "currentTagKey":"",
                "currentTagValue":"",
                "downsampleAggregator": "avg",
                "downsampleInterval":"5m",
                "errors":{},
                "hide":false,
                "isCounter":false,
                "metric": "",
                "shouldComputeRate":false,
              }],
              "grid": {
                  "threshold1": "",
                  "threshold1Color": "rgba(216, 200, 27, 0.27)",
                  "threshold2": "" ,
                  "threshold2Color": "rgba(234, 112, 112, 0.22)",
                  "thresholdLine": true
              },
              "tooltip": {
                "shared": true,
                "value_type": "cumulative"
              },
              "type": "graph",
              "x-axis": true,
              "y-axis": true,
              "y_formats": [
                "short",
                "short"
              ],
              "transparent": true,
              "legend": true,
            }
          ],
          "showTitle": false,
          "title": "New row"
        };

      var panelRow = [];

      $scope.panleJson = [
        {fullwidth: false,header: '报警情况',title: '历史报警状态',status:{ success: ['',''], warn: ['警告',0], danger: ['严重',0]}, tip:'2:critical，1:warning,0:normal'},
        {fullwidth: false,header: '智能检测异常指标',title: '历史异常指标概览',status:{ success: ['指标数量',0], warn: ['异常指标',0], danger: ['严重',0]}},
        {fullwidth: false,header: '服务状态',title: '历史服务状态',status:{ success: ['正常服务',0], warn: ['异常服务',0], danger: ['严重',0]}},
        {fullwidth: false,header: '机器连接状态',title: '历史机器连接状态',status:{ success: ['正常机器',0], warn: ['异常机器',0],danger: ['尚未工作',0]}},
        {fullwidth: true,header: '各线程TopN使用情况',title: '', panels:[{title: '各线程CPU占用情况(百分比)TopN'},{title: '各线程内存占用情况(百分比)TopN'},]},
        {fullwidth: true,header: '健康指数趋势',title: '历史健康指数趋势'},
        {fullwidth: true,header: '智能分析预测',title: '',panels:[{title: '磁盘剩余空间',tip:'预计未来1天后，磁盘剩余空间约为'},{title: 'CPU使用情况(百分比)',tip:'预计未来1天后，cpu使用情况约为'},{title: '内存使用情况',tip:'预计未来1天后，内存使用约为'},]},
      ];

      $scope.init = function () {

        $scope.datasource = null;

        $scope.initDashboard({
          meta: {canStar: false, canShare: false, canEdit: false, canSave: false},
          dashboard: {
            system: contextSrv.system,
            title: "总览",
            id: "name",
            rows: $scope.initPanelRow(),
            time: {from: "now-7d", to: "now"}
          }
        }, $scope);

        _.each(datasourceSrv.getAll(), function (ds) {
          if (ds.type === 'opentsdb') {
            datasourceSrv.get(ds.name).then(function (datasource) {
              $scope.datasource = datasource;
            }).then(function () {
              $scope.getAlertStatus();
              $scope.getServices();
              $scope.getHostSummary();
              $scope.getHealth();
              $scope.getPrediction($scope.dashboard.rows[6].panels);
            });
          }
        });

      };

      $scope.initPanelRow = function () {
        _.each($scope.panleJson, function(panel, index) {
          var row = $scope.setPanelTitle(_.cloneDeep(panelMeta), panel.title);
          if(panel.title === '') {
            for(var i=0; i<$scope.panleJson[index].panels.length-1; i++){
              row.panels.push(_.cloneDeep(panelMeta.panels[0]));
            }
            $scope.setPanelMeta(row.panels, panel.panels);
          }
          if(index < 4) {
            row.panels[0].legend = {"alignAsTable": true,"show": true,"rightSide": true,};
          }
          panelRow.push(row);
        });

        panelRow[1].panels[0].legend.show = false;

        $scope.initAlertStatus(panelRow[0].panels[0]);
        $scope.initAnomalyStatus(panelRow[1].panels[0]);
        $scope.initHostSummary(panelRow[3].panels[0].targets[0]);
        $scope.initTopN();
        $scope.initHealth(panelRow[5].panels[0]);
        return panelRow;
      };

      $scope.setPanelTitle = function(rows,title) {
        rows.panels[0].title = title;
        return rows;
      };

      $scope.setPanelMeta = function(panels, panelCon) {
        for(var i in panels) {
          panels[i].span = 12/panels.length;
          panels[i].id = i+1;
          panels[i].title = panelCon[i].title;
        }
      }

      $scope.initAlertStatus = function(panel) {
        var targets = panel.targets[0];
        targets.metric = 'internal.alert.state';
        targets.tags = {'host': '*','alertName':'*'};
        targets.downsampleAggregator = 'max';
        targets.downsampleInterval ='1m';
        targets.alias = "$tag_alertName/$tag_host";
        panel.grid.threshold1 = 0;
        panel.grid.threshold2 = 1;
        panel.grid.leftMin = 0;
        panel.grid.leftMax = 2;
        panel.grid.thresholdLine = false;
        panel.pointradius = 1;
      }

      $scope.getAlertStatus = function() {
        alertMgrSrv.loadTriggeredAlerts().then(function onSuccess(response) {
          if(response.data.length) {
            for (var i = 0; i < response.data.length; i++) {
              var alertDetail = response.data[i];
              if (alertDetail.status.level === "CRITICAL") {
                $scope.panleJson[0].status.danger[1]++;
              } else {
                $scope.panleJson[0].status.warn[1]++;
              }
            }
          } else {
            $scope.panleJson[0].status.success[1] = '系统正常';
          }
        });
      };

      $scope.initAnomalyStatus = function(panel) {
        var targets = panel.targets[0];
        panel.bars = true;
        panel.lines = false;

        targets.metric = 'internal.anomaly.num';
        targets.downsampleInterval = '15m';
        targets.aggregator = 'sum';
        targets.downsampleAggregator = 'avg';
      };

      $scope.getServices = function() {
        $scope.dashboard.rows[2].panels[0].targets = [];
        var alias = {
          "hadoop.datanode": "Hadoop DataNode",
          "hadoop.namenode": "Hadoop NameNode",
          "hbase.master": "Hbase Master",
          "hbase.regionserver": "Hbase RegionServer",
          "kafka": "Kafka",
          "mysql": "Mysql",
          "spark": "Spark",
          "storm": "Storm",
          "yarn": "Yarn",
          "zookeeper": "Zookeeper",
          "tomcat": "Tomcat",
          "opentsdb": "OpenTSDB",
          "mongo3": "MongoDB 3.x",
          "nginx": "Nginx"
        };

        $scope.serviceList = [];
        _.each(Object.keys(alias), function (key) {
          var queries = [{
            "metric": contextSrv.user.orgId + "." + contextSrv.system + "." + key + ".state",
            "aggregator": "sum",
            "downsample": "10m-sum",
          }];

          $scope.datasource.performTimeSeriesQuery(queries, dateMath.parse('now-10m', false).valueOf(), null).then(function (response) {
            if(_.isEmpty(response.data)){
              throw Error;
            }
            _.each(response.data, function (metricData) {
              if (_.isObject(metricData)) {
                if (metricData.dps[Object.keys(metricData.dps)[0]] > 0) {
                  $scope.panleJson[2].status.warn[1]++;
                } else {
                  $scope.panleJson[2].status.success[1]++;
                }
              }

              var targets = _.cloneDeep(panelMeta.panels[0].targets[0]);
              targets.metric = key+'.state';
              targets.aggregator = queries[0].aggregator;
              targets.downsample = queries[0].downsample;
              targets.downsampleAggregator = 'sum';
              $scope.dashboard.rows[2].panels[0].targets.push(targets);
            });
          }).catch(function () {
            //nothing to do;
            //$scope.serviceList.push({"host": "尚未配置在任何主机上", "alias": alias[key], "state": "尚未工作"});
          });
        });
      };

      $scope.initHostSummary = function(targets) {
        targets.metric = 'collector.state';
        targets.alias = "$tag_host";
        targets.tags = {'host': '*'};
        targets.aggregator = "sum";
        targets.downsample = "1m-sum";
        targets.downsampleAggregator = 'sum';
      }

      $scope.getHostSummary = function() {
        $scope.summaryList = [];
        backendSrv.alertD({
          method: "get",
          url: "/summary",
          params: {metrics: "collector.summary"},
          headers: {'Content-Type': 'text/plain'},
        }).then(function (response) {
          $scope.summaryList = response.data;
        }).then(function () {
          _.each($scope.summaryList, function (metric) {
            var queries = [{
              "metric": contextSrv.user.orgId + "." + contextSrv.system + ".collector.state",
              "aggregator": "sum",
              "downsample": "1m-sum",
              "tags": {"host": metric.tag.host}
            }];

            $scope.datasource.performTimeSeriesQuery(queries, dateMath.parse('now-1m', false).valueOf(), null).then(function (response) {
              if (_.isEmpty(response.data)) {
                throw Error;
              }
              _.each(response.data, function (metricData) {
                if (_.isObject(metricData)) {
                  if (metricData.dps[Object.keys(metricData.dps)[0]] > 0) {
                    $scope.panleJson[3].status.warn[1]++;
                  } else {
                    $scope.panleJson[3].status.success[1]++;
                  }
                }
              });
            }).catch(function () {
              $scope.panleJson[3].status.danger[1]++;
            });

          });
        })
      };

      $scope.initHealth = function(panel) {
        panel.targets[0].metric = 'internal.system.health';
        panel.targets[0].aggregator = 'sum';
        panel.targets[0].downsampleInterval = '5m';
      }

      $scope.getHealth = function() {
        healthSrv.load().then(function (data) {
          $scope.applicationHealth = Math.floor(data.health);
          $scope.leveal = getLeveal($scope.applicationHealth);
          $scope.summary = data;
          if(data.metricHostClusters.length && data.metricHostNotClustered.elements.length) {
            $scope.panleJson[1].status.success[1] = data.numMetrics;
            $scope.panleJson[1].status.warn[1] = data.numAnomalyMetrics;
          } else {
            $scope.panleJson[1].status.success[0] = '';
            $scope.panleJson[1].status.success[1] = '系统正常';
          }
        });
        function getLeveal(score) {
          if (!_.isNumber(score) && _.isNaN(score) && _.isEmpty(score)) {
            return "无";
          }
          if (score > 75) {
            return "优";
          } else if (score > 50) {
            return "良";
          } else if (score > 25) {
            return "中";
          } else {
            return "差";
          }
        };
      };

      $scope.getPrediction = function(panels) {
        var prediction = [['df.bytes.free','df.bytes.free.prediction'],['cpu.usr','cpu.usr.prediction'],['proc.meminfo.active','proc.meminfo.active.prediction']];
        _.each(panels, function(panel, index) {
          panel.targets = [];
          for(var i in prediction[index]){
            var targets = _.cloneDeep(panelMeta.panels[0].targets[0]);
            targets.metric = prediction[index][i];
            targets.aggregator = 'avg';
            targets.downsampleInterval = '30m';
            targets.downsampleAggregator = 'avg';
            panel.targets.push(targets);
          };
          panel.seriesOverrides =  [{"alias": prediction[index][1], "color": "#DEDAF7", "zindex": -2}];
          panel.y_formats = ['bytes', 'bytes'];
          panel.timeForward = "1d";
          panel.legend.show = false;
          panel.hideTimeOverride = true;
        });
        panels[1].y_formats = ['percent', 'percent'];

        _.each(prediction, function (item, index) {
          var queries = [{
            "metric": contextSrv.user.orgId + "." + contextSrv.system + "." + item[1],
            "downsample": "1d-avg",
            "aggregator": "avg",
          }];

          $scope.datasource.performTimeSeriesQuery(queries, dateMath.parse('now', false).valueOf(), dateMath.parse('now+1d', false).valueOf()).then(function (response) {
            for(var i in response.data[0].dps){
              var data = response.data[0].dps[i];
            }
            if(item[1] === 'cpu.usr.prediction') {
              data = data.toFixed(2)+'%';
            } else {
              data = (data/Math.pow(1024,3)).toFixed(2) + 'GB';
            }
            $scope.panleJson[6].panels[index].tip += data;
          }).catch(function () {});
        });

      };

      $scope.initTopN = function() {
        panelRow[4] = {
          "collapse": false,
          "editable": true,
          "height": "260px",
          "panels": [
            {
              "columns": [
                {
                  "text": "Max",
                  "value": "max"
                }
              ],
              "editable": true,
              "error": false,
              "fontSize": "100%",
              "helpInfo": {
                "context": "",
                "info": false,
                "title": ""
              },
              "id": 6,
              "isNew": true,
              "links": [],
              "pageSize": null,
              "scroll": true,
              "showHeader": true,
              "sort": {
                "col": 1,
                "desc": true
              },
              "span": 6,
              "styles": [
                {
                  "dateFormat": "YYYY-MM-DD HH:mm:ss",
                  "pattern": "Time",
                  "type": "date"
                },
                {
                  "colorMode": "cell",
                  "colors": [
                    "rgba(245, 54, 54, 0.39)",
                    "rgba(237, 129, 40, 0.52)",
                    "rgba(50, 172, 45, 0.54)"
                  ],
                  "decimals": 2,
                  "pattern": "Max",
                  "thresholds": [
                    "70",
                    "30",
                    "0"
                  ],
                  "type": "number",
                  "unit": "short"
                }
              ],
              "targets": [
                {
                  "aggregator": "sum",
                  "currentTagKey": "",
                  "currentTagValue": "",
                  "downsampleAggregator": "avg",
                  "downsampleInterval": "",
                  "errors": {},
                  "metric": "cpu.topN",
                  "refId": "A",
                  "tags": {
                    "host": "*",
                    "pid_cmd": "*"
                  }
                }
              ],
              "title": "各线程CPU占用情况(百分比)TopN",
              "transform": "timeseries_aggregations",
              "type": "table",
              "height": "260",
            },
            {
              "columns": [
                {
                  "text": "Max",
                  "value": "max"
                }
              ],
              "editable": true,
              "error": false,
              "fontSize": "100%",
              "helpInfo": {
                "context": "",
                "info": false,
                "title": ""
              },
              "id": 7,
              "isNew": true,
              "links": [],
              "pageSize": null,
              "scroll": true,
              "showHeader": true,
              "sort": {
                "col": 1,
                "desc": true
              },
              "span": 6,
              "styles": [
                {
                  "dateFormat": "YYYY-MM-DD HH:mm:ss",
                  "pattern": "Time",
                  "type": "date"
                },
                {
                  "colorMode": "cell",
                  "colors": [
                    "rgba(40, 166, 57, 0.52)",
                    "rgba(237, 129, 40, 0.52)",
                    "rgba(233, 34, 34, 0.69)"
                  ],
                  "decimals": 2,
                  "pattern": "Max",
                  "thresholds": [
                    "1",
                    "20",
                    "50"
                  ],
                  "type": "number",
                  "unit": "percent"
                }
              ],
              "targets": [
                {
                  "aggregator": "sum",
                  "currentTagKey": "",
                  "currentTagValue": "",
                  "downsampleAggregator": "avg",
                  "downsampleInterval": "",
                  "errors": {},
                  "metric": "mem.topN",
                  "refId": "A",
                  "tags": {
                    "host": "*",
                    "pid_cmd": "*"
                  }
                }
              ],
              "title": "各线程内存占用情况(百分比)TOPN",
              "transform": "timeseries_aggregations",
              "type": "table",
              "height": "260",
            }
          ],
          "title": "New row"
        }
      };

      $scope.init();
    });
  });
