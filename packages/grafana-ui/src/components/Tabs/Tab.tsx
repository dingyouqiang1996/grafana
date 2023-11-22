import { css, cx } from '@emotion/css';
import React, { HTMLProps } from 'react';

import { GrafanaTheme2, NavModelItem } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { useStyles2 } from '../../themes';
import { getFocusStyles } from '../../themes/mixins';
import { IconName } from '../../types';
import { clearButtonStyles } from '../Button';
import { Icon } from '../Icon/Icon';

import { Counter } from './Counter';

export interface TabProps extends HTMLProps<HTMLElement> {
  label: string;
  active?: boolean;
  /** When provided, it is possible to use the tab as a hyperlink. Use in cases where the tabs update location. */
  href?: string;
  icon?: IconName;
  onChangeTab?: (event: React.MouseEvent<HTMLElement>) => void;
  /** A number rendered next to the text. Usually used to display the number of items in a tab's view. */
  counter?: number | null;
  /** Extra content, displayed after the tab label and counter */
  suffix?: NavModelItem['tabSuffix'];
}

export const Tab = React.forwardRef<HTMLElement, TabProps>(
  ({ label, active, icon, onChangeTab, counter, suffix: Suffix, className, href, ...otherProps }, ref) => {
    const tabsStyles = useStyles2(getStyles);
    const clearStyles = useStyles2(clearButtonStyles);

    const content = () => (
      <>
        {icon && <Icon name={icon} />}
        {label}
        {typeof counter === 'number' && <Counter value={counter} />}
        {Suffix && <Suffix className={tabsStyles.suffix} />}
      </>
    );

    const linkClass = cx(clearStyles, tabsStyles.link, active ? tabsStyles.activeStyle : tabsStyles.notActive);

    if (href) {
      <div className={tabsStyles.item}>
        <a
          href={href}
          className={linkClass}
          {...otherProps}
          onClick={onChangeTab}
          aria-label={otherProps['aria-label'] || selectors.components.Tab.title(label)}
          role="tab"
          aria-selected={active}
          // don't think we can avoid the type assertion here :(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {content()}
        </a>
      </div>;
    }

    return (
      <div className={tabsStyles.item}>
        <button
          className={linkClass}
          {...otherProps}
          onClick={onChangeTab}
          aria-label={otherProps['aria-label'] || selectors.components.Tab.title(label)}
          role="tab"
          type="button"
          aria-selected={active}
          // don't think we can avoid the type assertion here :(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ref={ref as React.ForwardedRef<HTMLButtonElement>}
        >
          {content()}
        </button>
      </div>
    );
  }
);

Tab.displayName = 'Tab';

const getStyles = (theme: GrafanaTheme2) => {
  return {
    item: css({
      listStyle: 'none',
      position: 'relative',
      display: 'flex',
      whiteSpace: 'nowrap',
      padding: theme.spacing(0.5),
    }),
    link: css({
      color: theme.colors.text.secondary,
      padding: theme.spacing(1, 1.5, 0.5),
      borderRadius: theme.shape.radius.default,

      display: 'block',
      height: '100%',

      svg: {
        marginRight: theme.spacing(1),
      },

      '&:focus-visible': getFocusStyles(theme),

      '&::before': {
        display: 'block',
        content: '" "',
        position: 'absolute',
        left: 0,
        right: 0,
        height: '4px',
        borderRadius: theme.shape.radius.default,
        bottom: 0,
      },
    }),
    notActive: css({
      'a:hover, &:hover, &:focus': {
        color: theme.colors.text.primary,

        '&::before': {
          backgroundColor: theme.colors.action.hover,
        },
      },
    }),
    activeStyle: css({
      label: 'activeTabStyle',
      color: theme.colors.text.primary,
      overflow: 'hidden',

      '&::before': {
        backgroundImage: theme.colors.gradients.brandHorizontal,
      },
    }),
    suffix: css({
      marginLeft: theme.spacing(1),
    }),
  };
};
