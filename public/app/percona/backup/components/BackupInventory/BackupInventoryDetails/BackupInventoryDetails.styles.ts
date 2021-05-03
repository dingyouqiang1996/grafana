import { css } from 'emotion';

import { GrafanaTheme } from '@grafana/data';

export const getStyles = ({ spacing }: GrafanaTheme) => ({
  detailsWrapper: css`
    display: flex;

    & > span {
      flex: 0 1 50%;
    }
  `,
  detailLabel: css`
    margin-right: ${spacing.md};
  `,
});
