import { map } from 'rxjs/operators';

import {
  DataFrame,
  DataFrameWithValue,
  DataTransformerID,
  DataTransformerInfo,
  Field,
  FieldType,
  MutableDataFrame,
  isTimeSeriesFrame,
} from '@grafana/data';

export enum ValueType {
  Last = 'last',
  Average = 'average',
  Median = 'median',
}

export interface TimeSeriesTableTransformerOptions {
  refIdToValueType?: Record<string, ValueType>;
}

export const timeSeriesTableTransformer: DataTransformerInfo<TimeSeriesTableTransformerOptions> = {
  id: DataTransformerID.timeSeriesTable,
  name: 'Time series to table transform',
  description: 'Time series to table rows.',
  defaultOptions: {},

  operator: (options) => (source) =>
    source.pipe(
      map((data) => {
        return timeSeriesToTableTransform(options, data);
      })
    ),
};

/**
 * Converts time series frames to table frames for use with sparkline chart type.
 *
 * @remarks
 * For each refId (queryName) convert all time series frames into a single table frame, adding each series
 * as values of a "Trend" frame field. This allows "Trend" to be rendered as area chart type.
 * Any non time series frames are returned as is.
 *
 * @param options - Transform options, currently not used
 * @param data - Array of data frames to transform
 * @returns Array of transformed data frames
 *
 * @alpha
 */
export function timeSeriesToTableTransform(options: TimeSeriesTableTransformerOptions, data: DataFrame[]): DataFrame[] {
  // initialize fields from labels for each refId
  const refId2LabelFields = getLabelFields(data);

  const refId2frameField: Record<string, Field<DataFrameWithValue>> = {};

  const result: DataFrame[] = [];

  for (const frame of data) {
    if (!isTimeSeriesFrame(frame)) {
      result.push(frame);
      continue;
    }

    const refId = frame.refId ?? '';

    const labelFields = refId2LabelFields[refId] ?? {};
    // initialize a new frame for this refId with fields per label and a Trend frame field, if it doesn't exist yet
    let frameField = refId2frameField[refId];
    if (!frameField) {
      frameField = {
        name: 'Trend' + (refId && Object.keys(refId2LabelFields).length > 1 ? ` #${refId}` : ''),
        type: FieldType.frame,
        config: {},
        values: [],
      };
      refId2frameField[refId] = frameField;

      const table = new MutableDataFrame();
      for (const label of Object.values(labelFields)) {
        table.addField(label);
      }
      table.addField(frameField);
      table.refId = refId;
      result.push(table);
    }

    // add values to each label based field of this frame
    const labels = frame.fields[1].labels;
    for (const labelKey of Object.keys(labelFields)) {
      const labelValue = labels?.[labelKey] ?? null;
      labelFields[labelKey].values.push(labelValue!);
    }
    frameField.values.push({
      ...frame,
      value: calculateFrameValue(frame, options.refIdToValueType?.[refId] ?? ValueType.Last),
    });
  }
  return result;
}

// For each refId, initialize a field for each label name
function getLabelFields(frames: DataFrame[]): Record<string, Record<string, Field<string>>> {
  // refId -> label name -> field
  const labelFields: Record<string, Record<string, Field<string>>> = {};

  for (const frame of frames) {
    if (!isTimeSeriesFrame(frame)) {
      continue;
    }

    const refId = frame.refId ?? '';

    if (!labelFields[refId]) {
      labelFields[refId] = {};
    }

    for (const field of frame.fields) {
      if (!field.labels) {
        continue;
      }

      for (const labelName of Object.keys(field.labels)) {
        if (!labelFields[refId][labelName]) {
          labelFields[refId][labelName] = {
            name: labelName,
            type: FieldType.string,
            config: {},
            values: [],
          };
        }
      }
    }
  }

  return labelFields;
}

function calculateFrameValue(frame: DataFrame, valueType: ValueType): number | null {
  const valueField = frame.fields.find((field) => field.type === FieldType.number);
  if (!valueField) {
    return null;
  }
  switch (valueType) {
    case ValueType.Last:
      return valueField.values[valueField.values.length - 1] ?? null;
    case ValueType.Average:
      const [sum, count] = valueField.values.reduce(
        ([sum, count], value) => {
          if (!Number.isNaN(value)) {
            return [sum + value, count + 1];
          }
          return [sum, count];
        },
        [0, 0]
      );
      return sum / count;
    case ValueType.Median:
      const sortedValues = valueField.values.filter((value) => !Number.isNaN(value)).sort((a, b) => a - b);
      if (sortedValues.length > 0) {
        if (sortedValues.length % 2 === 0) {
          return (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2;
        }
        const middleIndex = Math.floor(sortedValues.length / 2);
        return sortedValues[middleIndex];
      }
      return null;
  }
}
