// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     CommonSchemaJenny
//
// Run 'make gen-cue' from repository root to regenerate.


/**
 * TODO docs
 */
export interface DataSourceJsonData {
  alertmanagerUid?: string;
  authType?: string;
  defaultRegion?: string;
  manageAlerts?: boolean;
  profile?: string;
}

/**
 * These are the common properties available to all queries in all datasources.
 * Specific implementations will *extend* this interface, adding the required
 * properties for the given context.
 */
export interface DataQuery {
  /**
   * For mixed data sources the selected datasource is on the query level.
   * For non mixed scenarios this is undefined.
   * TODO find a better way to do this ^ that's friendly to schema
   * TODO this shouldn't be unknown but DataSourceRef | null
   */
  datasource?: unknown;
  /**
   * true if query is disabled (ie should not be returned to the dashboard)
   */
  hide?: boolean;
  /**
   * Unique, guid like, string used in explore mode
   */
  key?: string;
  /**
   * Specify the query flavor
   * TODO make this required and give it a default
   */
  queryType?: string;
  /**
   * A - Z
   */
  refId: string;
}

export interface BaseDimensionConfig {
  field?: string;
  fixed: (string | number);
}

export interface ScaleDimensionConfig extends BaseDimensionConfig {
  max: number;
  min: number;
}

/**
 * This is actually an empty interface used mainly for naming?
 */
export interface ColorDimensionConfig extends BaseDimensionConfig {}

export enum TextDimensionMode {
  Field = 'field',
  Fixed = 'fixed',
  Template = 'template',
}

export interface MapLayerOptions {
  /**
   * Custom options depending on the type
   */
  config?: unknown;
  /**
   * Defines a frame MatcherConfig that may filter data for the given layer
   */
  filterData?: unknown;
  /**
   * Common method to define geometry fields
   */
  location?: FrameGeometrySource;
  /**
   * configured unique display name
   */
  name: string;
  /**
   * Common properties:
   * https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html
   * Layer opacity (0-1)
   */
  opacity?: number;
  /**
   * Check tooltip (defaults to true)
   */
  tooltip?: boolean;
  type: string;
}

export enum FrameGeometrySourceMode {
  Auto = 'auto',
  Coords = 'coords',
  Geohash = 'geohash',
  Lookup = 'lookup',
}

export enum LogsSortOrder {
  Ascending = 'Ascending',
  Descending = 'Descending',
}

/**
 * TODO docs
 */
export enum AxisPlacement {
  Auto = 'auto',
  Bottom = 'bottom',
  Hidden = 'hidden',
  Left = 'left',
  Right = 'right',
  Top = 'top',
}

/**
 * TODO docs
 */
export enum AxisColorMode {
  Series = 'series',
  Text = 'text',
}

/**
 * TODO docs
 */
export enum VisibilityMode {
  Always = 'always',
  Auto = 'auto',
  Never = 'never',
}

/**
 * TODO docs
 */
export enum GraphDrawStyle {
  Bars = 'bars',
  Line = 'line',
  Points = 'points',
}

/**
 * TODO docs
 */
export enum GraphTransform {
  Constant = 'constant',
  NegativeY = 'negative-Y',
}

/**
 * TODO docs
 */
export enum LineInterpolation {
  Linear = 'linear',
  Smooth = 'smooth',
  StepAfter = 'stepAfter',
  StepBefore = 'stepBefore',
}

/**
 * TODO docs
 */
export enum ScaleDistribution {
  Linear = 'linear',
  Log = 'log',
  Ordinal = 'ordinal',
  Symlog = 'symlog',
}

/**
 * TODO docs
 */
export enum GraphGradientMode {
  Hue = 'hue',
  None = 'none',
  Opacity = 'opacity',
  Scheme = 'scheme',
}

/**
 * TODO docs
 */
export enum StackingMode {
  None = 'none',
  Normal = 'normal',
  Percent = 'percent',
}

/**
 * TODO docs
 */
