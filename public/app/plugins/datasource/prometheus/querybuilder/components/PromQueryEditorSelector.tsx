import { css } from '@emotion/css';
import { CoreApp, GrafanaTheme2, LoadingState } from '@grafana/data';
import { EditorHeader, FlexItem, InlineSelect, Space } from '@grafana/experimental';
import { Button, ConfirmModal, useStyles2 } from '@grafana/ui';
import React, { SyntheticEvent, useCallback, useState } from 'react';

import { PromQueryEditor } from '../../components/PromQueryEditor';
import { PromQueryEditorProps } from '../../components/types';
import { promQueryModeller } from '../PromQueryModeller';
import { QueryEditorModeToggle } from '../shared/QueryEditorModeToggle';
import { QueryHeaderSwitch } from '../shared/QueryHeaderSwitch';
import { QueryEditorMode } from '../shared/types';
import { getDefaultEmptyQuery, PromVisualQuery } from '../types';
import { PromQueryBuilder } from './PromQueryBuilder';
import { PromQueryBuilderExplained } from './PromQueryBuilderExplained';
import { buildVisualQueryFromString } from '../parsing';
import { PromQuery } from '../../types';

export const PromQueryEditorSelector = React.memo<PromQueryEditorProps>((props) => {
  const { query, onChange, onRunQuery, data } = props;
  const styles = useStyles2(getStyles);
  const [visualQuery, setVisualQuery] = useState<PromVisualQuery>(query.visualQuery ?? getDefaultEmptyQuery());
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<PromQuery | undefined>(undefined);

  const onEditorModeChange = useCallback(
    (newMetricEditorMode: QueryEditorMode) => {
      const change = { ...query, editorMode: newMetricEditorMode };
      if (newMetricEditorMode === QueryEditorMode.Builder) {
        const result = buildVisualQueryFromString(query.expr);
        change.visualQuery = result.query;
        // If there are errors, give user a chance to decide if they want to go to builder as that can loose some data.
        if (result.errors.length) {
          setParseModalOpen(true);
          setPendingChange(change);
          return;
        }
        setVisualQuery(change.visualQuery);
      }
      onChange(change);
    },
    [onChange, query]
  );

  const onChangeViewModel = (updatedQuery: PromVisualQuery) => {
    setVisualQuery(updatedQuery);

    onChange({
      ...query,
      expr: promQueryModeller.renderQuery(updatedQuery),
      visualQuery: updatedQuery,
      editorMode: QueryEditorMode.Builder,
    });
  };

  const onInstantChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const isEnabled = event.currentTarget.checked;
    onChange({ ...query, instant: isEnabled, exemplar: false });
    onRunQuery();
  };

  const onExemplarChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const isEnabled = event.currentTarget.checked;
    onChange({ ...query, exemplar: isEnabled });
    onRunQuery();
  };

  // If no expr (ie new query) then default to builder
  const editorMode = query.editorMode ?? (query.expr ? QueryEditorMode.Code : QueryEditorMode.Builder);
  const showExemplarSwitch = props.app !== CoreApp.UnifiedAlerting && !query.instant;

  return (
    <>
      <ConfirmModal
        isOpen={parseModalOpen}
        title="Query parsing"
        body="There were errors while trying to parse the query. Continuing to visual builder may loose some parts of the query."
        confirmText="Continue"
        onConfirm={() => {
          setVisualQuery(pendingChange!.visualQuery!);
          onChange(pendingChange!);
          setParseModalOpen(false);
        }}
        onDismiss={() => setParseModalOpen(false)}
      />
      <EditorHeader>
        <FlexItem grow={1} />
        <Button
          className={styles.runQuery}
          variant="secondary"
          size="sm"
          fill="outline"
          onClick={onRunQuery}
          icon={data?.state === LoadingState.Loading ? 'fa fa-spinner' : undefined}
          disabled={data?.state === LoadingState.Loading}
        >
          Run query
        </Button>
        <QueryHeaderSwitch label="Instant" value={query.instant} onChange={onInstantChange} />
        {showExemplarSwitch && (
          <QueryHeaderSwitch label="Exemplars" value={query.exemplar} onChange={onExemplarChange} />
        )}
        {editorMode === QueryEditorMode.Builder && (
          <>
            <InlineSelect
              value={null}
              placeholder="Query patterns"
              allowCustomValue
              onChange={({ value }) => {
                onChangeViewModel({
                  ...visualQuery,
                  operations: value?.operations!,
                });
              }}
              options={promQueryModeller.getQueryPatterns().map((x) => ({ label: x.name, value: x }))}
            />
          </>
        )}
        <QueryEditorModeToggle mode={editorMode} onChange={onEditorModeChange} />
      </EditorHeader>
      <Space v={0.5} />
      {editorMode === QueryEditorMode.Code && <PromQueryEditor {...props} />}
      {editorMode === QueryEditorMode.Builder && (
        <PromQueryBuilder
          query={visualQuery}
          datasource={props.datasource}
          onChange={onChangeViewModel}
          onRunQuery={props.onRunQuery}
        />
      )}
      {editorMode === QueryEditorMode.Explain && <PromQueryBuilderExplained query={visualQuery} />}
    </>
  );
});

PromQueryEditorSelector.displayName = 'PromQueryEditorSelector';

const getStyles = (theme: GrafanaTheme2) => {
  return {
    runQuery: css({
      color: theme.colors.text.secondary,
    }),
    switchLabel: css({
      color: theme.colors.text.secondary,
      fontSize: theme.typography.bodySmall.fontSize,
    }),
  };
};
