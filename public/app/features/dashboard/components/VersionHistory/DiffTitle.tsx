import React from 'react';
import { useStyles, Icon } from '@grafana/ui';
import { GrafanaTheme } from '@grafana/data';
import { css } from 'emotion';
import { Diff, getChangeText } from './utils';
import { DiffValues } from './DiffValues';

type DiffTitleProps = {
  diff?: Diff;
  title: string;
};

export const DiffTitle: React.FC<DiffTitleProps> = ({ diff, title }) => {
  const styles = useStyles(getDiffTitleStyles);
  return diff ? (
    <>
      <Icon type="mono" name="circle" className={styles[diff.op]} /> <span className={styles.embolden}>{title}</span>{' '}
      <span>{getChangeText(diff.op)}</span> <DiffValues diff={diff} />
    </>
  ) : (
    <div className={styles.withoutDiff}>
      <Icon type="mono" name="circle" className={styles.replace} /> <span className={styles.embolden}>{title}</span>{' '}
      <span>{getChangeText('replace')}</span>
    </div>
  );
};

const getDiffTitleStyles = (theme: GrafanaTheme) => ({
  embolden: css`
    font-weight: ${theme.typography.weight.bold};
  `,
  add: css`
    color: ${theme.palette.online};
  `,
  replace: css`
    color: ${theme.palette.warn};
  `,
  move: css`
    color: ${theme.palette.warn};
  `,
  copy: css`
    color: ${theme.palette.warn};
  `,
  _get: css`
    color: ${theme.palette.warn};
  `,
  test: css`
    color: ${theme.palette.warn};
  `,
  remove: css`
    color: ${theme.palette.critical};
  `,
  withoutDiff: css`
    margin-bottom: ${theme.spacing.md};
  `,
});
