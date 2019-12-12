import { css } from 'emotion';
import { LogLevel } from '@grafana/data';

import { GrafanaTheme } from '@grafana/data';
import { selectThemeVariant } from '../../themes/selectThemeVariant';
import { stylesFactory } from '../../themes';

export const getLogRowStyles = stylesFactory((theme: GrafanaTheme, logLevel?: LogLevel) => {
  let logColor = selectThemeVariant({ light: theme.colors.gray5, dark: theme.colors.gray2 }, theme.type);
  const borderColor = selectThemeVariant({ light: theme.colors.gray5, dark: theme.colors.gray2 }, theme.type);
  const bgColor = selectThemeVariant({ light: theme.colors.gray5, dark: theme.colors.dark4 }, theme.type);
  const context = css`
    label: context;
    visibility: hidden;
    white-space: nowrap;
    position: relative;
  `;

  switch (logLevel) {
    case LogLevel.crit:
    case LogLevel.critical:
      logColor = '#705da0';
      break;
    case LogLevel.error:
    case LogLevel.err:
      logColor = '#e24d42';
      break;
    case LogLevel.warning:
    case LogLevel.warn:
      logColor = theme.colors.yellow;
      break;
    case LogLevel.info:
      logColor = '#7eb26d';
      break;
    case LogLevel.debug:
      logColor = '#1f78c1';
      break;
    case LogLevel.trace:
      logColor = '#6ed0e0';
      break;
  }

  return {
    logsRowMatchHighLight: css`
      label: logs-row__match-highlight;
      background: inherit;
      padding: inherit;
      color: ${theme.colors.yellow};
      background-color: rgba(${theme.colors.yellow}, 0.1);
    `,
    logsRowMatchHighLightPreview: css`
      label: logs-row__match-highlight--preview;
      background-color: rgba(${theme.colors.yellow}, 0.2);
      border-bottom-style: dotted;
    `,
    logsRowsTable: css`
      label: logs-rows;
      font-family: ${theme.typography.fontFamily.monospace};
      font-size: ${theme.typography.size.sm};
      width: 100%;
    `,
    logsRowsHorizontalScroll: css`
      label: logs-rows__horizontal-scroll;
      overflow: scroll;
    `,
    context: context,
    logsRow: css`
      label: logs-row;
      width: 100%;
      cursor: pointer;
      vertical-align: top;
      &:hover {
        .${context} {
          visibility: visible;
          z-index: 1;
          margin-left: 10px;
          text-decoration: underline;
          &:hover {
            color: ${theme.colors.yellow};
          }
        }
      }

      > td {
        border-top: ${theme.border.width.sm} solid transparent;
        border-bottom: ${theme.border.width.sm} solid transparent;
        height: 100%;
      }

      &:hover {
        background: ${theme.colors.pageBg};
      }
    `,
    logsRowDuplicates: css`
      label: logs-row__duplicates;
      text-align: right;
      width: 4em;
      cursor: default;
    `,
    logsRowLevel: css`
      label: logs-row__level;
      position: relative;
      padding-right: ${theme.spacing.sm};
      width: 10px;
      cursor: default;

      &::after {
        content: '';
        display: block;
        position: absolute;
        top: 1px;
        bottom: 1px;
        width: 3px;
        background-color: ${logColor};
      }
    `,
    logsRowCell: css`
      label: logs-row-cell;
      word-break: break-all;
      padding-right: ${theme.spacing.sm};
    `,
    logsRowToggleDetails: css`
      label: logs-row-toggle-details__level;
      position: relative;
      width: 15px;
      font-size: 9px;
      padding-top: 5px;
      padding-right: ${theme.spacing.sm};
    `,
    logsRowLocalTime: css`
      label: logs-row__localtime;
      display: table-cell;
      white-space: nowrap;
      padding-right: ${theme.spacing.sm};
    `,
    logsRowLabels: css`
      label: logs-row__labels;
      white-space: nowrap;
      padding-right: ${theme.spacing.sm};
      max-width: 22em;
    `,
    logsRowMessage: css`
      label: logs-row__message;
      word-break: break-all;
    `,
    //Log details sepcific CSS
    logDetailsContainer: css`
      label: logs-row-details-table;
      width: 100%;
      border: 1px solid ${borderColor};
      padding: 0 ${theme.spacing.sm} ${theme.spacing.sm};
      border-radius: 3px;
      margin: 20px 10px 20px 0;
      cursor: default;
    `,
    logDetailsTable: css`
      label: logs-row-details-table;
      table-layout: auto;
      width: 100%;
      td:last-child {
        width: 100%;
      }
    `,
    logsDetailsIcon: css`
      label: logs-row-details__icon;
      position: relative;
      width: 2.5em;
      padding-right: ${theme.spacing.md};
      color: ${theme.colors.gray3};
    `,
    logDetailsLabel: css`
      label: logs-row-details__label;
      max-width: 25em;
      min-width: 15em;
      padding: 0 ${theme.spacing.sm};
      word-break: break-all;
    `,
    logDetailsHeading: css`
      label: logs-row-details__heading;
      font-weight: ${theme.typography.weight.bold};
      padding: ${theme.spacing.sm} 0 ${theme.spacing.xs};
    `,
    logDetailsValue: css`
      label: logs-row-details__row;
      line-height: 2;
      padding: ${theme.spacing.sm};
      position: relative;
      vertical-align: top;
      cursor: default;
      &:hover {
        background-color: ${bgColor};
      }
    `,
  };
});