export enum BarAlignment {
  After = 1,
  Before = -1,
  Center = 0,
}

/**
 * TODO docs
 */
export enum ScaleOrientation {
  Horizontal = 0,
  Vertical = 1,
}

/**
 * TODO docs
 */
export enum ScaleDirection {
  Down = -1,
  Left = -1,
  Right = 1,
  Up = 1,
}

/**
 * TODO docs
 */
export interface LineStyle {
  dash?: Array<number>;
  fill?: ('solid' | 'dash' | 'dot' | 'square');
}

export const defaultLineStyle: Partial<LineStyle> = {
  dash: [],
};

/**
 * TODO docs
 */
export interface LineConfig {
  lineColor?: string;
  lineInterpolation?: LineInterpolation;
  lineStyle?: LineStyle;
  lineWidth?: number;
  /**
   * Indicate if null values should be treated as gaps or connected.
   * When the value is a number, it represents the maximum delta in the
   * X axis that should be considered connected.  For timeseries, this is milliseconds
   */
  spanNulls?: (boolean | number);
}

/**
 * TODO docs
 */
export interface BarConfig {
  barAlignment?: BarAlignment;
  barMaxWidth?: number;
  barWidthFactor?: number;
}

/**
 * TODO docs
 */
export interface FillConfig {
  fillBelowTo?: string;
  fillColor?: string;
  fillOpacity?: number;
}

/**
 * TODO docs
 */
export interface PointsConfig {
  pointColor?: string;
  pointSize?: number;
  pointSymbol?: string;
  showPoints?: VisibilityMode;
}

/**
 * TODO docs
 */
export interface ScaleDistributionConfig {
  linearThreshold?: number;
  log?: number;
  type: ScaleDistribution;
}

/**
 * TODO docs
 */
export interface AxisConfig {
  axisCenteredZero?: boolean;
  axisColorMode?: AxisColorMode;
  axisGridShow?: boolean;
  axisLabel?: string;
  axisPlacement?: AxisPlacement;
  axisSoftMax?: number;
  axisSoftMin?: number;
  axisWidth?: number;
  scaleDistribution?: ScaleDistributionConfig;
}

/**
 * TODO docs
 */
export interface HideSeriesConfig {
  legend: boolean;
  tooltip: boolean;
  viz: boolean;
}

/**
 * TODO docs
 */
export interface StackingConfig {
  group?: string;
  mode?: StackingMode;
}

/**
 * TODO docs
 */
export interface StackableFieldConfig {
  stacking?: StackingConfig;
}

/**
 * TODO docs
 */
export interface HideableFieldConfig {
  hideFrom?: HideSeriesConfig;
}

/**
 * TODO docs
 */
export enum GraphTresholdsStyleMode {
  Area = 'area',
  Dashed = 'dashed',
  DashedAndArea = 'dashed+area',
  Line = 'line',
  LineAndArea = 'line+area',
  Off = 'off',
  Series = 'series',
}

/**
 * TODO docs
 */
export interface GraphThresholdsStyleConfig {
  mode: GraphTresholdsStyleMode;
}

/**
 * TODO docs
 */
export type LegendPlacement = ('bottom' | 'right');

/**
 * TODO docs
 * Note: "hidden" needs to remain as an option for plugins compatibility
 */
export enum LegendDisplayMode {
  Hidden = 'hidden',
  List = 'list',
  Table = 'table',
}

/**
 * TODO docs
 */
export interface SingleStatBaseOptions extends OptionsWithTextFormatting {
  orientation: VizOrientation;
  reduceOptions: ReduceDataOptions;
}

/**
 * TODO docs
 */
export interface ReduceDataOptions {
  /**
   * When !values, pick one value for the whole field
   */
  calcs: Array<string>;
  /**
   * Which fields to show.  By default this is only numeric fields
   */
  fields?: string;
  /**
   * if showing all values limit
   */
  limit?: number;
  /**
   * If true show each row value
   */
  values?: boolean;
}

