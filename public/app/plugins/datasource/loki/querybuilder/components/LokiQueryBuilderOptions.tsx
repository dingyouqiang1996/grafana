import React from 'react';
import { EditorRow, EditorField } from '@grafana/experimental';
import { SelectableValue } from '@grafana/data';
import { RadioButtonGroup, Select } from '@grafana/ui';
import { LokiQuery, LokiQueryType } from '../../types';
import { QueryOptionGroup } from 'app/plugins/datasource/prometheus/querybuilder/shared/QueryOptionGroup';
import { preprocessMaxLines, queryTypeOptions, RESOLUTION_OPTIONS } from '../../components/LokiOptionFields';
import { getLegendModeLabel } from 'app/plugins/datasource/prometheus/querybuilder/components/PromQueryLegendEditor';
import { AutoSizeInput } from 'app/plugins/datasource/prometheus/querybuilder/shared/AutoSizeInput';

export interface Props {
  query: LokiQuery;
  onChange: (update: LokiQuery) => void;
  onRunQuery: () => void;
}

export const LokiQueryBuilderOptions = React.memo<Props>(({ query, onChange, onRunQuery }) => {
  const onQueryTypeChange = (value: LokiQueryType) => {
    onChange({ ...query, queryType: value });
    onRunQuery();
  };

  const onResolutionChange = (option: SelectableValue<number>) => {
    onChange({ ...query, resolution: option.value });
  };

  const onLegendFormatChanged = (evt: React.FormEvent<HTMLInputElement>) => {
    onChange({ ...query, legendFormat: evt.currentTarget.value });
    onRunQuery();
  };

  function onMaxLinesChange(e: React.SyntheticEvent<HTMLInputElement>) {
    const newMaxLines = preprocessMaxLines(e.currentTarget.value);
    if (query.maxLines !== newMaxLines) {
      onChange({ ...query, maxLines: newMaxLines });
    }
  }

  let queryType = query.queryType ?? (query.instant ? LokiQueryType.Instant : LokiQueryType.Range);

  return (
    <EditorRow>
      <QueryOptionGroup title="Options" collapsedInfo={getCollapsedInfo(query, queryType)}>
        <EditorField
          label="Legend"
          tooltip="Series name override or template. Ex. {{hostname}} will be replaced with label value for hostname."
        >
          <AutoSizeInput
            placeholder="{{label}}"
            type="string"
            minWidth={14}
            defaultValue={query.legendFormat}
            onCommitChange={onLegendFormatChanged}
          />
        </EditorField>
        <EditorField label="Type">
          <RadioButtonGroup
            id="options.query.type"
            options={queryTypeOptions}
            value={queryType}
            onChange={onQueryTypeChange}
          />
        </EditorField>
        <EditorField label="Line limit" tooltip="Upper limit for number of log lines returned by query.">
          <AutoSizeInput
            className="width-4"
            placeholder="auto"
            type="number"
            min={0}
            defaultValue={query.maxLines?.toString() ?? ''}
            onCommitChange={onMaxLinesChange}
          />
        </EditorField>
        <EditorField label="Resolution">
          <Select
            isSearchable={false}
            onChange={onResolutionChange}
            options={RESOLUTION_OPTIONS}
            value={query.resolution || 1}
            aria-label="Select resolution"
            menuShouldPortal
          />
        </EditorField>
      </QueryOptionGroup>
    </EditorRow>
  );
});

function getCollapsedInfo(query: LokiQuery, queryType: LokiQueryType): string[] {
  const queryTypeLabel = queryTypeOptions.find((x) => x.value === queryType);
  const resolutionLabel = RESOLUTION_OPTIONS.find((x) => x.value === (query.resolution ?? 1));

  const items: string[] = [];

  items.push(`Legend: ${getLegendModeLabel(query.legendFormat)}`);

  if (query.resolution) {
    items.push(`Resolution: ${resolutionLabel?.label}`);
  }

  items.push(`Type: ${queryTypeLabel?.label}`);

  return items;
}

LokiQueryBuilderOptions.displayName = 'LokiQueryBuilderOptions';
