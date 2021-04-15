import { DataFrame, FieldConfigSource, FieldDisplay, InterpolateFunction, ReduceDataOptions } from '@grafana/data';
import { GraphTooltipOptions } from '../Graph/GraphTooltip/types';
import { VizLegendOptions } from '..';

export interface PieChartSvgProps {
  height: number;
  width: number;
  fieldDisplayValues: FieldDisplay[];
  pieType: PieChartType;
  displayLabels?: PieChartLabels[];
  useGradients?: boolean;
  onSeriesColorChange?: (label: string, color: string) => void;
  tooltipOptions: GraphTooltipOptions;
}

export interface PieChartProps extends Omit<PieChartSvgProps, 'fieldDisplayValues'> {
  legendOptions?: PieChartLegendOptions;
  tooltipOptions: GraphTooltipOptions;
  reduceOptions: ReduceDataOptions;
  fieldConfig: FieldConfigSource<any>;
  replaceVariables: InterpolateFunction;
  data: DataFrame[];
  timeZone?: string;
}

export enum PieChartType {
  Pie = 'pie',
  Donut = 'donut',
}

export enum PieChartLegendValues {
  Value = 'value',
  Percent = 'percent',
}

export enum PieChartLabels {
  Name = 'name',
  Value = 'value',
  Percent = 'percent',
}

export interface PieChartLegendOptions extends VizLegendOptions {
  values: PieChartLegendValues[];
}
