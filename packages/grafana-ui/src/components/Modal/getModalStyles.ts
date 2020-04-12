import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { selectThemeVariant, stylesFactory } from '../../themes';

export const getModalStyles = stylesFactory((theme: GrafanaTheme) => {
  const backdropBackground = selectThemeVariant(
    {
      light: theme.palette.bodyBg,
      dark: theme.palette.gray25,
    },
    theme.type
  );
  return {
    modal: css`
      position: fixed;
      z-index: ${theme.zIndex.modal};
      background: ${theme.palette.pageBg};
      box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
      background-clip: padding-box;
      outline: none;
      width: 750px;
      max-width: 100%;
      left: 0;
      right: 0;
      margin-left: auto;
      margin-right: auto;
      top: 10%;
    `,
    modalBackdrop: css`
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: ${theme.zIndex.modalBackdrop};
      background-color: ${backdropBackground};
      opacity: 0.7;
    `,
    modalHeader: css`
      background: ${theme.palette.pageHeaderBg};
      box-shadow: ${theme.shadow.pageHeader};
      border-bottom: 1px solid ${theme.palette.pageHeaderBorder};
      display: flex;
      height: 42px;
    `,
    modalHeaderTitle: css`
      font-size: ${theme.typography.heading.h3};
      padding-top: ${theme.spacing.sm};
      margin: 0 ${theme.spacing.md};
    `,
    modalHeaderIcon: css`
      margin-right: ${theme.spacing.md};
      font-size: inherit;
      &:before {
        vertical-align: baseline;
      }
    `,
    modalHeaderClose: css`
      height: 100%;
      display: flex;
      align-items: center;
      flex-grow: 1;
      justify-content: flex-end;
      padding-right: ${theme.spacing.sm};
    `,
    modalContent: css`
      padding: calc(${theme.spacing.d} * 2);
      overflow: auto;
      width: 100%;
      max-height: calc(90vh - ${theme.spacing.d} * 2);
    `,
  };
});
