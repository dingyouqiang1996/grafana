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
      <h3>Step 3: Configure origin data source</h3>
      <p>
        Links are shown in panels with results of the selected origin source data source. They are displayed in data
        point next to the value of the provided field.
      </p>
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
            label="Origin data source"
            description="Results from selected origin data source have links displayed in the panel"
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
        label="Results field"
        description="The link will be shown next to the value of this field"
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
