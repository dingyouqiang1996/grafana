import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

const getStyles = (theme: GrafanaTheme2) => css`
  padding: ${theme.spacing(0, 2)};
  font-size: ${theme.typography.bodySmall.fontSize};
  color: ${theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DetailText = ({ children }: React.PropsWithChildren<{}>) => {
  const collapsedTextStyles = useStyles2(getStyles);
  return <div className={collapsedTextStyles}>{children}</div>;
};
