import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { IconButton, ReactUtils, useStyles2 } from '@grafana/ui';

export interface Props {
  onRowToggle: () => void;
  isContentVisible?: boolean;
  title?: string;
  headerElement?: React.ReactNode | ((props: { className?: string }) => React.ReactNode);
}

export function SettingsBarHeader({ headerElement, isContentVisible = false, onRowToggle, title }: Props) {
  const styles = useStyles2(getStyles);

  const headerElementRendered =
    headerElement && ReactUtils.renderOrCallToRender(headerElement, { className: styles.summaryWrapper });

  return (
    <div className={styles.header}>
      <div className={styles.column}>
        <IconButton
          name={isContentVisible ? 'angle-down' : 'angle-right'}
          tooltip={isContentVisible ? 'Collapse settings' : 'Expand settings'}
          className={styles.collapseIcon}
          onClick={onRowToggle}
          aria-expanded={isContentVisible}
        />
        {title && (
          // disabling the a11y rules here as the IconButton above handles keyboard interactions
          // this is just to provide a better experience for mouse users
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div className={styles.titleWrapper} onClick={onRowToggle}>
            <div className={styles.title}>{title}</div>
          </div>
        )}
        {headerElementRendered}
      </div>
    </div>
  );
}

SettingsBarHeader.displayName = 'SettingsBarHeader';

function getStyles(theme: GrafanaTheme2) {
  return {
    header: css({
      label: 'header',
      padding: theme.spacing(0.5, 0.5),
      borderRadius: theme.shape.borderRadius(1),
      background: theme.colors.background.secondary,
      minHeight: theme.spacing(4),

      '&:focus': {
        outline: 'none',
      },
    }),
    column: css({
      label: 'column',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    }),
    collapseIcon: css({
      marginLeft: theme.spacing(0.5),
      color: theme.colors.text.disabled,
    }),
    titleWrapper: css({
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      overflow: 'hidden',
      marginRight: `${theme.spacing(0.5)}`,
      [theme.breakpoints.down('sm')]: {
        flex: '1 1',
      },
    }),
    title: css({
      fontWeight: theme.typography.fontWeightBold,
      marginLeft: theme.spacing(0.5),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    summaryWrapper: css({
      display: 'flex',
      flexWrap: 'wrap',
      [theme.breakpoints.down('sm')]: {
        flex: '2 2',
      },
    }),
  };
}
