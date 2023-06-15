// To change feature flags, edit:
//  pkg/services/featuremgmt/registry.go
// Then run tests in:
//  pkg/services/featuremgmt/toggles_gen_test.go
// twice to generate and validate the feature flag files

package featuremgmt

var (
	// Register each toggle here
	standardFeatureFlags = []FeatureFlag{
		{
			Name:        "trimDefaults",
			Description: "Use cue schema to remove values that will be applied automatically",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaAsCodeSquad,
		},
		{
			Name:        "disableEnvelopeEncryption",
			Description: "Disable envelope encryption (emergency only)",
			Stage:       FeatureStageGeneralAvailability,
			Owner:       grafanaAsCodeSquad,
		},
		{
			Name:         "live-service-web-worker",
			Description:  "This will use a webworker thread to processes events rather than the main thread",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaAppPlatformSquad,
		},
		{
			Name:         "queryOverLive",
			Description:  "Use Grafana Live WebSocket to execute backend queries",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaAppPlatformSquad,
		},
		{
			Name:        "panelTitleSearch",
			Description: "Search for dashboards using panel title",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaAppPlatformSquad,
		},
		{
			Name:        "prometheusAzureOverrideAudience",
			Description: "Experimental. Allow override default AAD audience for Azure Prometheus endpoint",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaObservabilityMetricsSquad,
		},
		{
			Name:        "publicDashboards",
			Description: "Enables public access to dashboards",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaDashboardsSquad,
		},
		{
			Name:            "publicDashboardsEmailSharing",
			Description:     "Enables public dashboard sharing to be restricted to only allowed emails",
			Stage:           FeatureStagePublicPreview,
			RequiresLicense: true,
			Owner:           grafanaDashboardsSquad,
			HideFromDocs:    true,
		},
		{
			Name:        "lokiLive",
			Description: "Support WebSocket streaming for loki (early prototype)",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaObservabilityLogsSquad,
		},
		{
			Name:        "featureHighlights",
			Description: "Highlight Grafana Enterprise features",
			Stage:       FeatureStageGeneralAvailability,
			Owner:       grafanaAsCodeSquad,
		},
		{
			Name:        "migrationLocking",
			Description: "Lock database during migrations",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaBackendPlatformSquad,
		},
		{
			Name:        "storage",
			Description: "Configurable storage for dashboards, datasources, and resources",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAppPlatformSquad,
		},
		{
			Name:         "exploreMixedDatasource",
			Description:  "Enable mixed datasource in Explore",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Expression:   "true", // turned on by default
			Owner:        grafanaExploreSquad,
		},
		{
			Name:         "newTraceViewHeader",
			Description:  "Shows the new trace view header",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityTracesAndProfilingSquad,
		},
		{
			Name:        "correlations",
			Description: "Correlations page",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaExploreSquad,
		},
		{
			Name:        "datasourceQueryMultiStatus",
			Description: "Introduce HTTP 207 Multi Status for api/ds/query",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaPluginsPlatformSquad,
		},
		{
			Name:         "traceToMetrics",
			Description:  "Enable trace to metrics links",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityTracesAndProfilingSquad,
		},
		{
			Name:        "newDBLibrary",
			Description: "Use jmoiron/sqlx rather than xorm for a few backend services",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaBackendPlatformSquad,
		},
		{
			Name:            "validateDashboardsOnSave",
			Description:     "Validate dashboard JSON POSTed to api/dashboards/db",
			Stage:           FeatureStagePublicPreview,
			RequiresRestart: true,
			Owner:           grafanaAsCodeSquad,
		},
		{
			Name:         "autoMigrateOldPanels",
			Description:  "Migrate old angular panels to supported versions (graph, table-old, worldmap, etc)",
			Stage:        FeatureStagePublicPreview,
			FrontendOnly: true,
			Owner:        grafanaDatavizSquad,
		},
		{
			Name:         "disableAngular",
			Description:  "Dynamic flag to disable angular at runtime. The preferred method is to set `angular_support_enabled` to `false` in the [security] settings, which allows you to change the state at runtime.",
			Stage:        FeatureStagePublicPreview,
			FrontendOnly: true,
			Owner:        grafanaDatavizSquad,
		},
		{
			Name:        "prometheusWideSeries",
			Description: "Enable wide series responses in the Prometheus datasource",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaObservabilityMetricsSquad,
		},
		{
			Name:         "canvasPanelNesting",
			Description:  "Allow elements nesting",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaDatavizSquad,
		},
		{
			Name:         "scenes",
			Description:  "Experimental framework to build interactive dashboards",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaDashboardsSquad,
		},
		{
			Name:            "disableSecretsCompatibility",
			Description:     "Disable duplicated secret storage in legacy tables",
			Stage:           FeatureStageExperimental,
			RequiresRestart: true,
			Owner:           hostedGrafanaTeam,
		},
		{
			Name:        "logRequestsInstrumentedAsUnknown",
			Description: "Logs the path for requests that are instrumented as unknown",
			Stage:       FeatureStageExperimental,
			Owner:       hostedGrafanaTeam,
		},
		{
			Name:        "dataConnectionsConsole",
			Description: "Enables a new top-level page called Connections. This page is an experiment that provides a better experience when you install and configure data sources and other plugins.",
			Stage:       FeatureStageGeneralAvailability,
			Expression:  "true", // turned on by default
			Owner:       grafanaPluginsPlatformSquad,
		},
		{
			Name:        "topnav",
			Description: "Enables new top navigation and page layouts",
			Stage:       FeatureStageGeneralAvailability,
			Expression:  "true", // enabled by default
			Owner:       grafanaFrontendPlatformSquad,
		},
		{
			Name:        "grpcServer",
			Description: "Run the GRPC server",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaAppPlatformSquad,
		},
		{
			Name:            "entityStore",
			Description:     "SQL-based entity store (requires storage flag also)",
			Stage:           FeatureStageExperimental,
			RequiresDevMode: true,
			Owner:           grafanaAppPlatformSquad,
		},
		{
			Name:        "cloudWatchCrossAccountQuerying",
			Description: "Enables cross-account querying in CloudWatch datasources",
			Stage:       FeatureStageGeneralAvailability,
			Expression:  "true", // enabled by default
			Owner:       awsPluginsSquad,
		},
		{
			Name:         "redshiftAsyncQueryDataSupport",
			Description:  "Enable async query data support for Redshift",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        awsPluginsSquad,
		},
		{
			Name:         "athenaAsyncQueryDataSupport",
			Description:  "Enable async query data support for Athena",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        awsPluginsSquad,
		},
		{
			Name:         "newPanelChromeUI",
			Description:  "Show updated look and feel of grafana-ui PanelChrome: panel header, icons, and menu",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Expression:   "true", // enabled by default
			Owner:        grafanaDashboardsSquad,
		},
		{
			Name:        "showDashboardValidationWarnings",
			Description: "Show warnings when dashboards do not validate against the schema",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaDashboardsSquad,
		},
		{
			Name:        "mysqlAnsiQuotes",
			Description: "Use double quotes to escape keyword in a MySQL query",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaBackendPlatformSquad,
		},
		{
			Name:        "accessControlOnCall",
			Description: "Access control primitives for OnCall",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaAuthnzSquad,
		},
		{
			Name:        "nestedFolders",
			Description: "Enable folder nesting",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaBackendPlatformSquad,
		},
		{
			Name:        "accessTokenExpirationCheck",
			Description: "Enable OAuth access_token expiration check and token refresh using the refresh_token",
			Stage:       FeatureStageGeneralAvailability,
			Owner:       grafanaAuthnzSquad,
		},
		{
			Name:        "showTraceId",
			Description: "Show trace ids for requests",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaObservabilityLogsSquad,
		},
		{
			Name:         "emptyDashboardPage",
			Description:  "Enable the redesigned user interface of a dashboard page that includes no panels",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Expression:   "true", // enabled by default
			Owner:        grafanaDashboardsSquad,
		},
		{
			Name:        "disablePrometheusExemplarSampling",
			Description: "Disable Prometheus exemplar sampling",
			Stage:       FeatureStageGeneralAvailability,
			Owner:       grafanaObservabilityMetricsSquad,
		},
		{
			Name:        "alertingBacktesting",
			Description: "Rule backtesting API for alerting",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAlertingSquad,
		},
		{
			Name:         "editPanelCSVDragAndDrop",
			Description:  "Enables drag and drop for CSV and Excel files",
			FrontendOnly: true,
			Stage:        FeatureStageExperimental,
			Owner:        grafanaBiSquad,
		},
		{
			Name:            "alertingNoNormalState",
			Description:     "Stop maintaining state of alerts that are not firing",
			Stage:           FeatureStagePublicPreview,
			RequiresRestart: false,
			Owner:           grafanaAlertingSquad,
		},
		{

			Name:         "logsSampleInExplore",
			Description:  "Enables access to the logs sample feature in Explore",
			Stage:        FeatureStageGeneralAvailability,
			Expression:   "true", // turned on by default
			FrontendOnly: true,
			Owner:        grafanaObservabilityLogsSquad,
		},
		{
			Name:         "logsContextDatasourceUi",
			Description:  "Allow datasource to provide custom UI for context view",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Owner:        grafanaObservabilityLogsSquad,
			Expression:   "true", // turned on by default
		},
		{
			Name:         "lokiQuerySplitting",
			Description:  "Split large interval queries into subqueries with smaller time intervals",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityLogsSquad,
		},
		{
			Name:         "lokiQuerySplittingConfig",
			Description:  "Give users the option to configure split durations for Loki queries",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityLogsSquad,
		},
		{
			Name:        "individualCookiePreferences",
			Description: "Support overriding cookie preferences per user",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaBackendPlatformSquad,
		},
		{
			Name:        "onlyExternalOrgRoleSync",
			Description: "Prohibits a user from changing organization roles synced with external auth providers",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAuthnzSquad,
		},
		{
			Name:         "traceqlSearch",
			Description:  "Enables the 'TraceQL Search' tab for the Tempo datasource which provides a UI to generate TraceQL queries",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityTracesAndProfilingSquad,
		},
		{
			Name:         "prometheusMetricEncyclopedia",
			Description:  "Replaces the Prometheus query builder metric select option with a paginated and filterable component",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityMetricsSquad,
		},
		{
			Name:         "timeSeriesTable",
			Description:  "Enable time series table transformer & sparkline cell type",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        appO11ySquad,
		},
		{
			Name:         "prometheusResourceBrowserCache",
			Description:  "Displays browser caching options in Prometheus data source configuration",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityMetricsSquad,
		},
		{
			Name:         "influxdbBackendMigration",
			Description:  "Query InfluxDB InfluxQL without the proxy",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaObservabilityMetricsSquad,
		},
		{
			Name:        "clientTokenRotation",
			Description: "Replaces the current in-request token rotation so that the client initiates the rotation",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAuthnzSquad,
		},
		{
			Name:        "prometheusDataplane",
			Description: "Changes responses to from Prometheus to be compliant with the dataplane specification. In particular it sets the numeric Field.Name from 'Value' to the value of the `__name__` label when present.",
			Expression:  "true",
			Stage:       FeatureStageGeneralAvailability,
			Owner:       grafanaObservabilityMetricsSquad,
		},
		{
			Name:        "lokiMetricDataplane",
			Description: "Changes metric responses from Loki to be compliant with the dataplane specification.",
			Stage:       FeatureStageGeneralAvailability,
			Expression:  "true",
			Owner:       grafanaObservabilityLogsSquad,
		},
		{
			Name:         "dataplaneFrontendFallback",
			Description:  "Support dataplane contract field name change for transformations and field name matchers where the name is different",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Expression:   "true",
			Owner:        grafanaObservabilityMetricsSquad,
		},
		{
			Name:        "disableSSEDataplane",
			Description: "Disables dataplane specific processing in server side expressions.",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaObservabilityMetricsSquad,
		},
		{
			Name:        "alertStateHistoryLokiSecondary",
			Description: "Enable Grafana to write alert state history to an external Loki instance in addition to Grafana annotations.",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAlertingSquad,
		},
		{
			Name:         "alertingNotificationsPoliciesMatchingInstances",
			Description:  "Enables the preview of matching instances for notification policies",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Expression:   "true", // enabled by default
			Owner:        grafanaAlertingSquad,
		},
		{
			Name:        "alertStateHistoryLokiPrimary",
			Description: "Enable a remote Loki instance as the primary source for state history reads.",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAlertingSquad,
		},
		{
			Name:        "alertStateHistoryLokiOnly",
			Description: "Disable Grafana alerts from emitting annotations when a remote Loki instance is available.",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaAlertingSquad,
		},
		{
			Name:        "unifiedRequestLog",
			Description: "Writes error logs to the request logger",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaBackendPlatformSquad,
		},
		{
			Name:        "renderAuthJWT",
			Description: "Uses JWT-based auth for rendering instead of relying on remote cache",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaAsCodeSquad,
		},
		{
			Name:        "pyroscopeFlameGraph",
			Description: "Changes flame graph to pyroscope one",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaObservabilityTracesAndProfilingSquad,
		},
		{
			Name:            "externalServiceAuth",
			Description:     "Starts an OAuth2 authentication provider for external services",
			Stage:           FeatureStageExperimental,
			RequiresDevMode: true,
			Owner:           grafanaAuthnzSquad,
		},
		{
			Name:        "refactorVariablesTimeRange",
			Description: "Refactor time range variables flow to reduce number of API calls made when query variables are chained",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaDashboardsSquad,
		},
		{
			Name:            "useCachingService",
			Description:     "When turned on, the new query and resource caching implementation using a wire service inject will be used in place of the previous middleware implementation",
			Stage:           FeatureStageGeneralAvailability,
			Owner:           grafanaOperatorExperienceSquad,
			RequiresRestart: true,
		},
		{
			Name:        "enableElasticsearchBackendQuerying",
			Description: "Enable the processing of queries and responses in the Elasticsearch data source through backend",
			Stage:       FeatureStagePublicPreview,
			Owner:       grafanaObservabilityLogsSquad,
		},
		{
			Name:         "advancedDataSourcePicker",
			Description:  "Enable a new data source picker with contextual information, recently used order and advanced mode",
			Stage:        FeatureStageGeneralAvailability,
			FrontendOnly: true,
			Expression:   "true", // enabled by default
			Owner:        grafanaDashboardsSquad,
		},
		{
			Name:         "faroDatasourceSelector",
			Description:  "Enable the data source selector within the Frontend Apps section of the Frontend Observability",
			Stage:        FeatureStagePublicPreview,
			FrontendOnly: true,
			Owner:        appO11ySquad,
		},
		{
			Name:         "enableDatagridEditing",
			Description:  "Enables the edit functionality in the datagrid panel",
			FrontendOnly: true,
			Stage:        FeatureStagePublicPreview,
			Owner:        grafanaBiSquad,
		},
		{
			Name:         "dataSourcePageHeader",
			Description:  "Apply new pageHeader UI in data source edit page",
			FrontendOnly: true,
			Stage:        FeatureStagePublicPreview,
			Owner:        enterpriseDatasourcesSquad,
		},
		{
			Name:         "extraThemes",
			Description:  "Enables extra themes",
			FrontendOnly: true,
			Stage:        FeatureStageExperimental,
			Owner:        grafanaFrontendPlatformSquad,
		},
		{
			Name:         "lokiPredefinedOperations",
			Description:  "Adds predefined query operations to Loki query editor",
			FrontendOnly: true,
			Stage:        FeatureStageExperimental,
			Owner:        grafanaObservabilityLogsSquad,
		},
		{
			Name:         "pluginsFrontendSandbox",
			Description:  "Enables the plugins frontend sandbox",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        grafanaPluginsPlatformSquad,
		},
		{
			Name:         "sqlDatasourceDatabaseSelection",
			Description:  "Enables previous SQL data source dataset dropdown behavior",
			FrontendOnly: true,
			Stage:        FeatureStagePublicPreview,
			Owner:        grafanaBiSquad,
		},
		{
			Name:         "cloudWatchLogsMonacoEditor",
			Description:  "Enables the Monaco editor for CloudWatch Logs queries",
			Stage:        FeatureStageExperimental,
			FrontendOnly: true,
			Owner:        awsPluginsSquad,
		},
		{
			Name:        "recordedQueriesMulti",
			Description: "Enables writing multiple items from a single query within Recorded Queries",
			Stage:       FeatureStageExperimental,
			Owner:       grafanaObservabilityMetricsSquad,
		},
	}
)
