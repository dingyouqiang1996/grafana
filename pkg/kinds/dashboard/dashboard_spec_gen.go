// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     GoResourceTypes
//
// Run 'make gen-cue' from repository root to regenerate.

package dashboard

import (
	"time"
)

// Defines values for CursorSync.
const (
	CursorSyncN0 CursorSync = 0
	CursorSyncN1 CursorSync = 1
	CursorSyncN2 CursorSync = 2
)

// Defines values for LinkType.
const (
	LinkTypeDashboards LinkType = "dashboards"
	LinkTypeLink       LinkType = "link"
)

// Defines values for FieldColorSeriesByMode.
const (
	FieldColorSeriesByModeLast FieldColorSeriesByMode = "last"
	FieldColorSeriesByModeMax  FieldColorSeriesByMode = "max"
	FieldColorSeriesByModeMin  FieldColorSeriesByMode = "min"
)

// Defines values for GraphPanelType.
const (
	GraphPanelTypeGraph GraphPanelType = "graph"
)

// Defines values for HeatmapPanelType.
const (
	HeatmapPanelTypeHeatmap HeatmapPanelType = "heatmap"
)

// Defines values for LoadingState.
const (
	LoadingStateDone       LoadingState = "Done"
	LoadingStateError      LoadingState = "Error"
	LoadingStateLoading    LoadingState = "Loading"
	LoadingStateNotStarted LoadingState = "NotStarted"
	LoadingStateStreaming  LoadingState = "Streaming"
)

// Defines values for MappingType.
const (
	MappingTypeRange   MappingType = "range"
	MappingTypeRegex   MappingType = "regex"
	MappingTypeSpecial MappingType = "special"
	MappingTypeValue   MappingType = "value"
)

// Defines values for PanelRepeatDirection.
const (
	PanelRepeatDirectionH PanelRepeatDirection = "h"
	PanelRepeatDirectionV PanelRepeatDirection = "v"
)

// Defines values for RangeMapType.
const (
	RangeMapTypeRange   RangeMapType = "range"
	RangeMapTypeRegex   RangeMapType = "regex"
	RangeMapTypeSpecial RangeMapType = "special"
	RangeMapTypeValue   RangeMapType = "value"
)

// Defines values for RegexMapType.
const (
	RegexMapTypeRange   RegexMapType = "range"
	RegexMapTypeRegex   RegexMapType = "regex"
	RegexMapTypeSpecial RegexMapType = "special"
	RegexMapTypeValue   RegexMapType = "value"
)

// Defines values for RowPanelType.
const (
	RowPanelTypeRow RowPanelType = "row"
)

// Defines values for SpecStyle.
const (
	SpecStyleDark  SpecStyle = "dark"
	SpecStyleLight SpecStyle = "light"
)

// Defines values for SpecialValueMapOptionsMatch.
const (
	SpecialValueMapOptionsMatchFalse SpecialValueMapOptionsMatch = "false"
	SpecialValueMapOptionsMatchTrue  SpecialValueMapOptionsMatch = "true"
)

// Defines values for SpecialValueMapType.
const (
	SpecialValueMapTypeRange   SpecialValueMapType = "range"
	SpecialValueMapTypeRegex   SpecialValueMapType = "regex"
	SpecialValueMapTypeSpecial SpecialValueMapType = "special"
	SpecialValueMapTypeValue   SpecialValueMapType = "value"
)

// Defines values for ThresholdsMode.
const (
	ThresholdsModeAbsolute   ThresholdsMode = "absolute"
	ThresholdsModePercentage ThresholdsMode = "percentage"
)

// Defines values for ValueMapType.
const (
	ValueMapTypeRange   ValueMapType = "range"
	ValueMapTypeRegex   ValueMapType = "regex"
	ValueMapTypeSpecial ValueMapType = "special"
	ValueMapTypeValue   ValueMapType = "value"
)

// Defines values for VariableHide.
const (
	VariableHideN0 VariableHide = 0
	VariableHideN1 VariableHide = 1
	VariableHideN2 VariableHide = 2
)

// Defines values for VariableType.
const (
	VariableTypeAdhoc      VariableType = "adhoc"
	VariableTypeConstant   VariableType = "constant"
	VariableTypeCustom     VariableType = "custom"
	VariableTypeDatasource VariableType = "datasource"
	VariableTypeInterval   VariableType = "interval"
	VariableTypeQuery      VariableType = "query"
	VariableTypeSystem     VariableType = "system"
	VariableTypeTextbox    VariableType = "textbox"
)

