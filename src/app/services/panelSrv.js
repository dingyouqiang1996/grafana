define([
  'angular',
  'lodash',
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.services');
  module.service('panelSrv', function($rootScope, $timeout, datasourceSrv, $location) {

    this.init = function($scope) {
      if (!$scope.panel.span) { $scope.panel.span = 12; }

      var menu = [
        {
          text: "view",
          icon: "icon-eye-open",
        },
        {
          text: 'Drill down',
          click: 'drillDown(panel.drillDown)',
          condition: true
        },
        {
          text: "Fullscreen",
          click: 'toggleFullscreen(false)',
          condition: $scope.panelMeta.fullscreenView
        },
        {
          text: 'edit',
          icon: 'icon-cogs',
          click: 'editPanel()',
          condition: true,
        },
        {
          text: 'duplicate',
          icon: 'icon-copy',
          click: 'duplicatePanel(panel)',
          condition: true
        },
        {
          text: 'json',
          icon: 'icon-code',
          click: 'editPanelJson()',
          condition: true
        },
        {
          text: 'share',
          icon: 'icon-share',
          click: 'sharePanel()',
          condition: true
        },
      ];

      $scope.inspector = {};
      $scope.panelMeta.menu = _.where(menu, { condition: true });

      $scope.editPanel = function() {
        if ($scope.panelMeta.fullscreenEdit) {
          $scope.toggleFullscreen(true);
        }
        else {
          $scope.appEvent('show-dash-editor', { src: 'app/partials/paneleditor.html', scope: $scope });
        }
      };

      $scope.sharePanel = function() {
        $scope.appEvent('show-modal', {
          src: './app/partials/share-panel.html',
          scope: $scope.$new()
        });
      };

      $scope.drillDown = function(dashboard) {
        var variables = {};

        if (dashboard == null) { return; }
        _.each($scope.dashboard.templating.list, function(variable) {
          variables['var-' + variable.name] = variable.current.value;
        });

        if ($scope.panel.drillDownVariables != null) {
          _.each($scope.panel.drillDownVariables.split(','), function(token) {
            variables['var-' + token.split('=')[0]] = token.split('=')[1];
          });
        }

        $location.path("/dashboard/db/" + dashboard).search(variables);
      };

      $scope.editPanelJson = function() {
        $scope.appEvent('show-json-editor', { object: $scope.panel, updateHandler: $scope.replacePanel });
      };

      $scope.updateColumnSpan = function(span) {
        $scope.panel.span = Math.min(Math.max($scope.panel.span + span, 1), 12);

        $timeout(function() {
          $scope.$emit('render');
        });
      };

      $scope.addDataQuery = function() {
        $scope.panel.targets.push({target: ''});
      };

      $scope.removeDataQuery = function (query) {
        $scope.panel.targets = _.without($scope.panel.targets, query);
        $scope.get_data();
      };

      $scope.setDatasource = function(datasource) {
        $scope.panel.datasource = datasource;
        $scope.datasource = datasourceSrv.get(datasource);

        if (!$scope.datasource) {
          $scope.panelMeta.error = "Cannot find datasource " + datasource;
          return;
        }
      };

      $scope.changeDatasource = function(datasource) {
        $scope.setDatasource(datasource);
        $scope.get_data();
      };

      $scope.toggleEditorHelp = function(index) {
        if ($scope.editorHelpIndex === index) {
          $scope.editorHelpIndex = null;
          return;
        }
        $scope.editorHelpIndex = index;
      };

      $scope.toggleFullscreen = function(edit) {
        $scope.dashboardViewState.update({ fullscreen: true, edit: edit, panelId: $scope.panel.id });
      };

      $scope.otherPanelInFullscreenMode = function() {
        return $scope.dashboardViewState.fullscreen && !$scope.fullscreen;
      };

      // Post init phase
      $scope.fullscreen = false;
      $scope.editor = { index: 1 };
      if ($scope.panelMeta.fullEditorTabs) {
        $scope.editorTabs = _.pluck($scope.panelMeta.fullEditorTabs, 'title');
      }

      $scope.datasources = datasourceSrv.getMetricSources();
      $scope.setDatasource($scope.panel.datasource);
      $scope.dashboardViewState.registerPanel($scope);

      if ($scope.get_data) {
        var panel_get_data = $scope.get_data;
        $scope.get_data = function() {
          if ($scope.otherPanelInFullscreenMode()) { return; }

          delete $scope.panelMeta.error;
          $scope.panelMeta.loading = true;

          panel_get_data();
        };

        if (!$scope.skipDataOnInit) {
          $scope.get_data();
        }
      }
    };
  });

});
