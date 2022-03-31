import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

export const getStyles = ({ v1: { spacing, palette } }: GrafanaTheme2) => ({
  pageWrapper: css`
    margin-bottom: ${spacing.md};
  `,
  rowProps: css`
    cursor: pointer;
    &:hover {
      background-color: ${palette.gray15};
    }
  `,
  cellProps: css`
    background-color: transparent !important;
  `,
});
