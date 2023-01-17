// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     public/app/plugins/gen.go
// Using jennies:
//     TSTypesJenny
//     PluginTSTypesJenny
//
// Run 'make gen-cue' from repository root to regenerate.

import * as ui from '@grafana/schema';

export const PanelModelVersion = Object.freeze([0, 0]);

export interface PanelOptions extends ui.OptionsWithLegend, ui.OptionsWithTooltip, ui.OptionsWithTimezones {
  /**
   * Controls the column width
   */
  colWidth?: number;
  /**
   * Controls the row height
   */
  rowHeight: number;
  /**
   * Show values on the columns
   */
  showValue: ui.VisibilityMode;
}

export const defaultPanelOptions: Partial<PanelOptions> = {
  colWidth: 0.9,
  rowHeight: 0.9,
  showValue: ui.VisibilityMode.Auto,
};

export interface PanelFieldConfig extends ui.HideableFieldConfig {
  fillOpacity?: number;
  lineWidth?: number;
}

export const defaultPanelFieldConfig: Partial<PanelFieldConfig> = {
  fillOpacity: 70,
  lineWidth: 1,
};
