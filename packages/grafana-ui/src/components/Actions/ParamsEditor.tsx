import { css } from '@emotion/css';
import { useState } from 'react';

import { contentTypeOptions, GrafanaTheme2, VariableSuggestion } from '@grafana/data';

import { useStyles2 } from '../../themes';
import { IconButton } from '../IconButton/IconButton';
import { Input } from '../Input/Input';
import { Stack } from '../Layout/Stack/Stack';
import { Select } from '../Select/Select';

import { SuggestionsInput } from './SuggestionsInput';

interface Props {
  onChange: (v: Array<[string, string]>) => void;
  value: Array<[string, string]>;
  suggestions: VariableSuggestion[];
  contentTypeHeader?: boolean;
}

export const ParamsEditor = ({ value, onChange, suggestions, contentTypeHeader = false }: Props) => {
  const styles = useStyles2(getStyles);

  const headersContentType = value.find(([key, value]) => key === 'Content-Type');

  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [contentTypeParamValue, setContentTypeParamValue] = useState(headersContentType ? 'application/json' : '');

  const changeParamValue = (paramValue: string) => {
    setParamValue(paramValue);
  };

  const changeParamName = (paramName: string) => {
    setParamName(paramName);
  };

  const removeParam = (key: string) => () => {
    const updatedParams = value.filter((param) => param[0] !== key);
    onChange(updatedParams);
  };

  const addParam = (isContentType?: string) => {
    let newParams: Array<[string, string]>;
    const contentTypeParamName = 'Content-Type';

    if (value) {
      newParams = value.filter((e) => (e[0] !== isContentType ? contentTypeParamName : paramName));
    } else {
      newParams = [];
    }

    newParams.push(isContentType ? [contentTypeParamName, contentTypeParamValue] : [paramName, paramValue]);
    newParams.sort((a, b) => a[0].localeCompare(b[0]));
    onChange(newParams);

    setParamName('');
    setParamValue('');
  };

  const changeContentTypeParamValue = (value: string) => {
    setContentTypeParamValue(value);
    addParam('Content-Type');
  };

  const isAddParamsDisabled = paramName === '' || paramValue === '';

  return (
    <div>
      <Stack direction="row">
        <SuggestionsInput
          value={paramName}
          onChange={changeParamName}
          suggestions={suggestions}
          placeholder="Key"
          style={{ width: 332 }}
        />
        <SuggestionsInput
          value={paramValue}
          onChange={changeParamValue}
          suggestions={suggestions}
          placeholder="Value"
          style={{ width: 332 }}
        />
        <IconButton aria-label="add" name="plus-circle" onClick={() => addParam()} disabled={isAddParamsDisabled} />
      </Stack>

      {contentTypeHeader && (
        <div className={styles.extraHeader}>
          <Stack direction="row">
            <Input value={'Content-Type'} disabled />
            <Select
              onChange={(select) => changeContentTypeParamValue(select.value as string)}
              options={contentTypeOptions}
              value={contentTypeParamValue}
            />
          </Stack>
        </div>
      )}

      <Stack direction="column">
        {Array.from(value.filter((param) => param[0] !== 'Content-Type') || []).map((entry) => (
          <Stack key={entry[0]} direction="row">
            <Input disabled value={entry[0]} />
            <Input disabled value={entry[1]} />
            <IconButton aria-label="delete" onClick={removeParam(entry[0])} name="trash-alt" />
          </Stack>
        ))}
      </Stack>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  extraHeader: css({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    maxWidth: 673,
  }),
});
