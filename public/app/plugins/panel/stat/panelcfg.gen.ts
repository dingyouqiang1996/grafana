// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     public/app/plugins/gen.go
// Using jennies:
//     TSTypesJenny
//     PluginTSTypesJenny
//
// Run 'make gen-cue' from repository root to regenerate.

import * as common from '@grafana/schema';

export const PanelCfgModelVersion = Object.freeze([0, 0]);

export interface PanelOptions extends common.SingleStatBaseOptions {
  colorMode: common.BigValueColorMode;
  /**
   * The first matching test will be used to override display values
   * TORN if this should be panel or field config... field config conceptually better, but:
   * an panel config we get:
   * - more efficient setup/execution with multiple fields
   * - nested options are suported for panels (not yet for fields)
   */
  conditions?: Array<ConditionalDisplay>;
  graphMode: common.BigValueGraphMode;
  justifyMode: common.BigValueJustifyMode;
  textMode: common.BigValueTextMode;
}

export const defaultPanelOptions: Partial<PanelOptions> = {
  colorMode: common.BigValueColorMode.Value,
  conditions: [],
  graphMode: common.BigValueGraphMode.Area,
  justifyMode: common.BigValueJustifyMode.Auto,
  textMode: common.BigValueTextMode.Auto,
};

export interface ConditionalDisplay {
  display: CustomDisplayValue;
  test: ConditionTest;
}

export enum ConditionTestMode {
  Field = 'field',
  True = 'true',
  Value = 'value',
}

/**
 * Check if the condition should be used
 */
export interface ConditionTest {
  field?: string;
  mode: ConditionTestMode;
  op: common.ComparisonOperation;
  reducer?: string;
  value?: (number | string | boolean);
}

export const defaultConditionTest: Partial<ConditionTest> = {
  mode: ConditionTestMode.Value,
};

/**
 * Optionally the calculated DisplayValue
 */
export interface CustomDisplayValue {
  color?: string;
  prefix?: string;
  suffix?: string;
  text?: string;
}
