// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     public/app/plugins/gen.go
// Using jennies:
//     TSTypesJenny
//     PluginTsTypesJenny
//
// Run 'make gen-cue' from repository root to regenerate.

import * as common from '@grafana/schema';

export const pluginVersion = "11.1.1";

/**
 * Auto is "table" in the UI
 */
export enum SeriesMapping {
  Auto = 'auto',
  Manual = 'manual',
}

export enum ScatterShow {
  Lines = 'lines',
  Points = 'points',
  PointsAndLines = 'points+lines',
}

/**
 * Configuration for the Table/Auto mode
 */
export interface XYDimensionConfig {
  exclude?: Array<string>;
  frame: number;
  x?: string;
}

export const defaultXYDimensionConfig: Partial<XYDimensionConfig> = {
  exclude: [],
};

export interface FieldConfig extends common.HideableFieldConfig, common.AxisConfig {
  label?: common.VisibilityMode;
  labelValue?: common.TextDimensionConfig;
  lineColor?: common.ColorDimensionConfig;
  lineStyle?: common.LineStyle;
  lineWidth?: number;
  pointColor?: common.ColorDimensionConfig;
  pointSize?: common.ScaleDimensionConfig;
  show?: ScatterShow;
}

export const defaultFieldConfig: Partial<FieldConfig> = {
  label: common.VisibilityMode.Auto,
  show: ScatterShow.Points,
};

export interface ScatterSeriesConfig extends FieldConfig {
  frame?: number;
  name?: string;
  x?: string;
  y?: string;
}

export interface Options extends common.OptionsWithLegend, common.OptionsWithTooltip {
  /**
   * Table Mode (auto)
   */
  dims: XYDimensionConfig;
  /**
   * Manual Mode
   */
  series: Array<ScatterSeriesConfig>;
  seriesMapping?: SeriesMapping;
}

export const defaultOptions: Partial<Options> = {
  series: [],
};
