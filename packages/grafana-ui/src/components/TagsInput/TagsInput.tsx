import { css, cx } from '@emotion/css';
import React, { ChangeEvent, KeyboardEvent, FC, useState } from 'react';

import { GrafanaTheme } from '@grafana/data';

import { useStyles, useTheme2 } from '../../themes/ThemeContext';
import { Button } from '../Button';
import { Input } from '../Input/Input';

import { TagItem } from './TagItem';

export interface Props {
  placeholder?: string;
  /** Array of selected tags */
  tags?: string[];
  onChange: (tags: string[]) => void;
  width?: number;
  id?: string;
  className?: string;
  /** Toggle disabled state */
  disabled?: boolean;
  /** Enable adding new tags when input loses focus */
  addOnBlur?: boolean;
  /** Toggle invalid state */
  invalid?: boolean;
}

export const TagsInput: FC<Props> = ({
  placeholder = 'New tag (enter key to add)',
  tags = [],
  onChange,
  width,
  className,
  disabled,
  addOnBlur,
  invalid,
  id,
}) => {
  const [newTagName, setNewName] = useState('');
  const styles = useStyles(getStyles);
  const theme = useTheme2();

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const onRemove = (tagToRemove: string) => {
    onChange(tags.filter((x) => x !== tagToRemove));
  };

  const onAdd = (event?: React.MouseEvent) => {
    event?.preventDefault();
    if (!tags.includes(newTagName)) {
      onChange(tags.concat(newTagName));
    }
    setNewName('');
  };

  const onBlur = () => {
    if (addOnBlur && newTagName) {
      onAdd();
    }
  };

  const onKeyboardAdd = (event: KeyboardEvent) => {
    event.preventDefault();
    if (event.key === 'Enter' && newTagName !== '') {
      onChange(tags.concat(newTagName));
      setNewName('');
    }
  };

  return (
    <div className={cx(styles.wrapper, className, width ? css({ width: theme.spacing(width) }) : '')}>
      <div className={tags?.length ? styles.tags : undefined}>
        {tags?.map((tag: string, index: number) => {
          return <TagItem key={`${tag}-${index}`} name={tag} onRemove={onRemove} disabled={disabled} />;
        })}
      </div>
      <div>
        <Input
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onNameChange}
          value={newTagName}
          onKeyUp={onKeyboardAdd}
          onKeyDown={(e) => {
            // onKeyDown is triggered before onKeyUp, triggering submit behaviour on Enter press if this component
            // is used inside forms. Moving onKeyboardAdd callback here doesn't work since text input is not captured in onKeyDown
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          onBlur={onBlur}
          invalid={invalid}
          suffix={
            newTagName.length > 0 && (
              <Button fill="text" className={styles.addButtonStyle} onClick={onAdd} size="md">
                Add
              </Button>
            )
          }
        />
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme) => ({
  wrapper: css`
    min-height: ${theme.spacing.formInputHeight}px;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  `,
  tags: css`
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-right: ${theme.spacing.xs};
  `,
  addButtonStyle: css`
    margin: 0 -${theme.spacing.sm};
  `,
});
