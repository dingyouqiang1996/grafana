// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     public/app/plugins/gen.go
// Using jennies:
//     TSTypesJenny
//     LatestMajorsOrXJenny
//     PluginEachMajorJenny
//
// Run 'make gen-cue' from repository root to regenerate.

import * as common from '@grafana/schema';

export const pluginVersion = "10.2.0-pre";

export interface Options extends common.OptionsWithTimezones {
  exemplars: ExemplarConfig;
  legend: common.VizLegendOptions;
  tooltip: common.VizTooltipOptions;
}

export interface ExemplarConfig {
  labels: Array<string>;
}

export const defaultExemplarConfig: Partial<ExemplarConfig> = {
  labels: [],
};

export interface FieldConfig extends common.GraphFieldConfig {}
