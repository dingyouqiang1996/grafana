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

export const pluginVersion = "11.0.3";

export interface Options {
  dedupStrategy: common.LogsDedupStrategy;
  enableLogDetails: boolean;
  prettifyLogMessage: boolean;
  showCommonLabels: boolean;
  showLabels: boolean;
  showLogContextToggle: boolean;
  showTime: boolean;
  sortOrder: common.LogsSortOrder;
  wrapLogMessage: boolean;
}
