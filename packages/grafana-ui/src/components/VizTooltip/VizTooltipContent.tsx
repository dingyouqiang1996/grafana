import { css } from '@emotion/css';
import React, { CSSProperties, ReactNode } from 'react';

import { GrafanaTheme2 } from '@grafana/data';

import { useStyles2 } from '../../themes';

import { VizTooltipRow } from './VizTooltipRow';
import { VizTooltipItem } from './types';

interface VizTooltipContentProps {
  items: VizTooltipItem[];
  children?: ReactNode;
  scrollable?: boolean;
  isPinned: boolean;
  maxHeight?: number;
}

export const VizTooltipContent = ({
  items,
  children,
  isPinned,
  scrollable = false,
  maxHeight,
}: VizTooltipContentProps) => {
  const styles = useStyles2(getStyles);

  const scrollableStyle: CSSProperties = scrollable
    ? {
        maxHeight: maxHeight,
        overflowY: 'scroll',
      }
    : {};

  return (
    <div className={styles.wrapper} style={scrollableStyle}>
      {items.map(({ label, value, color, colorIndicator, colorPlacement, isActive }, i) => (
        <VizTooltipRow
          key={i}
          label={label}
          value={value}
          color={color}
          colorIndicator={colorIndicator}
          colorPlacement={colorPlacement}
          isActive={isActive}
          justify={'space-between'}
          isPinned={isPinned}
        />
      ))}
      {children}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 4,
    borderTop: `1px solid ${theme.colors.border.medium}`,
    padding: theme.spacing(1),
  }),
});
