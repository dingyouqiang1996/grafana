import { css } from '@emotion/css';
import React from 'react';

import { DataSourcePluginOptionsEditorProps, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { InlineField, InlineFieldRow, InlineSwitch, Input, useStyles2 } from '@grafana/ui';

import { TempoJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<TempoJsonData> {}

export function QuerySettings({ options, onOptionsChange }: Props) {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      <h3 className="page-heading">TraceID Query</h3>
      <InlineField
        label="Use time range in query"
        tooltip="The time range is ignored by default when querying by TraceID but can be used when there are performance issues or timeouts since it will narrow down the search to the defined range. Default is disabled."
        labelWidth={26}
      >
        <InlineSwitch
          id="enable-time-shift"
          value={options.jsonData.traceQuery?.timeShiftEnabled || false}
          onChange={(event) => {
            updateDatasourcePluginJsonDataOption({ onOptionsChange, options }, 'traceQuery', {
              ...options.jsonData.traceQuery,
              timeShiftEnabled: event.currentTarget.checked,
            });
          }}
        />
      </InlineField>
      <InlineFieldRow>
        <InlineField
          label="Time shift for start of search"
          labelWidth={26}
          disabled={!options.jsonData.traceQuery?.timeShiftEnabled}
          grow
          tooltip="Shifts the start of the time range when searching by TraceID. This is needed as searching for traces can return traces that do not fully fall into the search time range, so we recommend using higher time shifts for longer traces. Default 30m (Time units can be used here, for example: 5s, 1m, 3h)"
        >
          <Input
            type="text"
            placeholder="30m"
            width={40}
            onChange={(v) =>
              updateDatasourcePluginJsonDataOption({ onOptionsChange, options }, 'traceQuery', {
                ...options.jsonData.traceQuery,
                spanStartTimeShift: v.currentTarget.value,
              })
            }
            value={options.jsonData.traceQuery?.spanStartTimeShift || ''}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
          label="Time shift for end of search"
          labelWidth={26}
          disabled={!options.jsonData.traceQuery?.timeShiftEnabled}
          grow
          tooltip="Shifts the end of the time range when searching by TraceID. This is needed as searching for traces can return traces that do not fully fall into the search time range, so we recommend using higher time shifts for longer traces. Default 30m (Time units can be used here, for example: 5s, 1m, 3h)"
        >
          <Input
            type="text"
            placeholder="30m"
            width={40}
            onChange={(v) =>
              updateDatasourcePluginJsonDataOption({ onOptionsChange, options }, 'traceQuery', {
                ...options.jsonData.traceQuery,
                spanEndTimeShift: v.currentTarget.value,
              })
            }
            value={options.jsonData.traceQuery?.spanEndTimeShift || ''}
          />
        </InlineField>
      </InlineFieldRow>
    </div>
  );
}

const getStyles = () => ({
  container: css`
    label: container;
    width: 100%;
  `,
  row: css`
    label: row;
    align-items: baseline;
  `,
});
