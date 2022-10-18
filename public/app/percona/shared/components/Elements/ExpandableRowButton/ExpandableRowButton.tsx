import { IconButton, useStyles2 } from '@grafana/ui';
import React from 'react';
import { ExpandableButtonProps } from './ExpandableRowButton.type';
import { getStyles } from './ExpandableRowButton.styles';

export const ExpandableRowButton = ({ row }: ExpandableButtonProps) => {
  const expandedRowProps = row.getToggleRowExpandedProps ? row.getToggleRowExpandedProps() : {};
  const styles = useStyles2(getStyles);
  return (
    <span className={styles.buttonWrapper} {...expandedRowProps}>
      {row.isExpanded ? (
        <IconButton data-testid="hide-row-details" size="xl" name="arrow-up" className={styles.icon} />
      ) : (
        <IconButton data-testid="show-row-details" size="xl" name="arrow-down" className={styles.icon} />
      )}
    </span>
  );
};
