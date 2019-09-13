import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';
import kbn from 'app/core/utils/kbn';

import { TemplateSrv } from 'app/features/templating/template_srv';
import { auto } from 'angular';
import { DataFrame } from '@grafana/data';

import { Resource } from './types';
import { migrateTargetSchema } from './migrations';
import TimegrainConverter from './time_grain_converter';
import './editor/editor_component';
import './multi-select.directive';

export interface ResultFormat {
  text: string;
  value: string;
}

interface AzureMonitor {
  resourceGroup: string;
  resourceName: string;
  metricDefinition: string;
  metricNamespace: string;
  metricName: string;
  dimensionFilter: string;
  timeGrain: string;
  timeGrainUnit: string;
  timeGrains: Array<{ text: string; value: string }>;
  allowedTimeGrainsMs: number[];
  dimensions: any[];
  dimension: any;
  aggregation: string;
  aggOptions: string[];
  location: string;
  queryMode: string;
}

export class AzureMonitorQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  static defaultQueryMode = 'singleResource';

  defaultDropdownValue = 'select';

  target: {
    refId: string;
    queryType: string;
    subscription: string;
    subscriptions: string[];
    azureMonitor: {
      queryMode: string;
      data: { [queryMode: string]: AzureMonitor };
    };
    azureLogAnalytics: {
      query: string;
      resultFormat: string;
      workspace: string;
    };
    appInsights: {
      metricName: string;
      rawQuery: boolean;
      rawQueryString: string;
      groupBy: string;
      timeGrainType: string;
      xaxis: string;
      yaxis: string;
      spliton: string;
      aggOptions: string[];
      aggregation: string;
      groupByOptions: string[];
      timeGrainUnit: string;
      timeGrain: string;
    };
  };

  defaults = {
    queryType: 'Azure Monitor',
    subscriptions: new Array<string>(),
    azureMonitor: {
      queryMode: 'singleResource',
      data: {
        singleResource: {
          resourceGroup: this.defaultDropdownValue,
          metricDefinition: this.defaultDropdownValue,
          metricNamespace: this.defaultDropdownValue,
          metricName: this.defaultDropdownValue,
          dimensionFilter: '*',
          timeGrain: 'auto',
        },
        crossResource: {
          resourceGroup: 'all',
          metricDefinition: this.defaultDropdownValue,
          resourceName: this.defaultDropdownValue,
          metricName: this.defaultDropdownValue,
          dimensionFilter: '*',
          timeGrain: 'auto',
          location: '',
        },
      },
    },
    azureLogAnalytics: {
      query: [
        '//change this example to create your own time series query',
        '<table name>                                                              ' +
          '//the table to query (e.g. Usage, Heartbeat, Perf)',
        '| where $__timeFilter(TimeGenerated)                                      ' +
          '//this is a macro used to show the full chart’s time range, choose the datetime column here',
        '| summarize count() by <group by column>, bin(TimeGenerated, $__interval) ' +
          '//change “group by column” to a column in your table, such as “Computer”. ' +
          'The $__interval macro is used to auto-select the time grain. Can also use 1h, 5m etc.',
        '| order by TimeGenerated asc',
      ].join('\n'),
      resultFormat: 'time_series',
      workspace:
        this.datasource && this.datasource.azureLogAnalyticsDatasource
          ? this.datasource.azureLogAnalyticsDatasource.defaultOrFirstWorkspace
          : '',
    },
    appInsights: {
      metricName: this.defaultDropdownValue,
      rawQuery: false,
      rawQueryString: '',
      groupBy: 'none',
      timeGrainType: 'auto',
      xaxis: 'timestamp',
      yaxis: '',
      spliton: '',
    },
  };

  resultFormats: ResultFormat[];
  workspaces: any[];
  showHelp: boolean;
  showLastQuery: boolean;
  lastQuery: string;
  lastQueryError?: string;
  subscriptions: Array<{ text: string; value: string }>;
  subscriptionValues: string[];
  resources: Resource[];

  /** @ngInject */
  constructor($scope: any, $injector: auto.IInjectorService, private templateSrv: TemplateSrv) {
    super($scope, $injector);

    this.target = migrateTargetSchema(this.target);
    _.defaultsDeep(this.target, this.defaults);

    this.migrateTimeGrains();

    this.migrateToFromTimes();

    this.migrateToDefaultNamespace();

    this.panelCtrl.events.on('data-received', this.onDataReceived.bind(this), $scope);
    this.panelCtrl.events.on('data-error', this.onDataError.bind(this), $scope);
    this.resultFormats = [{ text: 'Time series', value: 'time_series' }, { text: 'Table', value: 'table' }];
    this.resources = Array<Resource>();
    this.subscriptionValues = [];
    this.getSubscriptions();

    if (this.target.queryType === 'Azure Log Analytics') {
      this.getWorkspaces();
    }

    //temp
    this.datasource.getResources(this.target.subscriptions).then((res: Array<Resource>) => {
      this.resources = res;
    });
  }

  onDataReceived(dataList: DataFrame[]) {
    this.lastQueryError = undefined;
    this.lastQuery = '';

    const anySeriesFromQuery: any = _.find(dataList, { refId: this.target.refId });
    if (anySeriesFromQuery && anySeriesFromQuery.meta) {
      this.lastQuery = anySeriesFromQuery.meta.query;
    }
  }

  onDataError(err: any) {
    this.handleQueryCtrlError(err);
  }

  handleQueryCtrlError(err: any) {
    if (err.query && err.query.refId && err.query.refId !== this.target.refId) {
      return;
    }

    if (err.error && err.error.data && err.error.data.error && err.error.data.error.innererror) {
      if (err.error.data.error.innererror.innererror) {
        this.lastQueryError = err.error.data.error.innererror.innererror.message;
      } else {
        this.lastQueryError = err.error.data.error.innererror.message;
      }
    } else if (err.error && err.error.data && err.error.data.error) {
      this.lastQueryError = err.error.data.error.message;
    } else if (err.error && err.error.data) {
      this.lastQueryError = err.error.data.message;
    } else if (err.data && err.data.error) {
      this.lastQueryError = err.data.error.message;
    } else if (err.data && err.data.message) {
      this.lastQueryError = err.data.message;
    } else {
      this.lastQueryError = err;
    }
  }

  migrateTimeGrains() {
    const { queryMode } = this.target.azureMonitor;
    if (this.target.azureMonitor.data[queryMode].timeGrainUnit) {
      if (this.target.azureMonitor.data[queryMode].timeGrain !== 'auto') {
        this.target.azureMonitor.data[queryMode].timeGrain = TimegrainConverter.createISO8601Duration(
          this.target.azureMonitor.data[queryMode].timeGrain,
          this.target.azureMonitor.data[queryMode].timeGrainUnit
        );
      }

      delete this.target.azureMonitor.data[queryMode].timeGrainUnit;
      this.onMetricNameChange();
    }

    if (
      this.target.azureMonitor.data[queryMode].timeGrains &&
      this.target.azureMonitor.data[queryMode].timeGrains.length > 0 &&
      (!this.target.azureMonitor.data[queryMode].allowedTimeGrainsMs ||
        this.target.azureMonitor.data[queryMode].allowedTimeGrainsMs.length === 0)
    ) {
      this.target.azureMonitor.data[queryMode].allowedTimeGrainsMs = this.convertTimeGrainsToMs(
        this.target.azureMonitor.data[queryMode].timeGrains
      );
    }
  }

  migrateToFromTimes() {
    this.target.azureLogAnalytics.query = this.target.azureLogAnalytics.query.replace(/\$__from\s/gi, '$__timeFrom() ');
    this.target.azureLogAnalytics.query = this.target.azureLogAnalytics.query.replace(/\$__to\s/gi, '$__timeTo() ');
  }

  async migrateToDefaultNamespace() {
    const { queryMode } = this.target.azureMonitor;
    if (
      this.target.azureMonitor.data[queryMode].metricNamespace &&
      this.target.azureMonitor.data[queryMode].metricNamespace !== this.defaultDropdownValue &&
      this.target.azureMonitor.data[queryMode].metricDefinition
    ) {
      return;
    }

    this.target.azureMonitor.data[queryMode].metricNamespace = this.target.azureMonitor.data[
      queryMode
    ].metricDefinition;
  }

  replace(variable: string) {
    return this.templateSrv.replace(variable, this.panelCtrl.panel.scopedVars);
  }

  onQueryTypeChange() {
    if (this.target.queryType === 'Azure Log Analytics') {
      return this.getWorkspaces();
    }
  }

  getSubscriptions() {
    if (!this.datasource.azureMonitorDatasource.isConfigured()) {
      return;
    }

    return this.datasource.azureMonitorDatasource.getSubscriptions().then((subs: any) => {
      this.subscriptions = subs;
      this.subscriptionValues = subs.map((s: { value: string }) => s.value);

      if (!this.target.subscriptions.length) {
        this.target.subscriptions = subs.map((s: { value: string }) => s.value);
      }

      if (!this.target.subscription && this.target.queryType === 'Azure Monitor') {
        this.target.subscription = this.datasource.azureMonitorDatasource.subscriptionId;
      } else if (!this.target.subscription && this.target.queryType === 'Azure Log Analytics') {
        this.target.subscription = this.datasource.azureLogAnalyticsDatasource.logAnalyticsSubscriptionId;
      }

      if (!this.target.subscription && this.subscriptions.length > 0) {
        this.target.subscription = this.subscriptions[0].value;
      }

      return this.subscriptions;
    });
  }

  onSubscriptionChange() {
    if (this.target.queryType === 'Azure Log Analytics') {
      return this.getWorkspaces();
    }

    const { queryMode } = this.target.azureMonitor;
    if (this.target.queryType === 'Azure Monitor') {
      this.target.azureMonitor.data[queryMode].resourceGroup = this.defaultDropdownValue;
      this.target.azureMonitor.data[queryMode].metricDefinition = this.defaultDropdownValue;
      this.target.azureMonitor.data[queryMode].resourceName = this.defaultDropdownValue;
      this.target.azureMonitor.data[queryMode].metricName = this.defaultDropdownValue;
      this.target.azureMonitor.data[queryMode].aggregation = '';
      this.target.azureMonitor.data[queryMode].timeGrains = [];
      this.target.azureMonitor.data[queryMode].timeGrain = '';
      this.target.azureMonitor.data[queryMode].dimensions = [];
      this.target.azureMonitor.data[queryMode].dimension = '';
    }
  }

  async onSubscriptionsChange() {
    this.resources = await this.datasource.getResources(this.target.subscriptions);
  }

  /* Azure Monitor Section */
  getResourceGroups(query: any) {
    if (this.target.queryType !== 'Azure Monitor' || !this.datasource.azureMonitorDatasource.isConfigured()) {
      return;
    }

    return this.datasource
      .getResourceGroups(
        this.replace(this.target.subscription || this.datasource.azureMonitorDatasource.subscriptionId)
      )
      .catch(this.handleQueryCtrlError.bind(this));
  }

  async getCrossResourceGroups() {
    if (this.target.queryType !== 'Azure Monitor' || !this.datasource.azureMonitorDatasource.isConfigured()) {
      return [];
    }

    return this.resources
      .filter(({ location }) => location === this.target.azureMonitor.data.crossResource.location)
      .reduce(
        (options: Array<{ text: string; value: string }>, { group }: Resource) =>
          options.some(o => o.value === group) ? options : [...options, { text: group, value: group }],
        [{ text: 'All', value: 'all' }]
      );
  }

  async getCrossResourceMetricDefinitions(query: any) {
    const { location: selectedLocation, resourceGroup } = this.target.azureMonitor.data.crossResource;
    return this.resources
      .filter(({ location, group }) =>
        location === selectedLocation && resourceGroup === 'all' ? true : group === resourceGroup
      )
      .reduce(
        (options: Array<{ text: string; value: string }>, { type }: Resource) =>
          options.some(o => o.value === type) ? options : [...options, { text: type, value: type }],
        []
      );
  }

  async getLocations(query: any) {
    return this.resources.reduce(
      (options: Array<{ text: string; value: string }>, { location }: Resource) =>
        options.some(o => o.value === location) ? options : [...options, { text: location, value: location }],
      []
    );
  }

  getMetricDefinitions(query: any) {
    const { queryMode } = this.target.azureMonitor;
    if (
      this.target.queryType !== 'Azure Monitor' ||
      !this.target.azureMonitor.data[queryMode].resourceGroup ||
      this.target.azureMonitor.data[queryMode].resourceGroup === this.defaultDropdownValue
    ) {
      return;
    }
    return this.datasource
      .getMetricDefinitions(
        this.replace(this.target.subscription || this.datasource.azureMonitorDatasource.subscriptionId),
        this.replace(this.target.azureMonitor.data[queryMode].resourceGroup)
      )
      .catch(this.handleQueryCtrlError.bind(this));
  }

  getResourceNames(query: any) {
    const { queryMode } = this.target.azureMonitor;
    if (
      this.target.queryType !== 'Azure Monitor' ||
      !this.target.azureMonitor.data[queryMode].resourceGroup ||
      this.target.azureMonitor.data[queryMode].resourceGroup === this.defaultDropdownValue ||
      !this.target.azureMonitor.data[queryMode].metricDefinition ||
      this.target.azureMonitor.data[queryMode].metricDefinition === this.defaultDropdownValue
    ) {
      return;
    }

    return this.datasource
      .getResourceNames(
        this.replace(this.target.subscription || this.datasource.azureMonitorDatasource.subscriptionId),
        this.replace(this.target.azureMonitor.data[queryMode].resourceGroup),
        this.replace(this.target.azureMonitor.data[queryMode].metricDefinition)
      )
      .catch(this.handleQueryCtrlError.bind(this));
  }

  getMetricNamespaces() {
    const { queryMode } = this.target.azureMonitor;
    if (
      this.target.queryType !== 'Azure Monitor' ||
      !this.target.azureMonitor.data[queryMode].resourceGroup ||
      this.target.azureMonitor.data[queryMode].resourceGroup === this.defaultDropdownValue ||
      !this.target.azureMonitor.data[queryMode].metricDefinition ||
      this.target.azureMonitor.data[queryMode].metricDefinition === this.defaultDropdownValue ||
      !this.target.azureMonitor.data[queryMode].resourceName ||
      this.target.azureMonitor.data[queryMode].resourceName === this.defaultDropdownValue
    ) {
      return;
    }

    return this.datasource
      .getMetricNamespaces(
        this.replace(this.target.subscription || this.datasource.azureMonitorDatasource.subscriptionId),
        this.replace(this.target.azureMonitor.data[queryMode].resourceGroup),
        this.replace(this.target.azureMonitor.data[queryMode].metricDefinition),
        this.replace(this.target.azureMonitor.data[queryMode].resourceName)
      )
      .catch(this.handleQueryCtrlError.bind(this));
  }

  async getCrossResourceMetricNames() {
    const {
      location: selectedLocation,
      resourceGroup: selectedResourceGroup,
      metricDefinition,
    } = this.target.azureMonitor.data.crossResource;

    const resources = this.resources.filter(({ type, location, name, group }) => {
      const filter = type === metricDefinition && location === selectedLocation;
      return selectedResourceGroup === 'all' ? filter : group === selectedResourceGroup && filter;
    });

    const uniqueResources = _.uniqBy(resources, ({ subscriptionId, name, type, group }: Resource) =>
      [subscriptionId, name, location, group].join()
    );

    const responses = await Promise.all(
      uniqueResources.map(({ subscriptionId, group, type, name }) =>
        this.datasource
          .getMetricNames(subscriptionId, group, type, name)
          .then((metrics: any) => metrics.map((m: any) => ({ ...m, subscriptionIds: [subscriptionId] })))
      )
    );

    return _.uniqBy(responses.reduce((result, resources) => [...result, ...resources], []), ({ value }) => value);
  }

  getMetricNames() {
    const { queryMode } = this.target.azureMonitor;
    if (
      this.target.queryType !== 'Azure Monitor' ||
      !this.target.azureMonitor.data[queryMode].resourceGroup ||
      this.target.azureMonitor.data[queryMode].resourceGroup === this.defaultDropdownValue ||
      !this.target.azureMonitor.data[queryMode].metricDefinition ||
      this.target.azureMonitor.data[queryMode].metricDefinition === this.defaultDropdownValue ||
      !this.target.azureMonitor.data[queryMode].resourceName ||
      this.target.azureMonitor.data[queryMode].resourceName === this.defaultDropdownValue ||
      !this.target.azureMonitor.data[queryMode].metricNamespace ||
      this.target.azureMonitor.data[queryMode].metricNamespace === this.defaultDropdownValue
    ) {
      return;
    }

    return this.datasource
      .getMetricNames(
        this.replace(this.target.subscription || this.datasource.azureMonitorDatasource.subscriptionId),
        this.replace(this.target.azureMonitor.data[queryMode].resourceGroup),
        this.replace(this.target.azureMonitor.data[queryMode].metricDefinition),
        this.replace(this.target.azureMonitor.data[queryMode].resourceName),
        this.replace(this.target.azureMonitor.data[queryMode].metricNamespace)
      )
      .catch(this.handleQueryCtrlError.bind(this));
  }

  onResourceGroupChange() {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].metricDefinition = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].resourceName = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].metricNamespace = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].metricName = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].aggregation = '';
    this.target.azureMonitor.data[queryMode].timeGrains = [];
    this.target.azureMonitor.data[queryMode].timeGrain = '';
    this.target.azureMonitor.data[queryMode].dimensions = [];
    this.target.azureMonitor.data[queryMode].dimension = '';
    this.refresh();
  }

  onCrossResourceGroupChange() {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].metricDefinition = '';
    this.target.azureMonitor.data[queryMode].metricName = '';
    this.refresh();
  }

  onCrossResourceMetricDefinitionChange() {
    this.target.azureMonitor.data.crossResource.metricName = this.defaultDropdownValue;
    this.refresh();
  }

  onLocationChange() {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].metricDefinition = '';
    this.target.azureMonitor.data[queryMode].resourceGroup = '';
    this.target.azureMonitor.data[queryMode].metricName = this.defaultDropdownValue;
  }

  onMetricDefinitionChange() {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].resourceName = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].metricNamespace = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].metricName = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].aggregation = '';
    this.target.azureMonitor.data[queryMode].timeGrains = [];
    this.target.azureMonitor.data[queryMode].timeGrain = '';
    this.target.azureMonitor.data[queryMode].dimensions = [];
    this.target.azureMonitor.data[queryMode].dimension = '';
  }

  onResourceNameChange() {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].metricNamespace = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].metricName = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].aggregation = '';
    this.target.azureMonitor.data[queryMode].timeGrains = [];
    this.target.azureMonitor.data[queryMode].timeGrain = '';
    this.target.azureMonitor.data[queryMode].dimensions = [];
    this.target.azureMonitor.data[queryMode].dimension = '';
    this.refresh();
  }

  onMetricNamespacesChange() {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].metricName = this.defaultDropdownValue;
    this.target.azureMonitor.data[queryMode].dimensions = [];
    this.target.azureMonitor.data[queryMode].dimension = '';
  }

  setMetricMetadata(metadata: any) {
    const { queryMode } = this.target.azureMonitor;
    this.target.azureMonitor.data[queryMode].aggOptions = metadata.supportedAggTypes || [metadata.primaryAggType];
    this.target.azureMonitor.data[queryMode].aggregation = metadata.primaryAggType;
    this.target.azureMonitor.data[queryMode].timeGrains = [{ text: 'auto', value: 'auto' }].concat(
      metadata.supportedTimeGrains
    );
    this.target.azureMonitor.data[queryMode].timeGrain = 'auto';

    this.target.azureMonitor.data[queryMode].allowedTimeGrainsMs = this.convertTimeGrainsToMs(
      metadata.supportedTimeGrains || []
    );

    this.target.azureMonitor.data[queryMode].dimensions = metadata.dimensions;
    if (metadata.dimensions.length > 0) {
      this.target.azureMonitor.data[queryMode].dimension = metadata.dimensions[0].value;
    }
    return this.refresh();
  }

  onCrossResourceMetricNameChange() {
    const { queryMode } = this.target.azureMonitor;
    if (
      !this.target.azureMonitor.data[queryMode].metricName ||
      this.target.azureMonitor.data[queryMode].metricName === this.defaultDropdownValue
    ) {
      return;
    }

    let { resourceGroup, metricDefinition, resourceName, metricName } = this.target.azureMonitor.data[queryMode];

    if (resourceGroup === 'all') {
      const resource = this.resources.find(({ type }) => type === metricDefinition);
      resourceGroup = resource.group;
      resourceName = resource.name;
    } else {
      resourceName = this.resources.find(({ type, group }) => group === resourceGroup && type === metricDefinition)
        .name;
    }

    return this.datasource
      .getMetricMetadata(
        this.replace(this.target.subscription),
        resourceGroup,
        metricDefinition,
        resourceName,
        metricName
      )
      .then(this.setMetricMetadata.bind(this))
      .catch(this.handleQueryCtrlError.bind(this));
  }

  onMetricNameChange() {
    const { queryMode } = this.target.azureMonitor;
    if (
      !this.target.azureMonitor.data[queryMode].metricName ||
      this.target.azureMonitor.data[queryMode].metricName === this.defaultDropdownValue
    ) {
      return;
    }

    return this.datasource
      .getMetricMetadata(
        this.replace(this.target.subscription),
        this.replace(this.target.azureMonitor.data[queryMode].resourceGroup),
        this.replace(this.target.azureMonitor.data[queryMode].metricDefinition),
        this.replace(this.target.azureMonitor.data[queryMode].resourceName),
        this.replace(this.target.azureMonitor.data[queryMode].metricName),
        this.replace(this.target.azureMonitor.data[queryMode].metricNamespace)
      )
      .then(this.setMetricMetadata.bind(this))
      .catch(this.handleQueryCtrlError.bind(this));
  }

  convertTimeGrainsToMs(timeGrains: Array<{ text: string; value: string }>) {
    const allowedTimeGrainsMs: number[] = [];
    timeGrains.forEach((tg: any) => {
      if (tg.value !== 'auto') {
        allowedTimeGrainsMs.push(kbn.interval_to_ms(TimegrainConverter.createKbnUnitFromISO8601Duration(tg.value)));
      }
    });
    return allowedTimeGrainsMs;
  }

  getAutoInterval() {
    const { queryMode } = this.target.azureMonitor;
    if (this.target.azureMonitor.data[queryMode].timeGrain === 'auto') {
      return TimegrainConverter.findClosestTimeGrain(
        this.templateSrv.getBuiltInIntervalValue(),
        _.map(this.target.azureMonitor.data[queryMode].timeGrains, o =>
          TimegrainConverter.createKbnUnitFromISO8601Duration(o.value)
        ) || ['1m', '5m', '15m', '30m', '1h', '6h', '12h', '1d']
      );
    }

    return '';
  }

  /* Azure Log Analytics */

  getWorkspaces = () => {
    return this.datasource.azureLogAnalyticsDatasource
      .getWorkspaces(this.target.subscription)
      .then((list: any[]) => {
        this.workspaces = list;
        if (list.length > 0 && !this.target.azureLogAnalytics.workspace) {
          this.target.azureLogAnalytics.workspace = list[0].value;
        }
      })
      .catch(this.handleQueryCtrlError.bind(this));
  };

  getAzureLogAnalyticsSchema = () => {
    return this.getWorkspaces()
      .then(() => {
        return this.datasource.azureLogAnalyticsDatasource.getSchema(this.target.azureLogAnalytics.workspace);
      })
      .catch(this.handleQueryCtrlError.bind(this));
  };

  onLogAnalyticsQueryChange = (nextQuery: string) => {
    this.target.azureLogAnalytics.query = nextQuery;
  };

  onLogAnalyticsQueryExecute = () => {
    this.panelCtrl.refresh();
  };

  get templateVariables() {
    return this.templateSrv.variables.map(t => '$' + t.name);
  }

  /* Application Insights Section */

  getAppInsightsAutoInterval() {
    const interval = this.templateSrv.getBuiltInIntervalValue();
    if (interval[interval.length - 1] === 's') {
      return '1m';
    }
    return interval;
  }

  getAppInsightsMetricNames() {
    if (!this.datasource.appInsightsDatasource.isConfigured()) {
      return;
    }

    return this.datasource.getAppInsightsMetricNames().catch(this.handleQueryCtrlError.bind(this));
  }

  getAppInsightsColumns() {
    return this.datasource.getAppInsightsColumns(this.target.refId);
  }

  onAppInsightsColumnChange() {
    return this.refresh();
  }

  onAppInsightsMetricNameChange() {
    if (!this.target.appInsights.metricName || this.target.appInsights.metricName === this.defaultDropdownValue) {
      return;
    }

    return this.datasource
      .getAppInsightsMetricMetadata(this.replace(this.target.appInsights.metricName))
      .then((aggData: { supportedAggTypes: string[]; supportedGroupBy: string[]; primaryAggType: string }) => {
        this.target.appInsights.aggOptions = aggData.supportedAggTypes;
        this.target.appInsights.groupByOptions = aggData.supportedGroupBy;
        this.target.appInsights.aggregation = aggData.primaryAggType;
        return this.refresh();
      })
      .catch(this.handleQueryCtrlError.bind(this));
  }

  onAppInsightsQueryChange = (nextQuery: string) => {
    this.target.appInsights.rawQueryString = nextQuery;
  };

  onAppInsightsQueryExecute = () => {
    return this.refresh();
  };

  getAppInsightsQuerySchema = () => {
    return this.datasource.appInsightsDatasource.getQuerySchema().catch(this.handleQueryCtrlError.bind(this));
  };

  getAppInsightsGroupBySegments(query: any) {
    return _.map(this.target.appInsights.groupByOptions, option => {
      return { text: option, value: option };
    });
  }

  resetAppInsightsGroupBy() {
    this.target.appInsights.groupBy = 'none';
    this.refresh();
  }

  updateTimeGrainType() {
    if (this.target.appInsights.timeGrainType === 'specific') {
      this.target.appInsights.timeGrain = '1';
      this.target.appInsights.timeGrainUnit = 'minute';
    } else {
      this.target.appInsights.timeGrain = '';
    }
    this.refresh();
  }

  toggleEditorMode() {
    this.target.appInsights.rawQuery = !this.target.appInsights.rawQuery;
  }
}
