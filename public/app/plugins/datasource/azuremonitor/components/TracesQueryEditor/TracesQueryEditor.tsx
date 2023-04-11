import React, { useCallback, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';

import { EditorFieldGroup, EditorRow, EditorRows } from '@grafana/experimental';
import { Input } from '@grafana/ui';

import Datasource from '../../datasource';
import { AzureMonitorErrorish, AzureMonitorOption, AzureMonitorQuery, ResultFormat } from '../../types';
import { Field } from '../Field';
import FormatAsField from '../FormatAsField';
import AdvancedResourcePicker from '../LogsQueryEditor/AdvancedResourcePicker';
import ResourceField from '../ResourceField';
import { ResourceRow, ResourceRowGroup, ResourceRowType } from '../ResourcePicker/types';
import { parseResourceDetails } from '../ResourcePicker/utils';

import TraceTypeField from './TraceTypeField';
import { setFormatAs, setQueryOperationId } from './setQueryValue';

interface TracesQueryEditorProps {
  query: AzureMonitorQuery;
  datasource: Datasource;
  subscriptionId?: string;
  onChange: (newQuery: AzureMonitorQuery) => void;
  variableOptionGroup: { label: string; options: AzureMonitorOption[] };
  setError: (source: string, error: AzureMonitorErrorish | undefined) => void;
}

const TracesQueryEditor = ({
  query,
  datasource,
  subscriptionId,
  variableOptionGroup,
  onChange,
  setError,
}: TracesQueryEditorProps) => {
  const disableRow = (row: ResourceRow, selectedRows: ResourceRowGroup) => {
    if (selectedRows.length === 0) {
      // Only if there is some resource(s) selected we should disable rows
      return false;
    }
    const rowResourceNS = parseResourceDetails(row.uri, row.location).metricNamespace?.toLowerCase();
    const selectedRowSampleNs = parseResourceDetails(
      selectedRows[0].uri,
      selectedRows[0].location
    ).metricNamespace?.toLowerCase();
    // Only resources with the same metricNamespace can be selected
    return rowResourceNS !== selectedRowSampleNs;
  };

  const [operationId, setOperationId] = useState<string>(query.azureTraces?.operationId ?? '');
  const previousOperationId = usePrevious(query.azureTraces?.operationId);

  useEffect(() => {
    if (query.azureTraces?.operationId) {
      if (previousOperationId !== query.azureTraces.operationId) {
        setOperationId(query.azureTraces.operationId);
      }
    }
  }, [setOperationId, previousOperationId, query, operationId]);

  const handleChange = useCallback((ev: React.FormEvent) => {
    if (ev.target instanceof HTMLInputElement) {
      setOperationId(ev.target.value);
    }
  }, []);

  const handleBlur = useCallback(
    (ev: React.FormEvent) => {
      const newQuery = setQueryOperationId(query, operationId);
      onChange(newQuery);
    },
    [onChange, operationId, query]
  );

  return (
    <span data-testid="azure-monitor-logs-query-editor-with-experimental-ui">
      <EditorRows>
        <EditorRow>
          <EditorFieldGroup>
            <ResourceField
              query={query}
              datasource={datasource}
              subscriptionId={subscriptionId}
              variableOptionGroup={variableOptionGroup}
              onQueryChange={onChange}
              setError={setError}
              selectableEntryTypes={[
                ResourceRowType.Subscription,
                ResourceRowType.ResourceGroup,
                ResourceRowType.Resource,
                ResourceRowType.Variable,
              ]}
              resources={query.azureTraces?.resources ?? []}
              queryType="traces"
              disableRow={disableRow}
              renderAdvanced={(resources, onChange) => (
                // It's required to cast resources because the resource picker
                // specifies the type to string | AzureMonitorResource.
                // eslint-disable-next-line
                <AdvancedResourcePicker resources={resources as string[]} onChange={onChange} />
              )}
              selectionNotice={() => 'You may only choose items of the same resource type.'}
            />
            <Field label="Operation ID">
              <Input
                id="azure-monitor-traces-operation-id-field"
                value={operationId}
                onChange={handleChange}
                onBlur={handleBlur}
                width={40}
              />
            </Field>
          </EditorFieldGroup>
        </EditorRow>
        <EditorRow>
          <EditorFieldGroup>
            <TraceTypeField
              datasource={datasource}
              onQueryChange={onChange}
              query={query}
              setError={setError}
              variableOptionGroup={variableOptionGroup}
            />
          </EditorFieldGroup>
        </EditorRow>
        <EditorRow>
          <EditorFieldGroup>
            <FormatAsField
              datasource={datasource}
              setError={setError}
              query={query}
              variableOptionGroup={variableOptionGroup}
              onQueryChange={onChange}
              inputId="azure-monitor-traces"
              options={[
                { label: 'Table', value: ResultFormat.Table },
                { label: 'Trace', value: ResultFormat.Trace },
              ]}
              defaultValue={ResultFormat.Table}
              setFormatAs={setFormatAs}
              resultFormat={query.azureTraces?.resultFormat}
            />
          </EditorFieldGroup>
        </EditorRow>
      </EditorRows>
    </span>
  );
};

export default TracesQueryEditor;
