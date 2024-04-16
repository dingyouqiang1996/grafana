import { css, cx } from '@emotion/css';
import React, { useMemo } from 'react';

import { GrafanaTheme2, Labels } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

// Levels are already encoded in color, filename is a Loki-ism
const HIDDEN_LABELS = ['level', 'lvl', 'filename'];

interface Props {
  labels: Labels;
  emptyMessage?: string;
}

export const LogLabels = ({ labels, emptyMessage }: Props) => {
  const styles = useStyles2(getStyles);
  const displayLabels = useMemo(
    () =>
      Object.keys(labels)
        .filter((label) => !label.startsWith('_') && !HIDDEN_LABELS.includes(label))
        .sort(),
    [labels]
  );

  if (displayLabels.length === 0 && emptyMessage) {
    return (
      <span className={cx([styles.logsLabels])}>
        <span className={cx([styles.logsLabel])}>{emptyMessage}</span>
      </span>
    );
  }

  return (
    <span className={cx([styles.logsLabels])}>
      {displayLabels.map((label) => {
        const value = labels[label];
        if (!value) {
          return;
        }
        const tooltip = `${label}=${value}`;
        const labelValue = `${label}=${value}`;
        return (
          <LogLabel key={label} styles={styles} tooltip={tooltip}>
            {labelValue}
          </LogLabel>
        );
      })}
    </span>
  );
};

interface LogLabelsArrayProps {
  labels: string[];
}

export const LogLabelsList = ({ labels }: LogLabelsArrayProps) => {
  const styles = useStyles2(getStyles);
  return (
    <span className={cx([styles.logsLabels])}>
      {labels.map((label) => (
        <LogLabel key={label} styles={styles} tooltip={label}>
          {label}
        </LogLabel>
      ))}
    </span>
  );
};

interface LogLabelProps {
  styles: Record<string, string>;
  tooltip?: string;
  children: JSX.Element | string;
}

const LogLabel = ({ styles, tooltip, children }: LogLabelProps) => {
  return (
    <span className={cx([styles.logsLabel])}>
      <span className={cx([styles.logsLabelValue])} title={tooltip}>
        {children}
      </span>
    </span>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    logsLabels: css`
      display: flex;
      flex-wrap: wrap;
      font-size: ${theme.typography.size.xs};
    `,
    logsLabel: css`
      label: logs-label;
      display: flex;
      padding: ${theme.spacing(0, 0.25)};
      background-color: ${theme.colors.background.secondary};
      border-radius: ${theme.shape.radius.default};
      margin: ${theme.spacing(0.125, 0.5, 0, 0)};
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    `,
    logsLabelValue: css`
      label: logs-label__value;
      display: inline-block;
      max-width: ${theme.spacing(25)};
      text-overflow: ellipsis;
      overflow: hidden;
    `,
  };
};
