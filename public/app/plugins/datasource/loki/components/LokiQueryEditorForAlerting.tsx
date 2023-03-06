import React from 'react';

import { LokiQueryField } from './LokiQueryField';
import { LokiQueryEditorProps } from './types';

export function LokiQueryEditorForAlerting(props: LokiQueryEditorProps) {
  const { query, data, datasource, onChange, onRunQuery, history } = props;

  return (
    <LokiQueryField
      datasource={datasource}
      query={query}
      onChange={onChange}
      onRunQuery={onRunQuery}
      history={history}
      data={data}
      placeholder="Enter a Loki query"
      data-testid={testIds.editor}
      setQueryStats={() => {}}
    />
  );
}

export const testIds = {
  editor: 'loki-editor-cloud-alerting',
};
