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

import * as ui from '@grafana/schema';

export const pluginVersion = "10.1.8";

export interface Options {
  /**
   * Controls the height of the rows
   */
  cellHeight?: ui.TableCellHeight;
  /**
   * Controls footer options
   */
  footer?: ui.TableFooterOptions;
  /**
   * Represents the index of the selected frame
   */
  frameIndex: number;
  /**
   * Controls whether the panel should show the header
   */
  showHeader: boolean;
  /**
   * Controls whether the header should show icons for the column types
   */
  showTypeIcons?: boolean;
  /**
   * Used to control row sorting
   */
  sortBy?: Array<ui.TableSortByFieldState>;
}

export const defaultOptions: Partial<Options> = {
  cellHeight: ui.TableCellHeight.Sm,
  footer: {
    /**
     * Controls whether the footer should be shown
     */
    show: false,
    /**
     * Controls whether the footer should show the total number of rows on Count calculation
     */
    countRows: false,
    /**
     * Represents the selected calculations
     */
    reducer: [],
  },
  frameIndex: 0,
  showHeader: true,
  showTypeIcons: false,
  sortBy: [],
};