// TODO -- should not be a public interface on its own, but required for Veneer
type AnnotationContainer struct {
	List []AnnotationQuery `json:"list,omitempty"`
}

// AnnotationPanelFilter defines model for AnnotationPanelFilter.
type AnnotationPanelFilter struct {
	// Should the specified panels be included or excluded
	Exclude *bool `json:"exclude,omitempty"`

	// Panel IDs that should be included or excluded
	Ids []int `json:"ids"`
}

// TODO docs
// FROM: AnnotationQuery in grafana-data/src/types/annotations.ts
type AnnotationQuery struct {
	// Ref to a DataSource instance
	Datasource DataSourceRef `json:"datasource"`

	// When enabled the annotation query is issued with every dashboard refresh
	Enable bool                   `json:"enable"`
	Filter *AnnotationPanelFilter `json:"filter,omitempty"`

	// Annotation queries can be toggled on or off at the top of the dashboard.
	// When hide is true, the toggle is not shown in the dashboard.
	Hide *bool `json:"hide,omitempty"`

	// Color to use for the annotation event markers
	IconColor string `json:"iconColor"`

	// Name of annotation.
	Name string `json:"name"`

	// TODO: this should be a regular DataQuery that depends on the selected dashboard
	// these match the properties of the "grafana" datasouce that is default in most dashboards
	Target *AnnotationTarget `json:"target,omitempty"`

	// TODO -- this should not exist here, it is based on the --grafana-- datasource
	Type *string `json:"type,omitempty"`
}

// TODO: this should be a regular DataQuery that depends on the selected dashboard
// these match the properties of the "grafana" datasouce that is default in most dashboards
type AnnotationTarget struct {
	// Only required/valid for the grafana datasource...
	// but code+tests is already depending on it so hard to change
	Limit int64 `json:"limit"`

	// Only required/valid for the grafana datasource...
	// but code+tests is already depending on it so hard to change
	MatchAny bool `json:"matchAny"`

	// Only required/valid for the grafana datasource...
	// but code+tests is already depending on it so hard to change
	Tags []string `json:"tags"`

	// Only required/valid for the grafana datasource...
	// but code+tests is already depending on it so hard to change
	Type string `json:"type"`
}

// 0 for no shared crosshair or tooltip (default).
// 1 for shared crosshair.
// 2 for shared crosshair AND shared tooltip.
type CursorSync int

// FROM public/app/features/dashboard/state/Models.ts - ish
// TODO docs
type Link struct {
	AsDropdown  bool     `json:"asDropdown"`
	Icon        string   `json:"icon"`
	IncludeVars bool     `json:"includeVars"`
	KeepTime    bool     `json:"keepTime"`
	Tags        []string `json:"tags"`
	TargetBlank bool     `json:"targetBlank"`
	Title       string   `json:"title"`
	Tooltip     string   `json:"tooltip"`

	// TODO docs
	Type LinkType `json:"type"`
	Url  string   `json:"url"`
}

// TODO docs
type LinkType string

// Ref to a DataSource instance
type DataSourceRef struct {
	// The plugin type-id
	Type *string `json:"type,omitempty"`

	// Specific datasource instance
	Uid *string `json:"uid,omitempty"`
}

// TODO docs
type DataTransformerConfig struct {
	// Disabled transformations are skipped
	Disabled *bool          `json:"disabled,omitempty"`
	Filter   *MatcherConfig `json:"filter,omitempty"`

	// Unique identifier of transformer
	Id string `json:"id"`

	// Options to be passed to the transformer
	// Valid options depend on the transformer id
	Options interface{} `json:"options"`
}

// DynamicConfigValue defines model for DynamicConfigValue.
type DynamicConfigValue struct {
	Id    string       `json:"id"`
	Value *interface{} `json:"value,omitempty"`
}

// TODO docs
type FieldColor struct {
	// Stores the fixed color value if mode is fixed
	FixedColor *string `json:"fixedColor,omitempty"`

	// The main color scheme mode
	Mode string `json:"mode"`

	// TODO docs
	SeriesBy *FieldColorSeriesByMode `json:"seriesBy,omitempty"`
}

// TODO docs
type FieldColorSeriesByMode string

