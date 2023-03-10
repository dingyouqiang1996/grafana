import { css, cx } from '@emotion/css';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data';
import { Field, Input, TextArea, useStyles2 } from '@grafana/ui';

import { useCorrelationsFormContext } from './correlationsFormContext';
import { FormDTO } from './types';
import { getInputId } from './utils';

const getStyles = (theme: GrafanaTheme2) => ({
  label: css`
    max-width: ${theme.spacing(32)};
  `,
  description: css`
    max-width: ${theme.spacing(80)};
  `,
});

export const ConfigureCorrelationBasicInfoForm = () => {
  const { register } = useFormContext<FormDTO>();
  const styles = useStyles2(getStyles);
  const { correlation, readOnly } = useCorrelationsFormContext();

  return (
    <>
      <input type="hidden" {...register('config.type')} />

      <Field label="Label" className={styles.label}>
        <Input
          id={getInputId('label', correlation)}
          {...register('label')}
          readOnly={readOnly}
          placeholder="i.e. Tempo traces"
        />
      </Field>

      <Field
        label="Description"
        // the Field component automatically adds margin to itself, so we are forced to workaround it by overriding  its styles
        className={cx(styles.description)}
      >
        <TextArea id={getInputId('description', correlation)} {...register('description')} readOnly={readOnly} />
      </Field>
    </>
  );
};
