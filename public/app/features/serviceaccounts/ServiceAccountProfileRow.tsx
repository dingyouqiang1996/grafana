import { css, cx } from '@emotion/css';
import React, { useEffect, useRef, useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { ConfirmButton, Input, LegacyInputStatus, useStyles2 } from '@grafana/ui';

interface Props {
  label: string;
  value?: string;
  inputType?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export const ServiceAccountProfileRow = ({ label, value, inputType, disabled, onChange }: Props): JSX.Element => {
  const inputElem = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const styles = useStyles2(getStyles);

  const labelClass = cx(
    'width-16',
    css`
      font-weight: 500;
    `
  );

  const inputId = `${label}-input`;

  useEffect(() => {
    if (isEditing) {
      focusInput();
    }
  }, [isEditing]);

  const onEditClick = () => {
    setIsEditing(true);
  };

  const onCancelClick = () => {
    setIsEditing(false);
    setInputValue(value || '');
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>, status?: LegacyInputStatus) => {
    if (status === LegacyInputStatus.Invalid) {
      return;
    }
    setInputValue(event.target.value);
  };

  const onInputBlur = (event: React.FocusEvent<HTMLInputElement>, status?: LegacyInputStatus) => {
    if (status === LegacyInputStatus.Invalid) {
      return;
    }
    setInputValue(event.target.value);
  };

  const focusInput = () => {
    inputElem?.current?.focus();
  };

  const onSave = () => {
    setIsEditing(false);
    if (onChange) {
      onChange(inputValue!);
    }
  };

  return (
    <tr>
      <td className={labelClass}>
        <label htmlFor={inputId}>{label}</label>
      </td>
      <td className="width-25" colSpan={2}>
        {!disabled && isEditing ? (
          <Input
            id={inputId}
            type={inputType}
            defaultValue={value}
            onBlur={onInputBlur}
            onChange={onInputChange}
            ref={inputElem}
            width={30}
          />
        ) : (
          <span className={cx({ [styles.disabled]: disabled })}>{value}</span>
        )}
      </td>
      <td>
        {onChange && (
          <ConfirmButton
            closeOnConfirm
            confirmText="Save"
            onConfirm={onSave}
            onClick={onEditClick}
            onCancel={onCancelClick}
            disabled={disabled}
          >
            Edit
          </ConfirmButton>
        )}
      </td>
    </tr>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    disabled: css`
      color: ${theme.colors.text.secondary};
    `,
  };
};