// FieldConfig defines model for FieldConfig.
type FieldConfig struct {
	// TODO docs
	Color *FieldColor `json:"color,omitempty"`

	// custom is specified by the FieldConfig field
	// in panel plugin schemas.
	Custom map[string]interface{} `json:"custom,omitempty"`

	// Significant digits (for display)
	Decimals *float32 `json:"decimals,omitempty"`

	// Human readable field metadata
	Description *string `json:"description,omitempty"`

	// The display value for this field.  This supports template variables blank is auto
	DisplayName *string `json:"displayName,omitempty"`

	// This can be used by data sources that return and explicit naming structure for values and labels
	// When this property is configured, this value is used rather than the default naming strategy.
	DisplayNameFromDS *string `json:"displayNameFromDS,omitempty"`

	// True if data source field supports ad-hoc filters
	Filterable *bool `json:"filterable,omitempty"`

	// The behavior when clicking on a result
	Links []interface{} `json:"links,omitempty"`

	// Convert input values into a display string
	Mappings []interface{} `json:"mappings,omitempty"`
	Max      *float32      `json:"max,omitempty"`
	Min      *float32      `json:"min,omitempty"`

	// Alternative to empty string
	NoValue *string `json:"noValue,omitempty"`

	// An explicit path to the field in the datasource.  When the frame meta includes a path,
	// This will default to `${frame.meta.path}/${field.name}
	//
	// When defined, this value can be used as an identifier within the datasource scope, and
	// may be used to update the results
	Path       *string           `json:"path,omitempty"`
	Thresholds *ThresholdsConfig `json:"thresholds,omitempty"`

	// Numeric Options
	Unit *string `json:"unit,omitempty"`

	// True if data source can write a value to the path.  Auth/authz are supported separately
	Writeable *bool `json:"writeable,omitempty"`
}

// FieldConfigSource defines model for FieldConfigSource.
type FieldConfigSource struct {
	Defaults  FieldConfig `json:"defaults"`
	Overrides []struct {
		Matcher    MatcherConfig        `json:"matcher"`
		Properties []DynamicConfigValue `json:"properties"`
	} `json:"overrides"`
}

// Support for legacy graph and heatmap panels.
type GraphPanel struct {
	// @deprecated this is part of deprecated graph panel
	Legend *struct {
		Show     bool    `json:"show"`
		Sort     *string `json:"sort,omitempty"`
		SortDesc *bool   `json:"sortDesc,omitempty"`
	} `json:"legend,omitempty"`
	Type GraphPanelType `json:"type"`
}

// GraphPanelType defines model for GraphPanel.Type.
type GraphPanelType string

// GridPos defines model for GridPos.
type GridPos struct {
	// H Panel
	H int `json:"h"`

	// Whether the panel is fixed within the grid
	Static *bool `json:"static,omitempty"`

	// W Panel
	W int `json:"w"`

	// Panel x
	X int `json:"x"`

	// Panel y
	Y int `json:"y"`
}

// HeatmapPanel defines model for HeatmapPanel.
type HeatmapPanel struct {
	Type HeatmapPanelType `json:"type"`
}

// HeatmapPanelType defines model for HeatmapPanel.Type.
type HeatmapPanelType string

// LibraryPanelRef defines model for LibraryPanelRef.
type LibraryPanelRef struct {
	Name string `json:"name"`
	Uid  string `json:"uid"`
}

// LoadingState defines model for LoadingState.
type LoadingState string

// Supported value mapping types
type MappingType string

// MatcherConfig defines model for MatcherConfig.
type MatcherConfig struct {
	Id      string       `json:"id"`
	Options *interface{} `json:"options,omitempty"`
}

