define([
  'angular',
  'jquery',
  'lodash',
  'require',
  'config',
  'bootstrap',
  'angular-route',
  'angular-sanitize',
  'angular-strap',
  'angular-dragdrop',
  'angular-ui',
  'extend-jquery',
  'bindonce',
  'app/core/core',
],
function (angular, $, _, appLevelRequire) {
  "use strict";

  var app = angular.module('grafana', []);
  var register_fns = {};
  var preBootModules = [];

  // This stores the grafana version number
  app.constant('grafanaVersion',"@grafanaVersion@");

  /**
   * Tells the application to watch the module, once bootstraping has completed
   * the modules controller, service, etc. functions will be overwritten to register directly
   * with this application.
   * @param  {[type]} module [description]
   * @return {[type]}        [description]
   */
  app.useModule = function (module) {
    if (preBootModules) {
      preBootModules.push(module);
    } else {
      _.extend(module, register_fns);
    }
    return module;
  };

  app.config(function($locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
    register_fns.controller = $controllerProvider.register;
    register_fns.directive  = $compileProvider.directive;
    register_fns.factory    = $provide.factory;
    register_fns.service    = $provide.service;
    register_fns.filter     = $filterProvider.register;
  });

  var apps_deps = [
    'grafana.core',
    'ngRoute',
    'ngSanitize',
    '$strap.directives',
    'ang-drag-drop',
    'grafana',
    'pasvaz.bindonce',
    'ui.bootstrap',
    'ui.bootstrap.tpls',
  ];

  var module_types = ['controllers', 'directives', 'factories', 'services', 'filters', 'routes'];

  _.each(module_types, function (type) {
    var module_name = 'grafana.'+type;
    // create the module
    app.useModule(angular.module(module_name, []));
    // push it into the apps dependencies
    apps_deps.push(module_name);
  });

  var preBootRequires = [
<<<<<<< 07d3105067bfce4cc18a59f70da160bb1d3907e6
<<<<<<< 48cb73f5f674dc00ac540a966fd8c20991da8c92
=======
>>>>>>> feat() started work on more feature rich time picker
    'app/services/all',
    'app/features/all',
    'app/controllers/all',
    'app/components/partials',
<<<<<<< 07d3105067bfce4cc18a59f70da160bb1d3907e6
=======
    'services/all',
    'features/all',
    'controllers/all',
    'components/partials',
<<<<<<< d63b2540f5db1d3c15c625f00bbb075a168bc933
    'routes/all',
>>>>>>> refactor: improving structure, moving things into a core module
=======
>>>>>>> refactor: moving routes into core, improved bundle loader
=======
>>>>>>> feat() started work on more feature rich time picker
  ];

  app.boot = function() {
    require(preBootRequires, function () {

      // disable tool tip animation
      $.fn.tooltip.defaults.animation = false;

      // bootstrap the app
      angular
        .element(document)
        .ready(function() {
          angular.bootstrap(document, apps_deps)
            .invoke(['$rootScope', function ($rootScope) {
              _.each(preBootModules, function (module) {
                _.extend(module, register_fns);
              });
<<<<<<< 1d80184393eeceb8b85607609946c8057b6ef299

              preBootModules = null;
=======
>>>>>>> tech(typescript): its looking good

              pre_boot_modules = false;
              $rootScope.requireContext = appLevelRequire;
              $rootScope.require = function (deps, fn) {
                var $scope = this;
                $scope.requireContext(deps, function () {
                  var deps = _.toArray(arguments);
                  fn.apply($scope, deps);
                });
              };
            }]);
        });
    });
  };

  return app;
});
