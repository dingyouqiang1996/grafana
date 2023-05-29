package kind

import (
	"strings"
	t "time"
)

name:        "Dashboard"
maturity:    "experimental"
description: "A Grafana dashboard."

crd: dummySchema: true

lineage: schemas: [{
	version: [0, 0]
	schema: {
		spec: {
			// Unique numeric identifier for the dashboard.
			// TODO must isolate or remove identifiers local to a Grafana instance...?
			id?: int64
			// Unique dashboard identifier that can be generated by anyone. string (8-40)
			uid?: string
			// Title of dashboard.
			title?: string
			// Description of dashboard.
			description?: string
			// This property should only be used in dashboards defined by plugins.  It is a quick check
			// to see if the version has changed since the last time.  Unclear why using the version property
			// is insufficient.
			revision?: int64 @grafanamaturity(NeedsExpertReview)
			// ID of a dashboard imported from the https://grafana.com/grafana/dashboards/ portal
			gnetId?: string @grafanamaturity(NeedsExpertReview)
			// Tags associated with dashboard.
			tags?: [...string] @grafanamaturity(NeedsExpertReview)
			// Theme of dashboard.
			style: "light" | *"dark" @grafanamaturity(NeedsExpertReview)
			// Timezone of dashboard. Accepted values are IANA TZDB zone ID or "browser" or "utc".
			timezone?: string | *"browser"
			// Whether a dashboard is editable or not.
			editable: bool | *true
			// Configuration of dashboard cursor sync behavior.
			// Accepted values are 0 (sync turned off), 1 (shared crosshair), 2 (shared crosshair and tooltip).
			graphTooltip: #DashboardCursorSync
			// Time range for dashboard.
			// Accepted values are relative time strings like {from: 'now-6h', to: 'now'} or absolute time strings like {from: '2020-07-10T08:00:00.000Z', to: '2020-07-10T14:00:00.000Z'}.
			time?: {
				from: string | *"now-6h"
				to:   string | *"now"
			} @grafanamaturity(NeedsExpertReview)

			// Configuration of the time picker shown at the top of a dashboard.
			timepicker?: {
				// Whether timepicker is visible or not.
				hidden: bool | *false
				// Interval options available in the refresh picker dropdown.
				refresh_intervals: [...string] | *["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"]
				// Whether timepicker is collapsed or not. Has no effect on provisioned dashboard.
				collapse: bool | *false
				// Whether timepicker is enabled or not. Has no effect on provisioned dashboard.
				enable: bool | *true
				// Selectable options available in the time picker dropdown. Has no effect on provisioned dashboard.
				time_options: [...string] | *["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
			} @grafanamaturity(NeedsExpertReview)
			// The month that the fiscal year starts on.  0 = January, 11 = December
			fiscalYearStartMonth?: uint8 & <12 | *0
			// When set to true, the dashboard will redraw panels at an interval matching the pixel width.
			// This will keep data "moving left" regardless of the query refresh rate.  This setting helps
			// avoid dashboards presenting stale live data
			liveNow?: bool @grafanamaturity(NeedsExpertReview)
			// Day when the week starts. Expressed by the name of the day in lowercase, e.g. "monday".
			weekStart?: string

			// Refresh rate of dashboard. Represented via interval string, e.g. "5s", "1m", "1h", "1d".
			refresh?: string | false
			// Version of the JSON schema, incremented each time a Grafana update brings
			// changes to said schema.
			// TODO this is the existing schema numbering system. It will be replaced by Thema's themaVersion
			schemaVersion: uint16 | *36
			// Version of the dashboard, incremented each time the dashboard is updated.
			version?: uint32 @grafanamaturity(NeedsExpertReview)
			panels?: [...(#Panel | #RowPanel | #GraphPanel | #HeatmapPanel)] @grafanamaturity(NeedsExpertReview)
			// Contains the list of configured template variables with their saved values along with some other metadata
			templating?: {
				list?: [...#VariableModel] @grafanamaturity(NeedsExpertReview)
			}

			// TODO docs
			annotations?: #AnnotationContainer

			// Links with references to other dashboards or external websites.
			links?: [...#DashboardLink] @grafanamaturity(NeedsExpertReview)

			snapshot?: #Snapshot @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafana(TSVeneer="type")

		///////////////////////////////////////
		// Definitions (referenced above) are declared below

		// TODO: this should be a regular DataQuery that depends on the selected dashboard
		// these match the properties of the "grafana" datasouce that is default in most dashboards
		#AnnotationTarget: {
			// Only required/valid for the grafana datasource...
			// but code+tests is already depending on it so hard to change
			limit: int64
			// Only required/valid for the grafana datasource...
			// but code+tests is already depending on it so hard to change
			matchAny: bool
			// Only required/valid for the grafana datasource...
			// but code+tests is already depending on it so hard to change
			tags: [...string]
			// Only required/valid for the grafana datasource...
			// but code+tests is already depending on it so hard to change
			type: string
			... // datasource will stick their raw DataQuery here
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		#AnnotationPanelFilter: {
			// Should the specified panels be included or excluded
			exclude?: bool | *false

			// Panel IDs that should be included or excluded
			ids: [...uint8]
		} @cuetsy(kind="interface")

		// TODO -- should not be a public interface on its own, but required for Veneer
		#AnnotationContainer: {
			// annoying... but required so that the list is defined using the nested Veneer
			@grafana(TSVeneer="type")

			list?: [...#AnnotationQuery] @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface")

		// TODO docs
		// FROM: AnnotationQuery in grafana-data/src/types/annotations.ts
		#AnnotationQuery: {
			@grafana(TSVeneer="type")

			// Name of annotation.
			name: string

			// Datasource where the annotations data is
			datasource: #DataSourceRef

			// When enabled the annotation query is issued with every dashboard refresh
			enable: bool | *true

			// Annotation queries can be toggled on or off at the top of the dashboard.
			// When hide is true, the toggle is not shown in the dashboard.
			hide?: bool | *false

			// Color to use for the annotation event markers
			iconColor: string

			// Filters to apply when fetching annotations
			filter?: #AnnotationPanelFilter

			// TODO.. this should just be a normal query target
			target?: #AnnotationTarget

			// TODO -- this should not exist here, it is based on the --grafana-- datasource
			type?: string @grafanamaturity(NeedsExpertReview)

			// unless datasources have migrated to the target+mapping,
			// they just spread their query into the base object :(
			...
		} @cuetsy(kind="interface")

		#LoadingState: "NotStarted" | "Loading" | "Streaming" | "Done" | "Error" @cuetsy(kind="enum") @grafanamaturity(NeedsExpertReview)

		// FROM: packages/grafana-data/src/types/templateVars.ts
		// TODO docs
		// TODO what about what's in public/app/features/types.ts?
		// TODO there appear to be a lot of different kinds of [template] vars here? if so need a disjunction
		#VariableModel: {
			id:            string | *"00000000-0000-0000-0000-000000000000"
			type:          #VariableType
			name:          string
			label?:        string
			rootStateKey?: string
			global:        bool | *false
			hide:          #VariableHide
			skipUrlSync:   bool | *false
			index:         int32 | *-1
			state:         #LoadingState
			error?: {...}
			description?: string
			// TODO: Move this into a separated QueryVariableModel type
			query?:      string | {...}
			datasource?: #DataSourceRef
			...
		} @cuetsy(kind="interface") @grafana(TSVeneer="type") @grafanamaturity(NeedsExpertReview)
		#VariableHide: 0 | 1 | 2                                                 @cuetsy(kind="enum",memberNames="dontHide|hideLabel|hideVariable") @grafana(TSVeneer="type") @grafanamaturity(NeedsExpertReview)
		#LoadingState: "NotStarted" | "Loading" | "Streaming" | "Done" | "Error" @cuetsy(kind="enum") @grafanamaturity(NeedsExpertReview)

		// Ref to a DataSource instance
		#DataSourceRef: {
			// The plugin type-id
			type?: string @grafanamaturity(NeedsExpertReview)

			// Specific datasource instance
			uid?: string @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafana(TSVeneer="type") @grafanamaturity(NeedsExpertReview)

		// Links with references to other dashboards or external resources
		#DashboardLink: {
			// Title to display with the link
			title: string @grafanamaturity(NeedsExpertReview)
			// Link type. Accepted values are dashboards (to refer to another dashboard) and link (to refer to an external resource)
			type: #DashboardLinkType @grafanamaturity(NeedsExpertReview)
			// Icon name to be displayed with the link
			icon: string @grafanamaturity(NeedsExpertReview)
			// Tooltip to display when the user hovers their mouse over it
			tooltip: string @grafanamaturity(NeedsExpertReview)
			// Link URL. Only required/valid if the type is link
			url: string @grafanamaturity(NeedsExpertReview)
			// List of tags to limit the linked dashboards. If empty, all dashboards will be displayed. Only valid if the type is dashboards
			tags: [...string] @grafanamaturity(NeedsExpertReview)
			// If true, all dashboards links will be displayed in a dropdown. If false, all dashboards links will be displayed side by side. Only valid if the type is dashboards
			asDropdown: bool | *false @grafanamaturity(NeedsExpertReview)
			// If true, the link will be opened in a new tab
			targetBlank: bool | *false @grafanamaturity(NeedsExpertReview)
			// If true, includes current template variables values in the link as query params
			includeVars: bool | *false @grafanamaturity(NeedsExpertReview)
			// If true, includes current time range in the link as query params
			keepTime: bool | *false @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface")

		// Dashboard Link type. Accepted values are dashboards (to refer to another dashboard) and link (to refer to an external resource)
		#DashboardLinkType: "link" | "dashboards" @cuetsy(kind="type") @grafanamaturity(NeedsExpertReview)

		// FROM: packages/grafana-data/src/types/templateVars.ts
		// TODO docs
		// TODO this implies some wider pattern/discriminated union, probably?
		#VariableType: "query" | "adhoc" | "constant" | "datasource" | "interval" | "textbox" | "custom" | "system" @cuetsy(kind="type") @grafanamaturity(NeedsExpertReview)

		// TODO docs
		#FieldColorModeId: "thresholds" | "palette-classic" | "palette-saturated" | "continuous-GrYlRd" | "fixed" @cuetsy(kind="enum",memberNames="Thresholds|PaletteClassic|PaletteSaturated|ContinuousGrYlRd|Fixed") @grafanamaturity(NeedsExpertReview)

		// TODO docs
		#FieldColorSeriesByMode: "min" | "max" | "last" @cuetsy(kind="type") @grafanamaturity(NeedsExpertReview)

		// TODO docs
		#FieldColor: {
			// The main color scheme mode
			mode: #FieldColorModeId | string
			// Stores the fixed color value if mode is fixed
			fixedColor?: string
			// Some visualizations need to know how to assign a series color from by value color schemes
			seriesBy?: #FieldColorSeriesByMode
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		#GridPos: {
			// Panel
			h: uint32 & >0 | *9 @grafanamaturity(NeedsExpertReview)
			// Panel
			w: uint32 & >0 & <=24 | *12 @grafanamaturity(NeedsExpertReview)
			// Panel x
			x: uint32 & >=0 & <24 | *0 @grafanamaturity(NeedsExpertReview)
			// Panel y
			y: uint32 & >=0 | *0 @grafanamaturity(NeedsExpertReview)
			// Whether the panel is fixed within the grid
			static?: bool @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface")

		// User-defined value for a metric that triggers visual changes in a panel when this value is met or exceeded
		// They are used to conditionally style and color visualizations based on query results , and can be applied to most visualizations.
		#Threshold: {
			// Value represents a specified metric for the threshold, which triggers a visual change in the dashboard when this value is met or exceeded.
			// FIXME the corresponding typescript field is required/non-optional, but nulls currently appear here when serializing -Infinity to JSON
			value?: number @grafanamaturity(NeedsExpertReview)
			// Color represents the color of the visual change that will occur in the dashboard when the threshold value is met or exceeded.
			color: string @grafanamaturity(NeedsExpertReview)
			// Threshold index, an old property that is not needed an should only appear in older dashboards
			index?: int32 @grafanamaturity(NeedsExpertReview)
			// TODO docs
			// TODO are the values here enumerable into a disjunction?
			// Some seem to be listed in typescript comment
			state?: string @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// Thresholds can either be absolute (specific number) or percentage (relative to min or max).
		#ThresholdsMode: "absolute" | "percentage" @cuetsy(kind="enum") @grafanamaturity(NeedsExpertReview)

		#ThresholdsConfig: {
			mode: #ThresholdsMode @grafanamaturity(NeedsExpertReview)

			// Must be sorted by 'value', first value is always -Infinity
			steps: [...#Threshold] @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// Allow to transform the visual representation of specific data values in a visualization, irrespective of their original units
		#ValueMapping: #ValueMap | #RangeMap | #RegexMap | #SpecialValueMap @cuetsy(kind="type") @grafanamaturity(NeedsExpertReview)

		// Supported value mapping types
		#MappingType: "value" | "range" | "regex" | "special" @cuetsy(kind="enum",memberNames="ValueToText|RangeToText|RegexToText|SpecialValue") @grafanamaturity(NeedsExpertReview)

		// Maps text values to a color or different display text
		#ValueMap: {
			type: #MappingType & "value"
			options: [string]: #ValueMappingResult
		} @cuetsy(kind="interface")

		// Maps numeric ranges to a color or different display text
		#RangeMap: {
			type: #MappingType & "range"
			options: {
				// to and from are `number | null` in current ts, really not sure what to do
				from:   float64 @grafanamaturity(NeedsExpertReview)
				to:     float64 @grafanamaturity(NeedsExpertReview)
				result: #ValueMappingResult
			}
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// Maps regular expressions to replacement text and a color
		#RegexMap: {
			type: #MappingType & "regex"
			options: {
				pattern: string
				result:  #ValueMappingResult
			}
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// Maps special values like Null, NaN (not a number), and boolean values like true and false to a display text
		// and color
		#SpecialValueMap: {
			type: #MappingType & "special"
			options: {
				match:   "true" | "false"
				pattern: string
				result:  #ValueMappingResult
			}
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// Special value types supported by the SpecialValueMap
		#SpecialValueMatch: "true" | "false" | "null" | "nan" | "null+nan" | "empty" @cuetsy(kind="enum",memberNames="True|False|Null|NaN|NullAndNan|Empty")

		// Result used as replacement text and color for RegexMap and SpecialValueMap
		#ValueMappingResult: {
			text?:  string
			color?: string
			icon?:  string
			index?: int32
		} @cuetsy(kind="interface")

		// TODO docs
		#DataTransformerConfig: {
			@grafana(TSVeneer="type")

			// Unique identifier of transformer
			id: string
			// Disabled transformations are skipped
			disabled?: bool
			// Optional frame matcher.  When missing it will be applied to all results
			filter?: #MatcherConfig
			// Options to be passed to the transformer
			// Valid options depend on the transformer id
			options: _
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// 0 for no shared crosshair or tooltip (default).
		// 1 for shared crosshair.
		// 2 for shared crosshair AND shared tooltip.
		#DashboardCursorSync: *0 | 1 | 2 @cuetsy(kind="enum",memberNames="Off|Crosshair|Tooltip")

		// Schema for panel targets is specified by datasource
		// plugins. We use a placeholder definition, which the Go
		// schema loader either left open/as-is with the Base
		// variant of the Dashboard and Panel families, or filled
		// with types derived from plugins in the Instance variant.
		// When working directly from CUE, importers can extend this
		// type directly to achieve the same effect.
		#Target: {...} @grafanamaturity(NeedsExpertReview)

		// A dashboard snapshot shares an interactive dashboard publicly.
		// It is a read-only version of a dashboard, and is not editable.
		// It is possible to create a snapshot of a snapshot.
		// Grafana strips away all sensitive information from the dashboard.
		// Sensitive information stripped: queries (metric, template,annotation) and panel links.
		#Snapshot: {
			// Time when the snapshot was created
			created: string & t.Time
			// Time when the snapshot expires, default is never to expire
			expires: string @grafanamaturity(NeedsExpertReview)
			// Is the snapshot saved in an external grafana instance
			external: bool @grafanamaturity(NeedsExpertReview)
			// external url, if snapshot was shared in external grafana instance
			externalUrl: string @grafanamaturity(NeedsExpertReview)
			// Unique identifier of the snapshot
			id: uint32 @grafanamaturity(NeedsExpertReview)
			// Optional, defined the unique key of the snapshot, required if external is true
			key: string @grafanamaturity(NeedsExpertReview)
			// Optional, name of the snapshot
			name: string @grafanamaturity(NeedsExpertReview)
			// org id of the snapshot
			orgId: uint32 @grafanamaturity(NeedsExpertReview)
			// last time when the snapshot was updated
			updated: string & t.Time
			// url of the snapshot, if snapshot was shared internally
			url?: string @grafanamaturity(NeedsExpertReview)
			// user id of the snapshot creator
			userId: uint32 @grafanamaturity(NeedsExpertReview)
		} @grafanamaturity(NeedsExpertReview)

		// Dashboard panels. Panels are canonically defined inline
		// because they share a version timeline with the dashboard
		// schema; they do not evolve independently.
		#Panel: {
			// The panel plugin type id. May not be empty.
			type: string & strings.MinRunes(1) @grafanamaturity(NeedsExpertReview)

			// TODO docs
			id?: uint32 @grafanamaturity(NeedsExpertReview)

			// FIXME this almost certainly has to be changed in favor of scuemata versions
			pluginVersion?: string @grafanamaturity(NeedsExpertReview)

			// TODO docs
			tags?: [...string] @grafanamaturity(NeedsExpertReview)

			// TODO docs
			targets?: [...#Target] @grafanamaturity(NeedsExpertReview)

			// Panel title.
			title?: string @grafanamaturity(NeedsExpertReview)
			// Description.
			description?: string @grafanamaturity(NeedsExpertReview)
			// Whether to display the panel without a background.
			transparent: bool | *false @grafanamaturity(NeedsExpertReview)
			// The datasource used in all targets.
			datasource?: {
				type?: string
				uid?:  string
			} @grafanamaturity(NeedsExpertReview)
			// Grid position.
			gridPos?: #GridPos
			// Panel links.
			// TODO fill this out - seems there are a couple variants?
			links?: [...#DashboardLink] @grafanamaturity(NeedsExpertReview)

			// Name of template variable to repeat for.
			repeat?: string @grafanamaturity(NeedsExpertReview)
			// Direction to repeat in if 'repeat' is set.
			// "h" for horizontal, "v" for vertical.
			// TODO this is probably optional
			repeatDirection: *"h" | "v" @grafanamaturity(NeedsExpertReview)
			// Id of the repeating panel.
			repeatPanelId?: int64 @grafanamaturity(NeedsExpertReview)

			// The maximum number of data points that the panel queries are retrieving.
			maxDataPoints?: number

			// TODO docs - seems to be an old field from old dashboard alerts?
			thresholds?: [...] @grafanamaturity(NeedsExpertReview)

			// TODO docs
			timeRegions?: [...] @grafanamaturity(NeedsExpertReview)

			transformations: [...#DataTransformerConfig] @grafanamaturity(NeedsExpertReview)

			// The min time interval setting defines a lower limit for the $__interval and $__interval_ms variables.
			// This value must be formatted as a number followed by a valid time 
			// identifier like: "40s", "3d", etc.
			// See: https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options
			interval?: string

			// Overrides the relative time range for individual panels, 
			// which causes them to be different than what is selected in 
			// the dashboard time picker in the top-right corner of the dashboard. You can use this to show metrics from different 
			// time periods or days on the same dashboard.
			// The value is formated as time operation like: `now-5m` (Last 5 minutes), `now/d` (the day so far), 
			// `now-5d/d`(Last 5 days), `now/w` (This week so far), `now-2y/y` (Last 2 years).
			// Note: Panel time overrides have no effect when the dashboard’s time range is absolute.
			// See: https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options
			timeFrom?: string

			// Overrides the time range for individual panels by shifting its start and end relative to the time picker. 
			// For example, you can shift the time range for the panel to be two hours earlier than the dashboard time picker setting `2h`.
			// Note: Panel time overrides have no effect when the dashboard’s time range is absolute.
			// See: https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options
			timeShift?: string

			// Dynamically load the panel
			libraryPanel?: #LibraryPanelRef

			// options is specified by the Options field in panel
			// plugin schemas.
			options: {...} @grafanamaturity(NeedsExpertReview)

			fieldConfig: #FieldConfigSource
		} @cuetsy(kind="interface") @grafana(TSVeneer="type") @grafanamaturity(NeedsExpertReview)

		#FieldConfigSource: {
			defaults: #FieldConfig
			overrides: [...{
				matcher: #MatcherConfig
				properties: [...#DynamicConfigValue]
			}] @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafana(TSVeneer="type") @grafanamaturity(NeedsExpertReview)

		#LibraryPanelRef: {
			name: string
			uid:  string
		} @cuetsy(kind="interface")

		#MatcherConfig: {
			id:       string | *"" @grafanamaturity(NeedsExpertReview)
			options?: _            @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafana(TSVeneer="type")

		#DynamicConfigValue: {
			id:     string | *"" @grafanamaturity(NeedsExpertReview)
			value?: _            @grafanamaturity(NeedsExpertReview)
		}

		#FieldConfig: {
			// The display value for this field.  This supports template variables blank is auto
			displayName?: string @grafanamaturity(NeedsExpertReview)

			// This can be used by data sources that return and explicit naming structure for values and labels
			// When this property is configured, this value is used rather than the default naming strategy.
			displayNameFromDS?: string @grafanamaturity(NeedsExpertReview)

			// Human readable field metadata
			description?: string @grafanamaturity(NeedsExpertReview)

			// An explicit path to the field in the datasource.  When the frame meta includes a path,
			// This will default to `${frame.meta.path}/${field.name}
			//
			// When defined, this value can be used as an identifier within the datasource scope, and
			// may be used to update the results
			path?: string @grafanamaturity(NeedsExpertReview)

			// True if data source can write a value to the path.  Auth/authz are supported separately
			writeable?: bool @grafanamaturity(NeedsExpertReview)

			// True if data source field supports ad-hoc filters
			filterable?: bool @grafanamaturity(NeedsExpertReview)

			// Numeric Options
			unit?: string @grafanamaturity(NeedsExpertReview)

			// Significant digits (for display)
			decimals?: number @grafanamaturity(NeedsExpertReview)

			min?: number @grafanamaturity(NeedsExpertReview)
			max?: number @grafanamaturity(NeedsExpertReview)

			// Convert input values into a display string
			mappings?: [...#ValueMapping] @grafanamaturity(NeedsExpertReview)

			// Map numeric values to states
			thresholds?: #ThresholdsConfig @grafanamaturity(NeedsExpertReview)

			// Map values to a display color
			color?: #FieldColor @grafanamaturity(NeedsExpertReview)

			// Used when reducing field values
			//   nullValueMode?: NullValueMode

			// The behavior when clicking on a result
			links?: [...] @grafanamaturity(NeedsExpertReview)

			// Alternative to empty string
			noValue?: string @grafanamaturity(NeedsExpertReview)

			// custom is specified by the FieldConfig field
			// in panel plugin schemas.
			custom?: {...} @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafana(TSVeneer="type") @grafanamaturity(NeedsExpertReview)

		// Row panel
		#RowPanel: {
			type:      "row"         @grafanamaturity(NeedsExpertReview)
			collapsed: bool | *false @grafanamaturity(NeedsExpertReview)
			title?:    string        @grafanamaturity(NeedsExpertReview)

			// Name of default datasource.
			datasource?: {
				type?: string @grafanamaturity(NeedsExpertReview)
				uid?:  string @grafanamaturity(NeedsExpertReview)
			} @grafanamaturity(NeedsExpertReview)

			gridPos?: #GridPos
			id:       uint32 @grafanamaturity(NeedsExpertReview)
			panels: [...(#Panel | #GraphPanel | #HeatmapPanel)] @grafanamaturity(NeedsExpertReview)
			// Name of template variable to repeat for.
			repeat?: string @grafanamaturity(NeedsExpertReview)
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		// Support for legacy graph and heatmap panels.
		#GraphPanel: {
			type: "graph" @grafanamaturity(NeedsExpertReview)
			// @deprecated this is part of deprecated graph panel
			legend?: {
				show:      bool | *true
				sort?:     string
				sortDesc?: bool
			}
			...
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)

		#HeatmapPanel: {
			type: "heatmap" @grafanamaturity(NeedsExpertReview)
			...
		} @cuetsy(kind="interface") @grafanamaturity(NeedsExpertReview)
	}
},
]