// Dashboard panels. Panels are canonically defined inline
// because they share a version timeline with the dashboard
// schema; they do not evolve independently.
type Panel struct {
	// The datasource used in all targets.
	Datasource *struct {
		Type *string `json:"type,omitempty"`
		Uid  *string `json:"uid,omitempty"`
	} `json:"datasource,omitempty"`

	// Description Description.
	Description *string           `json:"description,omitempty"`
	FieldConfig FieldConfigSource `json:"fieldConfig"`
	GridPos     *GridPos          `json:"gridPos,omitempty"`

	// TODO docs
	Id *int `json:"id,omitempty"`

	// The min time interval setting defines a lower limit for the $__interval and $__interval_ms variables.
	// This value must be formatted as a number followed by a valid time
	// identifier like: "40s", "3d", etc.
	// See: https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/#__interval
	Interval     *string          `json:"interval,omitempty"`
	LibraryPanel *LibraryPanelRef `json:"libraryPanel,omitempty"`

	// Panel links.
	// TODO fill this out - seems there are a couple variants?
	Links []Link `json:"links,omitempty"`

	// The maximum number of data points that the panel queries are retrieving.
	MaxDataPoints *float32 `json:"maxDataPoints,omitempty"`

	// options is specified by the Options field in panel
	// plugin schemas.
	Options map[string]interface{} `json:"options"`

	// FIXME this almost certainly has to be changed in favor of scuemata versions
	PluginVersion *string `json:"pluginVersion,omitempty"`

	// Name of template variable to repeat for.
	Repeat *string `json:"repeat,omitempty"`

	// Direction to repeat in if 'repeat' is set.
	// "h" for horizontal, "v" for vertical.
	// TODO this is probably optional
	RepeatDirection PanelRepeatDirection `json:"repeatDirection"`

	// Id of the repeating panel.
	RepeatPanelId *int64 `json:"repeatPanelId,omitempty"`

	// TODO docs
	Tags []string `json:"tags,omitempty"`

	// TODO docs
	Targets []Target `json:"targets,omitempty"`

	// TODO docs - seems to be an old field from old dashboard alerts?
	Thresholds []interface{} `json:"thresholds,omitempty"`

	// TODO docs
	// TODO tighter constraint
	TimeFrom *string `json:"timeFrom,omitempty"`

	// TODO docs
	TimeRegions []interface{} `json:"timeRegions,omitempty"`

	// TODO docs
	// TODO tighter constraint
	TimeShift *string `json:"timeShift,omitempty"`

	// Panel title.
	Title           *string                 `json:"title,omitempty"`
	Transformations []DataTransformerConfig `json:"transformations"`

	// Whether to display the panel without a background.
	Transparent bool `json:"transparent"`

	// The panel plugin type id. May not be empty.
	Type string `json:"type"`
}

// Direction to repeat in if 'repeat' is set.
// "h" for horizontal, "v" for vertical.
// TODO this is probably optional
type PanelRepeatDirection string

// Maps numeric ranges to a color or different display text
type RangeMap struct {
	Options struct {
		// From to and from are `number | null` in current ts, really not sure what to do
		From float64 `json:"from"`

		// Result used as replacement text and color for RegexMap and SpecialValueMap
		Result ValueMappingResult `json:"result"`
		To     float64            `json:"to"`
	} `json:"options"`
	Type RangeMapType `json:"type"`
}

// RangeMapType defines model for RangeMap.Type.
type RangeMapType string

// Maps regular expressions to replacement text and a color
type RegexMap struct {
	Options struct {
		Pattern string `json:"pattern"`

		// Result used as replacement text and color for RegexMap and SpecialValueMap
		Result ValueMappingResult `json:"result"`
	} `json:"options"`
	Type RegexMapType `json:"type"`
}

// RegexMapType defines model for RegexMap.Type.
type RegexMapType string

// Row panel
type RowPanel struct {
	Collapsed bool `json:"collapsed"`

	// Name of default datasource.
	Datasource *struct {
		Type *string `json:"type,omitempty"`
		Uid  *string `json:"uid,omitempty"`
	} `json:"datasource,omitempty"`
	GridPos *GridPos      `json:"gridPos,omitempty"`
	Id      int           `json:"id"`
	Panels  []interface{} `json:"panels"`

	// Name of template variable to repeat for.
	Repeat *string      `json:"repeat,omitempty"`
	Title  *string      `json:"title,omitempty"`
	Type   RowPanelType `json:"type"`
}

// RowPanelType defines model for RowPanel.Type.
type RowPanelType string

// A dashboard snapshot shares an interactive dashboard publicly.
// It is a read-only version of a dashboard, and is not editable.
// It is possible to create a snapshot of a snapshot.
// Grafana strips away all sensitive information from the dashboard.
// Sensitive information stripped: queries (metric, template,annotation) and panel links.
type Snapshot struct {
	// Time when the snapshot was created
	Created time.Time `json:"created"`

	// Time when the snapshot expires, default is never to expire
	Expires string `json:"expires"`

	// Is the snapshot saved in an external grafana instance
	External bool `json:"external"`

	// ExternalUrl external url, if snapshot was shared in external grafana instance
	ExternalUrl string `json:"externalUrl"`

	// Unique identifier of the snapshot
	Id int `json:"id"`

	// Optional, defined the unique key of the snapshot, required if external is true
	Key string `json:"key"`

	// Optional, name of the snapshot
	Name string `json:"name"`

	// OrgId org id of the snapshot
	OrgId int `json:"orgId"`

	// Updated last time when the snapshot was updated
	Updated time.Time `json:"updated"`

	// url of the snapshot, if snapshot was shared internally
	Url *string `json:"url,omitempty"`

	// UserId user id of the snapshot creator
	UserId int `json:"userId"`
}

