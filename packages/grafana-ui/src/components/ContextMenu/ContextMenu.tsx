import React, { useContext, useRef } from 'react';
import { css, cx } from 'emotion';
import useClickAway from 'react-use/lib/useClickAway';
import { GrafanaTheme, selectThemeVariant, ThemeContext } from '../../index';
import { Portal, List } from '../index';

export interface ContextMenuItem {
  label: string;
  target?: string;
  icon?: string;
  url?: string;
  onClick?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  group?: string;
}

export interface ContextMenuGroup {
  label?: string;
  items: ContextMenuItem[];
}
export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items?: ContextMenuGroup[];
  renderHeader?: () => JSX.Element;
}

const getContextMenuStyles = (theme: GrafanaTheme) => {
  const linkColor = selectThemeVariant(
    {
      light: theme.colors.dark2,
      dark: theme.colors.text,
    },
    theme.type
  );
  const linkColorHover = selectThemeVariant(
    {
      light: theme.colors.link,
      dark: theme.colors.white,
    },
    theme.type
  );
  const wrapperBg = selectThemeVariant(
    {
      light: theme.colors.gray7,
      dark: theme.colors.dark2,
    },
    theme.type
  );
  const wrapperShadow = selectThemeVariant(
    {
      light: theme.colors.gray3,
      dark: theme.colors.black,
    },
    theme.type
  );
  const itemColor = selectThemeVariant(
    {
      light: theme.colors.black,
      dark: theme.colors.white,
    },
    theme.type
  );

  const groupLabelColor = selectThemeVariant(
    {
      light: theme.colors.gray1,
      dark: theme.colors.textWeak,
    },
    theme.type
  );

  const itemBgHover = selectThemeVariant(
    {
      light: theme.colors.gray5,
      dark: theme.colors.dark7,
    },
    theme.type
  );
  const headerBg = selectThemeVariant(
    {
      light: theme.colors.white,
      dark: theme.colors.dark1,
    },
    theme.type
  );
  const headerSeparator = selectThemeVariant(
    {
      light: theme.colors.white,
      dark: theme.colors.dark7,
    },
    theme.type
  );

  return {
    header: css`
      padding: 4px;
      border-bottom: 1px solid ${headerSeparator};
      background: ${headerBg};
      margin-bottom: ${theme.spacing.xs};
      border-radius: ${theme.border.radius.sm} ${theme.border.radius.sm} 0 0;
    `,
    wrapper: css`
      background: ${wrapperBg};
      z-index: 1;
      box-shadow: 0 2px 5px 0 ${wrapperShadow};
      min-width: 200px;
      border-radius: ${theme.border.radius.sm};
    `,
    link: css`
      color: ${linkColor};
      display: flex;
      cursor: pointer;
      &:hover {
        color: ${linkColorHover};
        text-decoration: none;
      }
    `,
    item: css`
      background: none;
      padding: 4px 8px;
      color: ${itemColor};
      border-left: 2px solid transparent;
      cursor: pointer;
      &:hover {
        background: ${itemBgHover};
        border-image: linear-gradient(rgba(255, 213, 0, 1) 0%, rgba(255, 68, 0, 1) 99%, rgba(255, 68, 0, 1) 100%);
        border-image-slice: 1;
      }
    `,
    groupLabel: css`
      color: ${groupLabelColor};
      font-size: ${theme.typography.size.sm};
      line-height: ${theme.typography.lineHeight.lg};
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
    `,
    icon: css`
      opacity: 0.7;
      width: 12px;
      height: 12px;
      display: inline-block;
      margin-right: 10px;
      color: ${theme.colors.linkDisabled};
      position: relative;
      top: 3px;
    `,
    divider: css`
      margin: ${theme.spacing.sm} 0;
      border-top: 1px solid ${headerSeparator};
    `,
  };
};

export const ContextMenu: React.FC<ContextMenuProps> = React.memo(({ x, y, onClose, items, renderHeader }) => {
  const theme = useContext(ThemeContext);
  const menuRef = useRef(null);
  useClickAway(menuRef, () => {
    if (onClose) {
      onClose();
    }
  });

  const styles = getContextMenuStyles(theme);

  return (
    <Portal>
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          left: x - 5,
          top: y + 5,
        }}
        className={styles.wrapper}
      >
        {renderHeader && <div className={styles.header}>{renderHeader()}</div>}
        <List
          items={items || []}
          renderItem={(item, index) => {
            return (
              <>
                {index !== 0 && <div className={styles.divider} />}
                <ContextMenuGroup group={item} onItemClick={onClose} />
              </>
            );
          }}
        />
      </div>
    </Portal>
  );
});

interface ContextMenuItemProps {
  label: string;
  icon?: string;
  url?: string;
  target?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = React.memo(
  ({ url, icon, label, target, onClick, className }) => {
    const theme = useContext(ThemeContext);
    const styles = getContextMenuStyles(theme);
    return (
      <div className={styles.item}>
        <a
          href={url}
          target={target || '_self'}
          className={cx(className, styles.link)}
          onClick={e => {
            if (onClick) {
              onClick(e);
            }
          }}
        >
          {icon && <i className={cx(`${icon}`, styles.icon)} />} {label}
        </a>
      </div>
    );
  }
);

interface ContextMenuGroupProps {
  group: ContextMenuGroup;
  onItemClick?: () => void;
}

const ContextMenuGroup: React.FC<ContextMenuGroupProps> = ({ group, onItemClick }) => {
  const theme = useContext(ThemeContext);
  const styles = getContextMenuStyles(theme);

  if (group.items.length === 0) {
    return null;
  }

  return (
    <div>
      {group.label && <div className={styles.groupLabel}>{group.label}</div>}
      <List
        items={group.items || []}
        renderItem={item => {
          return (
            <ContextMenuItem
              url={item.url}
              label={item.label}
              target={item.target}
              icon={item.icon}
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                if (item.onClick) {
                  item.onClick(e);
                }

                if (onItemClick) {
                  onItemClick();
                }
              }}
            />
          );
        }}
      />
    </div>
  );
};
ContextMenu.displayName = 'ContextMenu';
