define([
  'angular',
  '../core/core',
  './dashLoadControllers',
], function(angular, core) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'LoadDashboardCtrl',
        reloadOnSearch: false,
      })
      .when('/dashboard/:type/:slug', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'LoadDashboardCtrl',
        reloadOnSearch: false,
      })
      .when('/dashboard-solo/:type/:slug', {
        templateUrl: 'app/features/panel/partials/soloPanel.html',
        controller : 'SoloPanelCtrl',
      })
      .when('/dashboard-import/:file', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromImportCtrl',
        reloadOnSearch: false,
      })
      .when('/dashboard/new', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'NewDashboardCtrl',
        reloadOnSearch: false,
      })
      .when('/import/dashboard', {
        templateUrl: 'app/features/dashboard/partials/import.html',
        controller : 'DashboardImportCtrl',
      })
      .when('/datasources', {
        templateUrl: 'app/features/org/partials/datasources.html',
        controller : 'DataSourcesCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/datasources/edit/:id', {
        templateUrl: 'app/features/org/partials/datasourceEdit.html',
        controller : 'DataSourceEditCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/datasources/new', {
        templateUrl: 'app/features/org/partials/datasourceEdit.html',
        controller : 'DataSourceEditCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/org', {
        templateUrl: 'app/features/org/partials/orgDetails.html',
        controller : 'OrgDetailsCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/org/new', {
        templateUrl: 'app/features/org/partials/newOrg.html',
        controller : 'NewOrgCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/org/users', {
        templateUrl: 'app/features/org/partials/orgUsers.html',
        controller : 'OrgUsersCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/org/apikeys', {
        templateUrl: 'app/features/org/partials/orgApiKeys.html',
        controller : 'OrgApiKeysCtrl',
        resolve: new core.ModuleLoader("features/org/all"),
      })
      .when('/profile', {
        templateUrl: 'app/features/profile/partials/profile.html',
        controller : 'ProfileCtrl',
      })
      .when('/profile/password', {
        templateUrl: 'app/features/profile/partials/password.html',
        controller : 'ChangePasswordCtrl',
      })
      .when('/profile/select-org', {
        templateUrl: 'app/features/profile/partials/select_org.html',
        controller : 'SelectOrgCtrl',
      })
      .when('/admin/settings', {
        templateUrl: 'app/features/admin/partials/settings.html',
        controller : 'AdminSettingsCtrl',
      })
      .when('/admin/users', {
        templateUrl: 'app/features/admin/partials/users.html',
        controller : 'AdminListUsersCtrl',
      })
      .when('/admin/users/create', {
        templateUrl: 'app/features/admin/partials/new_user.html',
        controller : 'AdminEditUserCtrl',
      })
      .when('/admin/users/edit/:id', {
        templateUrl: 'app/features/admin/partials/edit_user.html',
        controller : 'AdminEditUserCtrl',
      })
      .when('/admin/orgs', {
        templateUrl: 'app/features/admin/partials/orgs.html',
        controller : 'AdminListOrgsCtrl',
      })
      .when('/admin/orgs/edit/:id', {
        templateUrl: 'app/features/admin/partials/edit_org.html',
        controller : 'AdminEditOrgCtrl',
      })
      .when('/login', {
        templateUrl: 'app/partials/login.html',
        controller : 'LoginCtrl',
      })
      .when('/invite/:code', {
        templateUrl: 'app/partials/signup_invited.html',
        controller : 'InvitedCtrl',
      })
      .when('/signup', {
        templateUrl: 'app/partials/signup_step2.html',
        controller : 'SignUpCtrl',
      })
      .when('/user/password/send-reset-email', {
        templateUrl: 'app/partials/reset_password.html',
        controller : 'ResetPasswordCtrl',
      })
      .when('/user/password/reset', {
        templateUrl: 'app/partials/reset_password.html',
        controller : 'ResetPasswordCtrl',
      })
      .otherwise({
        templateUrl: 'app/partials/error.html',
        controller: 'ErrorCtrl'
      });
  });

});