// Spec defines model for Spec.
type Spec struct {
	// TODO -- should not be a public interface on its own, but required for Veneer
	Annotations *AnnotationContainer `json:"annotations,omitempty"`

	// Description of dashboard.
	Description *string `json:"description,omitempty"`

	// Whether a dashboard is editable or not.
	Editable bool `json:"editable"`

	// The month that the fiscal year starts on.  0 = January, 11 = December
	FiscalYearStartMonth *int `json:"fiscalYearStartMonth,omitempty"`

	// ID of a dashboard imported from the https://grafana.com/grafana/dashboards/ portal
	GnetId *string `json:"gnetId,omitempty"`

	// 0 for no shared crosshair or tooltip (default).
	// 1 for shared crosshair.
	// 2 for shared crosshair AND shared tooltip.
	GraphTooltip CursorSync `json:"graphTooltip"`

	// Unique numeric identifier for the dashboard.
	// TODO must isolate or remove identifiers local to a Grafana instance...?
	Id *int64 `json:"id,omitempty"`

	// TODO docs
	Links []Link `json:"links,omitempty"`

	// When set to true, the dashboard will redraw panels at an interval matching the pixel width.
	// This will keep data "moving left" regardless of the query refresh rate.  This setting helps
	// avoid dashboards presenting stale live data
	LiveNow *bool         `json:"liveNow,omitempty"`
	Panels  []interface{} `json:"panels,omitempty"`

	// Refresh rate of dashboard. Represented via interval string, e.g. "5s", "1m", "1h", "1d".
	Refresh *interface{} `json:"refresh,omitempty"`

	// This property should only be used in dashboards defined by plugins.  It is a quick check
	// to see if the version has changed since the last time.  Unclear why using the version property
	// is insufficient.
	Revision *int64 `json:"revision,omitempty"`

	// Version of the JSON schema, incremented each time a Grafana update brings
	// changes to said schema.
	// TODO this is the existing schema numbering system. It will be replaced by Thema's themaVersion
	SchemaVersion int `json:"schemaVersion"`

	// A dashboard snapshot shares an interactive dashboard publicly.
	// It is a read-only version of a dashboard, and is not editable.
	// It is possible to create a snapshot of a snapshot.
	// Grafana strips away all sensitive information from the dashboard.
	// Sensitive information stripped: queries (metric, template,annotation) and panel links.
	Snapshot *Snapshot `json:"snapshot,omitempty"`

	// Theme of dashboard.
	Style SpecStyle `json:"style"`

	// Tags associated with dashboard.
	Tags []string `json:"tags,omitempty"`

	// Contains the list of configured template variables with their saved values along with some other metadata
	Templating *struct {
		List []VariableModel `json:"list,omitempty"`
	} `json:"templating,omitempty"`

	// Time range for dashboard.
	// Accepted values are relative time strings like {from: 'now-6h', to: 'now'} or absolute time strings like {from: '2020-07-10T08:00:00.000Z', to: '2020-07-10T14:00:00.000Z'}.
	Time *struct {
		From string `json:"from"`
		To   string `json:"to"`
	} `json:"time,omitempty"`

	// Configuration of the time picker shown at the top of a dashboard.
	Timepicker *struct {
		// Whether timepicker is collapsed or not. Has no effect on provisioned dashboard.
		Collapse bool `json:"collapse"`

		// Whether timepicker is enabled or not. Has no effect on provisioned dashboard.
		Enable bool `json:"enable"`

		// Whether timepicker is visible or not.
		Hidden bool `json:"hidden"`

		// Interval options available in the refresh picker dropdown.
		RefreshIntervals []string `json:"refresh_intervals"`

		// Selectable options available in the time picker dropdown. Has no effect on provisioned dashboard.
		TimeOptions []string `json:"time_options"`
	} `json:"timepicker,omitempty"`

	// Timezone of dashboard. Accepted values are IANA TZDB zone ID or "browser" or "utc".
	Timezone *string `json:"timezone,omitempty"`

	// Title of dashboard.
	Title *string `json:"title,omitempty"`

	// Unique dashboard identifier that can be generated by anyone. string (8-40)
	Uid *string `json:"uid,omitempty"`

	// Version of the dashboard, incremented each time the dashboard is updated.
	Version *int `json:"version,omitempty"`

	// Day when the week starts. Expressed by the name of the day in lowercase, e.g. "monday".
	WeekStart *string `json:"weekStart,omitempty"`
}

