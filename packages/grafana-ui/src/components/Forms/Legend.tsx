import { css, cx } from '@emotion/css';
import React, { ReactNode } from 'react';

import { GrafanaTheme2, ThemeTypographyVariantTypes } from '@grafana/data';

import { useStyles2 } from '../../themes';

export interface LabelProps extends React.HTMLAttributes<HTMLLegendElement> {
  children: string | ReactNode;
  description?: string;
  header?: keyof ThemeTypographyVariantTypes;
}

export const getLegendStyles = (theme: GrafanaTheme2, header: keyof ThemeTypographyVariantTypes) => {
  return {
    legend: css({
      fontSize: theme.typography[header].fontSize,
      fontWeight: theme.typography.fontWeightRegular,
      margin: theme.spacing(0, 0, 2, 0),
    }),
  };
};

export const Legend = ({ children, className, ...legendProps }: LabelProps) => {
  const styles = useStyles2(getLegendStyles, legendProps.header ?? 'h3');

  return (
    <legend className={cx(styles.legend, className)} {...legendProps}>
      {children}
    </legend>
  );
};