export const defaultReduceDataOptions: Partial<ReduceDataOptions> = {
  calcs: [],
};

/**
 * TODO docs
 */
export enum VizOrientation {
  Auto = 'auto',
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/**
 * TODO docs
 */
export interface OptionsWithTooltip {
  tooltip: VizTooltipOptions;
}

/**
 * TODO docs
 */
export interface OptionsWithLegend {
  legend: VizLegendOptions;
}

/**
 * TODO docs
 */
export interface OptionsWithTimezones {
  timezone?: Array<TimeZone>;
}

export const defaultOptionsWithTimezones: Partial<OptionsWithTimezones> = {
  timezone: [],
};

/**
 * TODO docs
 */
export interface OptionsWithTextFormatting {
  text?: VizTextDisplayOptions;
}

/**
 * TODO docs
 */
export enum BigValueColorMode {
  Background = 'background',
  None = 'none',
  Value = 'value',
}

/**
 * TODO docs
 */
export enum BigValueGraphMode {
  Area = 'area',
  Line = 'line',
  None = 'none',
}

/**
 * TODO docs
 */
export enum BigValueJustifyMode {
  Auto = 'auto',
  Center = 'center',
}

/**
 * TODO docs
 */
export enum BigValueTextMode {
  Auto = 'auto',
  Name = 'name',
  None = 'none',
  Value = 'value',
  ValueAndName = 'value_and_name',
}

/**
 * TODO -- should not be table specific!
 * TODO docs
 */
export type FieldTextAlignment = ('auto' | 'left' | 'right' | 'center');

/**
 * Controls the value alignment in the TimelineChart component
 */
export type TimelineValueAlignment = ('center' | 'left' | 'right');

/**
 * TODO docs
 */
export interface VizTextDisplayOptions {
  /**
   * Explicit title text size
   */
  titleSize?: number;
  /**
   * Explicit value text size
   */
  valueSize?: number;
}

/**
 * TODO docs
 */
export enum TooltipDisplayMode {
  Multi = 'multi',
  None = 'none',
  Single = 'single',
}

/**
 * TODO docs
 */
export enum SortOrder {
  Ascending = 'asc',
  Descending = 'desc',
  None = 'none',
}

/**
 * TODO docs
 */
export interface GraphFieldConfig extends LineConfig, FillConfig, PointsConfig, AxisConfig, BarConfig, StackableFieldConfig, HideableFieldConfig {
  drawStyle?: GraphDrawStyle;
  gradientMode?: GraphGradientMode;
  thresholdsStyle?: GraphThresholdsStyleConfig;
  transform?: GraphTransform;
}

/**
 * TODO docs
 */
export interface VizLegendOptions {
  asTable?: boolean;
  calcs: Array<string>;
  displayMode: LegendDisplayMode;
  isVisible?: boolean;
  placement: LegendPlacement;
  showLegend: boolean;
  sortBy?: string;
  sortDesc?: boolean;
  width?: number;
}

export const defaultVizLegendOptions: Partial<VizLegendOptions> = {
  calcs: [],
};

/**
 * Enum expressing the possible display modes
 * for the bar gauge component of Grafana UI
 */
export enum BarGaugeDisplayMode {
  Basic = 'basic',
  Gradient = 'gradient',
  Lcd = 'lcd',
}

/**
 * TODO docs
 */
export interface VizTooltipOptions {
  mode: TooltipDisplayMode;
  sort: SortOrder;
}

/**
 * Internally, this is the "type" of cell that's being displayed
 * in the table such as colored text, JSON, gauge, etc.
 * The color-background-solid, gradient-gauge, and lcd-gauge
 * modes are deprecated in favor of new cell subOptions
 */
export enum TableCellDisplayMode {
  Auto = 'auto',
  BasicGauge = 'basic',
  ColorBackground = 'color-background',
  ColorBackgroundSolid = 'color-background-solid',
  ColorText = 'color-text',
  Gauge = 'gauge',
  GradientGauge = 'gradient-gauge',
  Image = 'image',
  JSONView = 'json-view',
  LcdGauge = 'lcd-gauge',
}

/**
 * Display mode to the "Colored Background" display
 * mode for table cells. Either displays a solid color (basic mode)
 * or a gradient.
 */
export enum TableCellBackgroundDisplayMode {
  Basic = 'basic',
  Gradient = 'gradient',
}

/**
 * Sort by field state
 */
export interface TableSortByFieldState {
  desc?: boolean;
  displayName: string;
}

/**
 * Footer options
 */
export interface TableFooterOptions {
  countRows?: boolean;
  enablePagination?: boolean;
  fields?: Array<string>;
  reducer: Array<string>;
  show: boolean;
}

export const defaultTableFooterOptions: Partial<TableFooterOptions> = {
  fields: [],
  reducer: [],
};

/**
 * Auto mode table cell options
 */
export interface TableAutoCellOptions {
  type: TableCellDisplayMode.Auto;
}

/**
 * Colored text cell options
 */
export interface TableColorTextCellOptions {
  type: TableCellDisplayMode.ColorText;
}

/**
 * Json view cell options
 */
export interface TableJsonViewCellOptions {
  type: TableCellDisplayMode.JSONView;
}

/**
 * Json view cell options
 */
export interface TableImageCellOptions {
  type: TableCellDisplayMode.Image;
}

/**
 * Gauge cell options
 */
export interface TableBarGaugeCellOptions {
  mode?: BarGaugeDisplayMode;
  type: TableCellDisplayMode.Gauge;
}

/**
 * Colored background cell options
 */
export interface TableColoredBackgroundCellOptions {
  mode?: TableCellBackgroundDisplayMode;
  type: TableCellDisplayMode.ColorBackground;
}

/**
 * Table cell options. Each cell has a display mode
 * and other potential options for that display.
 */
export type TableCellOptions = (TableAutoCellOptions | TableBarGaugeCellOptions | TableColoredBackgroundCellOptions | TableColorTextCellOptions | TableImageCellOptions | TableJsonViewCellOptions);

/**
 * Use UTC/GMT timezone
 */
export type TimeZoneUtc = 'utc';

/**
 * Use the timezone defined by end user web browser
 */
export type TimeZoneBrowser = 'browser';

export interface DataSourceRef {
  /**
   * The plugin type-id
   */
  type?: string;
  /**
   * Specific datasource instance
   */
  uid?: string;
}

export interface TextDimensionConfig extends BaseDimensionConfig {
  mode: TextDimensionMode;
}

export interface FrameGeometrySource {
  /**
   * Path to Gazetteer
   */
  gazetteer?: string;
  /**
   * Field mappings
   */
  geohash?: string;
  latitude?: string;
  longitude?: string;
  lookup?: string;
  mode: FrameGeometrySourceMode;
  wkt?: string;
}

export enum LogsDedupStrategy {
  exact = 'exact',
  none = 'none',
  numbers = 'numbers',
  signature = 'signature',
}

export interface Labels {}

/**
 * Field options for each field within a table (e.g 10, "The String", 64.20, etc.)
 * Generally defines alignment, filtering capabilties, display options, etc.
 */
export interface TableFieldOptions {
  align: FieldTextAlignment;
  cellOptions: TableCellOptions;
  /**
   * This field is deprecated in favor of using cellOptions
   */
  displayMode?: TableCellDisplayMode;
  filterable?: boolean;
  hidden?: boolean;
  inspect: boolean;
  minWidth?: number;
  width?: number;
}

export const defaultTableFieldOptions: Partial<TableFieldOptions> = {
  align: 'auto',
  inspect: false,
};

/**
 * A specific timezone from https://en.wikipedia.org/wiki/Tz_database
 */
export type TimeZone = (TimeZoneUtc | TimeZoneBrowser | string);

export const defaultTimeZone: TimeZone = 'browser';
