package dashboard

maturity: "committed"

lineage: name: "dashboard"
lineage: seqs: [
	{
		schemas: [
			{// 0.0
				@grafana(TSVeneer="type")

				// Unique numeric identifier for the dashboard.
				// TODO must isolate or remove identifiers local to a Grafana instance...?
				id?: int64
				// Unique dashboard identifier that can be generated by anyone. string (8-40)
				uid?: string
				// Title of dashboard.
				title?: string
				// Description of dashboard.
				description?: string

				gnetId?: string @reviewme()
				// Tags associated with dashboard.
				tags?: [...string] @reviewme()
				// Theme of dashboard.
				style: "light" | *"dark" @reviewme()
				// Timezone of dashboard,
				timezone?: *"browser" | "utc" | "" @reviewme()
				// Whether a dashboard is editable or not.
				editable:     bool | *true
				graphTooltip: #DashboardCursorSync @reviewme()
				// Time range for dashboard, e.g. last 6 hours, last 7 days, etc
				time?: {
					from: string | *"now-6h"
					to:   string | *"now"
				} @reviewme()

				// TODO docs
				// TODO this appears to be spread all over in the frontend. Concepts will likely need tidying in tandem with schema changes
				timepicker?: {
					// Whether timepicker is collapsed or not.
					collapse: bool | *false
					// Whether timepicker is enabled or not.
					enable: bool | *true
					// Whether timepicker is visible or not.
					hidden: bool | *false
					// Selectable intervals for auto-refresh.
					refresh_intervals: [...string] | *["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"]
					// TODO docs
					time_options: [...string] | *["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
				} @reviewme()
				// TODO docs
				fiscalYearStartMonth?: uint8 & <13 @reviewme()
				// TODO docs
				liveNow?: bool @reviewme()
				// TODO docs
				weekStart?: string @reviewme()

				// TODO docs
				refresh?: string | false @reviewme()
				// Version of the JSON schema, incremented each time a Grafana update brings
				// changes to said schema.
				// TODO this is the existing schema numbering system. It will be replaced by Thema's themaVersion
				schemaVersion: uint16 | *36 @reviewme()
				// Version of the dashboard, incremented each time the dashboard is updated.
				version?: uint32 @reviewme()
				panels?: [...(#Panel | #RowPanel | #GraphPanel | #HeatmapPanel)] @reviewme()
				// TODO docs
				templating?: {
					list: [...#VariableModel] @reviewme()
				}
				// TODO docs
				annotations?: {
					list: [...#AnnotationQuery] @reviewme()
				}
				// TODO docs
				links?: [...#DashboardLink] @reviewme()

				///////////////////////////////////////
				// Definitions (referenced above) are declared below

				// TODO docs
				// FROM: AnnotationQuery in grafana-data/src/types/annotations.ts
				#AnnotationQuery: {
					// Datasource to use for annotation.
					datasource: {
						type?: string
						uid?:  string
					} @reviewme()

					// Whether annotation is enabled.
					enable: bool | *true @reviewme()
					// Name of annotation.
					name?:   string     @reviewme()
					builtIn: uint8 | *0 @reviewme() // TODO should this be persisted at all?
					// Whether to hide annotation.
					hide?: bool | *false @reviewme()
					// Annotation icon color.
					iconColor?: string                @reviewme()
					type:       string | *"dashboard" @reviewme()
					// Query for annotation data.
					rawQuery?: string     @reviewme()
					showIn:    uint8 | *0 @reviewme()
					target?:   #Target    @reviewme() // TODO currently a generic in AnnotationQuery
				} @cuetsy(kind="interface")

				// FROM: packages/grafana-data/src/types/templateVars.ts
				// TODO docs
				// TODO what about what's in public/app/features/types.ts?
				// TODO there appear to be a lot of different kinds of [template] vars here? if so need a disjunction
				#VariableModel: {
					type:   #VariableType
					name:   string
					label?: string
					...
				} @cuetsy(kind="interface") @reviewme()

				// FROM public/app/features/dashboard/state/DashboardModels.ts - ish
				// TODO docs
				#DashboardLink: {
					title:    string             @reviewme()
					type:     #DashboardLinkType @reviewme()
					icon?:    string             @reviewme()
					tooltip?: string             @reviewme()
					url?:     string             @reviewme()
					tags: [...string] @reviewme()
					asDropdown:  bool | *false @reviewme()
					targetBlank: bool | *false @reviewme()
					includeVars: bool | *false @reviewme()
					keepTime:    bool | *false @reviewme()
				} @cuetsy(kind="interface")

				// TODO docs
				#DashboardLinkType: "link" | "dashboards" @cuetsy(kind="type") @reviewme()

				// FROM: packages/grafana-data/src/types/templateVars.ts
				// TODO docs
				// TODO this implies some wider pattern/discriminated union, probably?
				#VariableType: "query" | "adhoc" | "constant" | "datasource" | "interval" | "textbox" | "custom" | "system" @cuetsy(kind="type") @reviewme()

				// TODO docs
				#FieldColorModeId: "thresholds" | "palette-classic" | "palette-saturated" | "continuous-GrYlRd" | "fixed" @cuetsy(kind="enum",memberNames="Thresholds|PaletteClassic|PaletteSaturated|ContinuousGrYlRd|Fixed") @reviewme()

				// TODO docs
				#FieldColorSeriesByMode: "min" | "max" | "last" @cuetsy(kind="type") @reviewme()

				// TODO docs
				#FieldColor: {
					// The main color scheme mode
					mode: #FieldColorModeId | string
					// Stores the fixed color value if mode is fixed
					fixedColor?: string
					// Some visualizations need to know how to assign a series color from by value color schemes
					seriesBy?: #FieldColorSeriesByMode
				} @cuetsy(kind="interface") @reviewme()

				#GridPos: {
					// Panel
					h: uint32 & >0 | *9 @reviewme()
					// Panel
					w: uint32 & >0 & <=24 | *12 @reviewme()
					// Panel x
					x: uint32 & >=0 & <24 | *0 @reviewme()
					// Panel y
					y: uint32 & >=0 | *0 @reviewme()
					// true if fixed
					static?: bool @reviewme()
				} @cuetsy(kind="interface")

				// TODO docs
				#Threshold: {
					// TODO docs
					// FIXME the corresponding typescript field is required/non-optional, but nulls currently appear here when serializing -Infinity to JSON
					value?: number @reviewme()
					// TODO docs
					color: string @reviewme()
					// TODO docs
					// TODO are the values here enumerable into a disjunction?
					// Some seem to be listed in typescript comment
					state?: string @reviewme()
				} @cuetsy(kind="interface") @reviewme()

				#ThresholdsMode: "absolute" | "percentage" @cuetsy(kind="enum") @reviewme()

				#ThresholdsConfig: {
					mode: #ThresholdsMode @reviewme()

					// Must be sorted by 'value', first value is always -Infinity
					steps: [...#Threshold] @reviewme()
				} @cuetsy(kind="interface") @reviewme()

				// TODO docs
				#ValueMapping: #ValueMap | #RangeMap | #RegexMap | #SpecialValueMap @cuetsy(kind="type") @reviewme()

				// TODO docs
				#MappingType: "value" | "range" | "regex" | "special" @cuetsy(kind="enum",memberNames="ValueToText|RangeToText|RegexToText|SpecialValue") @reviewme()

				// TODO docs
				#ValueMap: {
					type: #MappingType & "value"
					options: [string]: #ValueMappingResult
				} @cuetsy(kind="interface")

				// TODO docs
				#RangeMap: {
					type: #MappingType & "range"
					options: {
						// to and from are `number | null` in current ts, really not sure what to do
						from:   int32 @reviewme()
						to:     int32 @reviewme()
						result: #ValueMappingResult
					}
				} @cuetsy(kind="interface") @reviewme()

				// TODO docs
				#RegexMap: {
					type: #MappingType & "regex"
					options: {
						pattern: string
						result:  #ValueMappingResult
					}
				} @cuetsy(kind="interface") @reviewme()

				// TODO docs
				#SpecialValueMap: {
					type: #MappingType & "special"
					options: {
						match:   "true" | "false"
						pattern: string
						result:  #ValueMappingResult
					}
				} @cuetsy(kind="interface") @reviewme()

				// TODO docs
				#SpecialValueMatch: "true" | "false" | "null" | "nan" | "null+nan" | "empty" @cuetsy(kind="enum",memberNames="True|False|Null|NaN|NullAndNan|Empty")

				// TODO docs
				#ValueMappingResult: {
					text?:  string
					color?: string
					icon?:  string
					index?: int32
				} @cuetsy(kind="interface")

				// TODO docs
				// FIXME this is extremely underspecfied; wasn't obvious which typescript types corresponded to it
				#Transformation: {
					id: string
					options: {...}
				} @cuetsy(kind="interface") @reviewme()

				// 0 for no shared crosshair or tooltip (default).
				// 1 for shared crosshair.
				// 2 for shared crosshair AND shared tooltip.
				#DashboardCursorSync: *0 | 1 | 2 @cuetsy(kind="enum",memberNames="Off|Crosshair|Tooltip") @reviewme()

				// Schema for panel targets is specified by datasource
				// plugins. We use a placeholder definition, which the Go
				// schema loader either left open/as-is with the Base
				// variant of the Dashboard and Panel families, or filled
				// with types derived from plugins in the Instance variant.
				// When working directly from CUE, importers can extend this
				// type directly to achieve the same effect.
				#Target: {...} @reviewme()

				// Dashboard panels. Panels are canonically defined inline
				// because they share a version timeline with the dashboard
				// schema; they do not evolve independently.
				#Panel: {
					// The panel plugin type id. May not be empty.
					type: string & strings.MinRunes(1) @reviewme()

					// TODO docs
					id?: uint32 @reviewme()

					// FIXME this almost certainly has to be changed in favor of scuemata versions
					pluginVersion?: string @reviewme()

					// TODO docs
					tags?: [...string] @reviewme()

					// TODO docs
					targets?: [...#Target] @reviewme()

					// Panel title.
					title?: string @reviewme()
					// Description.
					description?: string @reviewme()
					// Whether to display the panel without a background.
					transparent: bool | *false @reviewme()
					// The datasource used in all targets.
					datasource?: {
						type?: string
						uid?:  string
					} @reviewme()
					// Grid position.
					gridPos?: #GridPos
					// Panel links.
					// TODO fill this out - seems there are a couple variants?
					links?: [...#DashboardLink] @reviewme()

					// Name of template variable to repeat for.
					repeat?: string @reviewme()
					// Direction to repeat in if 'repeat' is set.
					// "h" for horizontal, "v" for vertical.
					repeatDirection: *"h" | "v" @reviewme()

					// TODO docs
					maxDataPoints?: number @reviewme()

					// TODO docs - seems to be an old field from old dashboard alerts?
					thresholds?: [...] @reviewme()

					// TODO docs
					timeRegions?: [...] @reviewme()

					transformations: [...#Transformation] @reviewme()

					// TODO docs
					// TODO tighter constraint
					interval?: string @reviewme()

					// TODO docs
					// TODO tighter constraint
					timeFrom?: string @reviewme()

					// TODO docs
					// TODO tighter constraint
					timeShift?: string @reviewme()

					// options is specified by the PanelOptions field in panel
					// plugin schemas.
					options: {...} @reviewme()

					fieldConfig: #FieldConfigSource
				} @cuetsy(kind="interface") @grafana(TSVeneer="type") @reviewme()

				#FieldConfigSource: {
					defaults: #FieldConfig
					overrides: [...{
						matcher: #MatcherConfig
						properties: [...#DynamicConfigValue]
					}] @reviewme()
				} @cuetsy(kind="interface") @grafana(TSVeneer="type") @reviewme()

				#MatcherConfig: {
					id:       string | *"" @reviewme()
					options?: _            @reviewme()
				} @cuetsy(kind="interface")

				#DynamicConfigValue: {
					id:     string | *"" @reviewme()
					value?: _            @reviewme()
				}

				#FieldConfig: {
					// The display value for this field.  This supports template variables blank is auto
					displayName?: string @reviewme()

					// This can be used by data sources that return and explicit naming structure for values and labels
					// When this property is configured, this value is used rather than the default naming strategy.
					displayNameFromDS?: string @reviewme()

					// Human readable field metadata
					description?: string @reviewme()

					// An explict path to the field in the datasource.  When the frame meta includes a path,
					// This will default to `${frame.meta.path}/${field.name}
					//
					// When defined, this value can be used as an identifier within the datasource scope, and
					// may be used to update the results
					path?: string @reviewme()

					// True if data source can write a value to the path.  Auth/authz are supported separately
					writeable?: bool @reviewme()

					// True if data source field supports ad-hoc filters
					filterable?: bool @reviewme()

					// Numeric Options
					unit?: string @reviewme()

					// Significant digits (for display)
					decimals?: number @reviewme()

					min?: number @reviewme()
					max?: number @reviewme()

					// Convert input values into a display string
					mappings?: [...#ValueMapping] @reviewme()

					// Map numeric values to states
					thresholds?: #ThresholdsConfig @reviewme()

					// Map values to a display color
					color?: #FieldColor @reviewme()

					// Used when reducing field values
					//   nullValueMode?: NullValueMode

					// The behavior when clicking on a result
					links?: [...] @reviewme()

					// Alternative to empty string
					noValue?: string @reviewme()

					// custom is specified by the PanelFieldConfig field
					// in panel plugin schemas.
					custom?: {...} @reviewme()
				} @cuetsy(kind="interface") @grafana(TSVeneer="type") @reviewme()

				// Row panel
				#RowPanel: {
					type:      "row"         @reviewme()
					collapsed: bool | *false @reviewme()
					title?:    string        @reviewme()

					// Name of default datasource.
					datasource?: {
						type?: string @reviewme()
						uid?:  string @reviewme()
					} @reviewme()

					gridPos?: #GridPos
					id:       uint32 @reviewme()
					panels: [...(#Panel | #GraphPanel | #HeatmapPanel)] @reviewme()
					// Name of template variable to repeat for.
					repeat?: string @reviewme()
				} @cuetsy(kind="interface") @reviewme()

				// Support for legacy graph and heatmap panels.
				#GraphPanel: {
					type: "graph" @reviewme()
					...
				} @reviewme()
				#HeatmapPanel: {
					type: "heatmap" @reviewme()
					...
				} @reviewme()
			}]
	}]