// Theme of dashboard.
type SpecStyle string

// Maps special values like Null, NaN (not a number), and boolean values like true and false to a display text
// and color
type SpecialValueMap struct {
	Options struct {
		Match   SpecialValueMapOptionsMatch `json:"match"`
		Pattern string                      `json:"pattern"`

		// Result used as replacement text and color for RegexMap and SpecialValueMap
		Result ValueMappingResult `json:"result"`
	} `json:"options"`
	Type SpecialValueMapType `json:"type"`
}

// SpecialValueMapOptionsMatch defines model for SpecialValueMap.Options.Match.
type SpecialValueMapOptionsMatch string

// SpecialValueMapType defines model for SpecialValueMap.Type.
type SpecialValueMapType string

// Schema for panel targets is specified by datasource
// plugins. We use a placeholder definition, which the Go
// schema loader either left open/as-is with the Base
// variant of the Dashboard and Panel families, or filled
// with types derived from plugins in the Instance variant.
// When working directly from CUE, importers can extend this
// type directly to achieve the same effect.
type Target = map[string]interface{}

// TODO docs
type Threshold struct {
	// TODO docs
	Color string `json:"color"`

	// Threshold index, an old property that is not needed an should only appear in older dashboards
	Index *int32 `json:"index,omitempty"`

	// TODO docs
	// TODO are the values here enumerable into a disjunction?
	// Some seem to be listed in typescript comment
	State *string `json:"state,omitempty"`

	// TODO docs
	// FIXME the corresponding typescript field is required/non-optional, but nulls currently appear here when serializing -Infinity to JSON
	Value *float32 `json:"value,omitempty"`
}

// ThresholdsConfig defines model for ThresholdsConfig.
type ThresholdsConfig struct {
	Mode ThresholdsMode `json:"mode"`

	// Must be sorted by 'value', first value is always -Infinity
	Steps []Threshold `json:"steps"`
}

// ThresholdsMode defines model for ThresholdsMode.
type ThresholdsMode string

// Maps text values to a color or different display text
type ValueMap struct {
	Options map[string]ValueMappingResult `json:"options"`
	Type    ValueMapType                  `json:"type"`
}

// ValueMapType defines model for ValueMap.Type.
type ValueMapType string

// Result used as replacement text and color for RegexMap and SpecialValueMap
type ValueMappingResult struct {
	Color *string `json:"color,omitempty"`
	Icon  *string `json:"icon,omitempty"`
	Index *int32  `json:"index,omitempty"`
	Text  *string `json:"text,omitempty"`
}

// VariableHide defines model for VariableHide.
type VariableHide int

// FROM: packages/grafana-data/src/types/templateVars.ts
// TODO docs
// TODO what about what's in public/app/features/types.ts?
// TODO there appear to be a lot of different kinds of [template] vars here? if so need a disjunction
type VariableModel struct {
	// Ref to a DataSource instance
	Datasource  *DataSourceRef         `json:"datasource,omitempty"`
	Description *string                `json:"description,omitempty"`
	Error       map[string]interface{} `json:"error,omitempty"`
	Global      bool                   `json:"global"`
	Hide        VariableHide           `json:"hide"`
	Id          string                 `json:"id"`
	Index       int                    `json:"index"`
	Label       *string                `json:"label,omitempty"`
	Name        string                 `json:"name"`

	// TODO: Move this into a separated QueryVariableModel type
	Query        *interface{} `json:"query,omitempty"`
	RootStateKey *string      `json:"rootStateKey,omitempty"`
	SkipUrlSync  bool         `json:"skipUrlSync"`
	State        LoadingState `json:"state"`

	// FROM: packages/grafana-data/src/types/templateVars.ts
	// TODO docs
	// TODO this implies some wider pattern/discriminated union, probably?
	Type VariableType `json:"type"`
}

// FROM: packages/grafana-data/src/types/templateVars.ts
// TODO docs
// TODO this implies some wider pattern/discriminated union, probably?
type VariableType string
