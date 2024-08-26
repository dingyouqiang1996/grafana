import { css } from '@emotion/css';
import { memo } from 'react';

import { Action, GrafanaTheme2, httpMethodOptions, HttpRequestMethod, VariableSuggestion } from '@grafana/data';

import { useStyles2 } from '../../themes';
import { Field } from '../Forms/Field';
import { InlineField } from '../Forms/InlineField';
import { InlineFieldRow } from '../Forms/InlineFieldRow';
import { RadioButtonGroup } from '../Forms/RadioButtonGroup/RadioButtonGroup';
import { JSONFormatter } from '../JSONFormatter/JSONFormatter';

import { ParamsEditor } from './ParamsEditor';
import { HTMLElementType, SuggestionsInput } from './SuggestionsInput';

interface ActionEditorProps {
  index: number;
  value: Action;
  onChange: (index: number, action: Action) => void;
  suggestions: VariableSuggestion[];
}

const LABEL_WIDTH = 13;

export const ActionEditor = memo(({ index, value, onChange, suggestions }: ActionEditorProps) => {
  const styles = useStyles2(getStyles);

  const onTitleChange = (title: string) => {
    onChange(index, { ...value, title });
  };

  const onUrlChange = (url: string) => {
    onChange(index, {
      ...value,
      options: {
        ...value.options,
        url,
      },
    });
  };

  const onBodyChange = (body: string) => {
    onChange(index, {
      ...value,
      options: {
        ...value.options,
        body,
      },
    });
  };

  const onMethodChange = (method: HttpRequestMethod) => {
    onChange(index, {
      ...value,
      options: {
        ...value.options,
        method,
      },
    });
  };

  const onQueryParamsChange = (queryParams: Array<[string, string]>) => {
    onChange(index, {
      ...value,
      options: {
        ...value.options,
        queryParams,
      },
    });
  };

  const onHeadersChange = (headers: Array<[string, string]>) => {
    onChange(index, {
      ...value,
      options: {
        ...value.options,
        headers,
      },
    });
  };

  const renderJSON = (data: string) => {
    try {
      const json = JSON.parse(data);
      return <JSONFormatter json={json} />;
    } catch (error) {
      if (error instanceof Error) {
        return `Invalid JSON provided: ${error.message}`;
      } else {
        return 'Invalid JSON provided';
      }
    }
  };

  return (
    <div className={styles.listItem}>
      <Field label="Title">
        <SuggestionsInput value={value.title} onChange={onTitleChange} suggestions={suggestions} />
      </Field>

      <InlineFieldRow>
        <InlineField label="Method" labelWidth={LABEL_WIDTH} grow={true}>
          <RadioButtonGroup<HttpRequestMethod>
            value={value?.options.method}
            options={httpMethodOptions}
            onChange={onMethodChange}
            fullWidth
          />
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>
        <InlineField label="URL" labelWidth={LABEL_WIDTH} grow={true}>
          <SuggestionsInput value={value.options.url} onChange={onUrlChange} suggestions={suggestions} />
        </InlineField>
      </InlineFieldRow>

      <Field label="Query parameters" className={styles.fieldGap}>
        <ParamsEditor
          value={value?.options.queryParams ?? []}
          onChange={onQueryParamsChange}
          suggestions={suggestions}
        />
      </Field>

      <Field label="Headers">
        <ParamsEditor
          value={value?.options.headers ?? []}
          onChange={onHeadersChange}
          suggestions={suggestions}
          contentTypeHeader={true}
        />
      </Field>

      {value?.options.method !== HttpRequestMethod.GET && (
        <Field label="Body">
          <SuggestionsInput
            value={value.options.body}
            onChange={onBodyChange}
            suggestions={suggestions}
            type={HTMLElementType.TextAreaElement}
          />
        </Field>
      )}

      <br />
      {value?.options.method !== HttpRequestMethod.GET && renderJSON(value?.options.body ?? '{}')}
    </div>
  );
});

const getStyles = (theme: GrafanaTheme2) => ({
  listItem: css({
    marginBottom: theme.spacing(),
  }),
  infoText: css({
    paddingBottom: theme.spacing(2),
    marginLeft: '66px',
    color: theme.colors.text.secondary,
  }),
  fieldGap: css({
    marginTop: theme.spacing(2),
  }),
});

ActionEditor.displayName = 'ActionEditor';
