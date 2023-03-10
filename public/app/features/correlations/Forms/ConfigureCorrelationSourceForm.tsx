import { css } from '@emotion/css';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { DataSourceInstanceSettings, GrafanaTheme2 } from '@grafana/data';
import { DataSourcePicker } from '@grafana/runtime';
import { Field, Input, useStyles2 } from '@grafana/ui';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';

import { useCorrelationsFormContext } from './correlationsFormContext';
import { getInputId } from './utils';

const getStyles = (theme: GrafanaTheme2) => ({
  label: css`
    max-width: ${theme.spacing(32)};
  `,
  description: css`
    max-width: ${theme.spacing(80)};
  `,
});

export const ConfigureCorrelationSourceForm = () => {
  const { control, formState, register } = useFormContext();
  const styles = useStyles2(getStyles);
  const withDsUID = (fn: Function) => (ds: DataSourceInstanceSettings) => fn(ds.uid);

  const { correlation, readOnly } = useCorrelationsFormContext();

  return (
    <>
      <Controller
        control={control}
        name="sourceUID"
        rules={{
          required: { value: true, message: 'This field is required.' },
          validate: {
            writable: (uid: string) =>
              !getDatasourceSrv().getInstanceSettings(uid)?.readOnly || "Source can't be a read-only data source.",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <Field
            label="Source"
            htmlFor="source"
            invalid={!!formState.errors.sourceUID}
            error={formState.errors.sourceUID?.message}
          >
            <DataSourcePicker
              onChange={withDsUID(onChange)}
              noDefault
              current={value}
              inputId="source"
              width={32}
              disabled={correlation !== undefined}
            />
          </Field>
        )}
      />

      <Field
        label="Target field"
        className={styles.label}
        invalid={!!formState.errors?.config?.field}
        error={formState.errors?.config?.field?.message}
      >
        <Input
          id={getInputId('field', correlation)}
          {...register('config.field', { required: 'This field is required.' })}
          readOnly={readOnly}
        />
      </Field>
    </>
  );
};
