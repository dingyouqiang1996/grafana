import { Icon, IconName, stylesFactory, useTheme } from '@grafana/ui';
import React from 'react';
import { css, cx } from 'emotion';
import { GrafanaTheme } from '@grafana/data';

interface QueryOperationActionProps {
  icon: IconName;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const QueryOperationAction: React.FC<QueryOperationActionProps> = ({ icon, disabled, ...otherProps }) => {
  const theme = useTheme();
  const styles = getQueryOperationActionStyles(theme, !!disabled);
  const onClick = (e: React.MouseEvent) => {
    if (!disabled) {
      otherProps.onClick(e);
    }
  };

  return <Icon name={icon} className={styles.icon} onClick={onClick} />;
};

const getQueryOperationActionStyles = stylesFactory((theme: GrafanaTheme, disabled: boolean) => {
  return {
    icon: cx(
      !disabled &&
        css`
          cursor: pointer;
          color: ${theme.colors.textWeak};
        `,
      disabled &&
        css`
          color: ${theme.colors.gray25};
          cursor: disabled;
        `
    ),
  };
});

QueryOperationAction.displayName = 'QueryOperationAction';
