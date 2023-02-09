import React, { FC, FormEvent, useEffect, useState } from 'react';

import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, Select, TextArea } from '@grafana/ui';

import { PrometheusDatasource } from '../datasource';
import {
  migrateVariableEditorBackToVariableSupport,
  migrateVariableQueryToEditor,
} from '../migrations/variableMigration';
import { PromOptions, PromQuery, PromVariableQuery, PromVariableQueryType as QueryType } from '../types';

export const variableOptions = [
  { label: 'Label names', value: QueryType.LabelNames },
  { label: 'Label values', value: QueryType.LabelValues },
  { label: 'Metrics', value: QueryType.MetricNames },
  { label: 'Query result', value: QueryType.VarQueryResult },
  { label: 'Series query', value: QueryType.SeriesQuery },
];

export type Props = QueryEditorProps<PrometheusDatasource, PromQuery, PromOptions, PromVariableQuery>;

const refId = 'PrometheusVariableQueryEditor-VariableQuery';

export const PromVariableQueryEditor: FC<Props> = ({ onChange, query, datasource }) => {
  // to select the type of function, i.e. label_names, label_values, etc.
  const [exprType, setExprType] = useState<number | undefined>(undefined);

  // list of variables for each function
  const [label, setLabel] = useState('');
  // metric is used for both label_values() and metric()
  // label_values() metric requires a whole/complete metric
  // metric() is expected to be a part of a metric string
  const [metric, setMetric] = useState('');
  // varQuery is a whole query, can include math/rates/etc
  const [varQuery, setVarQuery] = useState('');
  // seriesQuery is only a whole
  const [seriesQuery, setSeriesQuery] = useState('');

  // list of label names for label_values(), /api/v1/labels, contains the same results as label_names() function
  const [labelOptions, setLabelOptions] = useState<Array<SelectableValue<string>>>([]);

  useEffect(() => {
    if (!query) {
      return;
    }
    // Changing from standard to custom variable editor changes the string attr from expr to query
    const variableQuery = query.query ? migrateVariableQueryToEditor(query.query) : query;

    setExprType(variableQuery.exprType);
    setLabel(variableQuery.label ?? '');
    setMetric(variableQuery.metric ?? '');
    setVarQuery(variableQuery.varQuery ?? '');
    setSeriesQuery(variableQuery.seriesQuery ?? '');

    // set the migrated label in the label options
    if (variableQuery.label) {
      setLabelOptions([{ label: variableQuery.label, value: variableQuery.label }]);
    }
  }, [query]);

  // set the label names options for the label values var query
  useEffect(() => {
    if (exprType !== QueryType.LabelValues) {
      return;
    }

    datasource.getLabelNames().then((labelNames: Array<{ text: string }>) => {
      setLabelOptions(labelNames.map(({ text }) => ({ label: text, value: text })));
    });
  }, [datasource, exprType]);

  const onChangeWithVariableString = (exprType: QueryType) => {
    const queryVar = {
      exprType: exprType,
      label,
      metric,
      varQuery,
      seriesQuery,
      refId: 'PrometheusVariableQueryEditor-VariableQuery',
    };

    const queryString = migrateVariableEditorBackToVariableSupport(queryVar);

    onChange({
      query: queryString,
      refId,
    });
  };

  const onQueryTypeChange = (newType: SelectableValue<QueryType>) => {
    setExprType(newType.value);
    if (newType.value === QueryType.LabelNames) {
      onChangeWithVariableString(newType.value);
    }
  };

  const onLabelChange = (newLabel: SelectableValue<string>) => {
    setLabel(newLabel.value ?? '');
  };

  const onMetricChange = (e: FormEvent<HTMLInputElement>) => {
    setMetric(e.currentTarget.value);
  };

  const onVarQueryChange = (e: FormEvent<HTMLTextAreaElement>) => {
    setVarQuery(e.currentTarget.value);
  };

  const onSeriesQueryChange = (e: FormEvent<HTMLInputElement>) => {
    setSeriesQuery(e.currentTarget.value);
  };

  const handleBlur = () => {
    if (exprType === QueryType.LabelNames) {
      onChangeWithVariableString(exprType);
    } else if (exprType === QueryType.LabelValues && label) {
      onChangeWithVariableString(exprType);
    } else if (exprType === QueryType.MetricNames && metric) {
      onChangeWithVariableString(exprType);
    } else if (exprType === QueryType.VarQueryResult && varQuery) {
      onChangeWithVariableString(exprType);
    } else if (exprType === QueryType.SeriesQuery && seriesQuery) {
      onChangeWithVariableString(exprType);
    }
  };

  return (
    <InlineFieldRow>
      <InlineField
        label="Function type"
        labelWidth={20}
        tooltip={<div>The Prometheus data source plugin provides the following functions for querying variables.</div>}
      >
        <Select
          placeholder="Select function"
          aria-label="Function type"
          onChange={onQueryTypeChange}
          onBlur={handleBlur}
          value={exprType}
          options={variableOptions}
          width={25}
        />
      </InlineField>
      {exprType === QueryType.LabelValues && (
        <>
          <InlineField
            label="Label"
            labelWidth={20}
            required
            tooltip={
              <div>
                Returns a list of label values for the label name in all metrics unless the metric is specified.
              </div>
            }
          >
            <Select
              aria-label="label-select"
              onChange={onLabelChange}
              onBlur={handleBlur}
              value={label}
              options={labelOptions}
              width={25}
              allowCustomValue
            />
          </InlineField>
          <InlineField
            label="Metric"
            labelWidth={20}
            tooltip={<div>*Optional: returns a list of label values for the label name in the specified metric.</div>}
          >
            <Input
              type="text"
              aria-label="Metric selector"
              placeholder="Optional metric selector"
              value={metric}
              onChange={onMetricChange}
              onBlur={handleBlur}
              width={25}
            />
          </InlineField>
        </>
      )}
      {exprType === QueryType.MetricNames && (
        <>
          <InlineField
            label="Metric Regex"
            labelWidth={20}
            tooltip={<div>Returns a list of metrics matching the specified metric regex.</div>}
          >
            <Input
              type="text"
              aria-label="Metric selector"
              placeholder="Metric Regex"
              value={metric}
              onChange={onMetricChange}
              onBlur={handleBlur}
              width={25}
            />
          </InlineField>
        </>
      )}
      {exprType === QueryType.VarQueryResult && (
        <>
          <InlineField
            label="Query Result"
            labelWidth={20}
            tooltip={
              <div>
                Returns a list of Prometheus query results for the query. This can include Prometheus functions.
              </div>
            }
          >
            <TextArea
              type="text"
              aria-label="Prometheus Query"
              placeholder="Prometheus Query"
              value={varQuery}
              onChange={onVarQueryChange}
              onBlur={handleBlur}
              cols={100}
            />
          </InlineField>
        </>
      )}
      {exprType === QueryType.SeriesQuery && (
        <>
          <InlineField
            label="Series Query"
            labelWidth={20}
            tooltip={
              <div>
                Enter enter a metric with labels, only a metric or only labels, i.e.
                go_goroutines&#123;instance=&quot;localhost:9090&quot;&#125;, go_goroutines, or
                &#123;instance=&quot;localhost:9090&quot;&#125;. Returns a list of time series associated with the
                entered data.
              </div>
            }
          >
            <Input
              type="text"
              aria-label="Series Query"
              placeholder="Series Query"
              value={seriesQuery}
              onChange={onSeriesQueryChange}
              onBlur={handleBlur}
              width={100}
            />
          </InlineField>
        </>
      )}
    </InlineFieldRow>
  );
};
