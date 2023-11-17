import { DataFrame, Field, FieldType, formattedValueToString, getFieldDisplayName } from '@grafana/data';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { DisplayValue } from 'app/features/visualization/data-hover/DataHoverView';

import { HeatmapData } from '../fields';

enum SparseDataFieldNames {
  y = 'y',
  yMin = 'yMin',
  yMax = 'yMax',
  x = 'x',
  xMin = 'xMin',
  xMax = 'xMax',
  count = 'count',
  yLayout = 'yLayout',
  xLayout = 'xLayout',
}

type BucketSizes = {
  xBucketCount: number;
  yBucketCount: number;
  xBucketSize: number;
  yBucketSize: number;
};

type BucketsMinMax = {
  xBucketMin: number;
  xBucketMax: number;
  yBucketMin: string;
  yBucketMax: string;
};

export const xDisp = (v: number, xField?: Field) => {
  if (xField?.display) {
    return formattedValueToString(xField.display(v));
  }

  if (xField?.type === FieldType.time) {
    const tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    const dashboard = getDashboardSrv().getCurrent();
    return dashboard?.formatDate(v, tooltipTimeFormat);
  }

  return `${v}`;
};

export const getHoverCellColor = (data: HeatmapData, index: number) => {
  const colorPalette = data.heatmapColors?.palette!;
  const colorIndex = data.heatmapColors?.values[index];

  let cellColor: string | undefined = undefined;

  if (colorIndex != null) {
    cellColor = colorPalette[colorIndex];
  }

  return { cellColor, colorPalette };
};

const conversions: Record<string, number> = {
  year: 1000 * 60 * 60 * 24 * 365,
  month: 1000 * 60 * 60 * 24 * 30,
  week: 1000 * 60 * 60 * 24 * 7,
  day: 1000 * 60 * 60 * 24,
  hour: 1000 * 60 * 60,
  minute: 1000 * 60,
  second: 1000,
  millisecond: 1,
};

// @TODO: display "~ 1 year/month"?
export const formatMilliseconds = (milliseconds: number) => {
  let value = 1;
  let unit = 'millisecond';

  for (unit in conversions) {
    if (milliseconds >= conversions[unit]) {
      value = Math.floor(milliseconds / conversions[unit]);
      break;
    }
  }

  const unitString = value === 1 ? unit : unit + 's';

  return `${value} ${unitString}`;
};

// logic from DataHoverView
const parseSparseData = (data?: DataFrame, rowIndex?: number | null, columnIndex?: number | null) => {
  if (!data || rowIndex == null) {
    return null;
  }

  const fields = data.fields.map((f, idx) => {
    return { ...f, hovered: idx === columnIndex };
  });

  const visibleFields = fields.filter((f) => !Boolean(f.config.custom?.hideFrom?.tooltip));
  const traceIDField = visibleFields.find((field) => field.name === 'traceID') || fields[0];
  const orderedVisibleFields = [];
  // Only include traceID if it's visible and put it in front.
  if (visibleFields.filter((field) => traceIDField === field).length > 0) {
    orderedVisibleFields.push(traceIDField);
  }
  orderedVisibleFields.push(...visibleFields.filter((field) => traceIDField !== field));

  if (orderedVisibleFields.length === 0) {
    return null;
  }

  const displayValues: DisplayValue[] = [];

  for (const field of orderedVisibleFields) {
    const value = field.values[rowIndex];
    const fieldDisplay = field.display ? field.display(value) : { text: `${value}`, numeric: +value };

    // Sanitize field by removing hovered property to fix unique display name issue
    const { hovered, ...sanitizedField } = field;

    displayValues.push({
      name: getFieldDisplayName(sanitizedField, data),
      fieldName: sanitizedField.name,
      value,
      valueString: formattedValueToString(fieldDisplay),
      highlight: field.hovered,
    });
  }

  return displayValues;
};

const getInterval = (fieldValues: any[]) => {
  const firstValue = fieldValues[0];

  for (let i = 1; i < fieldValues.length; i++) {
    if (fieldValues[i] !== firstValue) {
      return fieldValues[i] - firstValue;
    }
  }

  return 0;
};

export const getFieldFromData = (data: DataFrame, fieldType: string, isSparse: boolean) => {
  let field: Field | undefined;

  switch (fieldType) {
    case 'x':
      field = isSparse ? data?.fields.find((field) => ['x', 'xMin', 'xMax'].includes(field.name)) : data?.fields[0];
      break;
    case 'y':
      field = isSparse ? data?.fields.find((field) => ['y', 'yMin', 'yMax'].includes(field.name)) : data?.fields[1];
      break;
    case 'count':
      field = isSparse ? data?.fields.find((field) => field.name === 'count') : data?.fields[2];
      break;
  }

  return field;
};

// logic copied from public/app/plugins/panel/heatmap/fields.ts#L309
// renamed vars to match ^
const inferSparseDataBucketSizes = (data: HeatmapData, xs: any[], ys: any[]): BucketSizes => {
  const dlen = xs.length;

  const yBinQty = data.yBucketCount ?? dlen - ys.lastIndexOf(ys[0]);
  const xBinQty = data.xBucketCount ?? dlen / yBinQty;
  const yBinIncr = data.yBucketSize ?? ys[1] - ys[0];
  const xBinIncr = data.xBucketSize ?? getInterval(xs);

  return {
    xBucketCount: xBinQty,
    yBucketCount: yBinQty,
    xBucketSize: xBinIncr,
    yBucketSize: yBinIncr,
  };
};

export const calculateSparseBucketMinMax = (
  data: HeatmapData,
  xVals: any[],
  yVals: any[],
  index: number
): BucketsMinMax => {
  const displayValues = parseSparseData(data.heatmap!, index);

  const { xBucketSize, yBucketCount, yBucketSize } = inferSparseDataBucketSizes(data, xVals, yVals);
  const yValueIndex = index % yBucketCount ?? 0;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let xBucketMin: number = displayValues?.find((displayValue) => displayValue.fieldName === SparseDataFieldNames.xMin)
    ?.value as number;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let xBucketMax: number = displayValues?.find((displayValue) => displayValue.fieldName === SparseDataFieldNames.xMax)
    ?.value as number;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let yBucketMin: string = displayValues?.find((displayValue) => displayValue.fieldName === SparseDataFieldNames.yMin)
    ?.value as string;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let yBucketMax: string = displayValues?.find((displayValue) => displayValue.fieldName === SparseDataFieldNames.yMax)
    ?.value as string;

  const fieldNames = ['xMin', 'xMax', 'yMin', 'yMax'];
  const missing = fieldNames.filter(
    (fieldName) => !displayValues?.some((displayValue) => displayValue.fieldName === fieldName)
  );

  missing.map((fieldName) => {
    if (fieldName === SparseDataFieldNames.xMin) {
      xBucketMin = xVals?.[index];
      xBucketMax = xBucketMin + xBucketSize;
    } else if (fieldName === SparseDataFieldNames.xMax) {
      xBucketMax = xVals?.[index];
      xBucketMin = xBucketMax - xBucketSize;
    } else if (fieldName === SparseDataFieldNames.yMin || SparseDataFieldNames.yMax) {
      yBucketMin = yVals?.[yValueIndex];
      yBucketMax = yBucketMin + yBucketSize;
    }
  });

  return { xBucketMin, xBucketMax, yBucketMin, yBucketMax };
};
