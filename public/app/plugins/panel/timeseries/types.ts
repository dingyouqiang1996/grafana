import { OptionsWithGridLines, OptionsWithLegend, OptionsWithTooltip } from '@grafana/schema';

export interface TimeSeriesOptions extends OptionsWithLegend, OptionsWithTooltip, OptionsWithGridLines {}
