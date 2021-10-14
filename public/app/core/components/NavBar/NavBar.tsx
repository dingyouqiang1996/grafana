import React, { FC, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { css, cx } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { Icon, useTheme2 } from '@grafana/ui';
import appEvents from '../../app_events';
import { Branding } from 'app/core/components/Branding/Branding';
import config from 'app/core/config';
import { CoreEvents, KioskMode } from 'app/types';
import TopSection from './TopSection';
import BottomSection from './BottomSection';
import NavBarItem from './NavBarItem';

const homeUrl = config.appSubUrl || '/';

export const NavBar: FC = React.memo(() => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const kiosk = query.get('kiosk') as KioskMode;

  const toggleNavBarSmallBreakpoint = useCallback(() => {
    appEvents.emit(CoreEvents.toggleSidemenuMobile);
  }, []);
  const newNavigationEnabled = config.featureToggles.newNavigation;

  if (kiosk !== null) {
    return null;
  }

  return (
    <nav className={cx(styles.sidemenu, 'sidemenu')} data-testid="sidemenu" aria-label="Main menu">
      {!newNavigationEnabled && (
        <NavBarItem url={homeUrl} label="Home" className={styles.grafanaLogo}>
          <Branding.MenuLogo />
        </NavBarItem>
      )}
      {newNavigationEnabled && (
        <NavBarItem onClick={() => console.log('WOW!')} label="Full menu" className={styles.grafanaLogo}>
          <Branding.MenuLogo />
        </NavBarItem>
      )}
      <div className={styles.mobileSidemenuLogo} onClick={toggleNavBarSmallBreakpoint} key="hamburger">
        <Icon name="bars" size="xl" />
        <span className={styles.closeButton}>
          <Icon name="times" />
          Close
        </span>
      </div>
      <TopSection />
      <BottomSection />
    </nav>
  );
});

NavBar.displayName = 'NavBar';

const getStyles = (theme: GrafanaTheme2) => ({
  sidemenu: css`
    display: flex;
    flex-direction: column;
    position: fixed;
    z-index: ${theme.zIndex.sidemenu};

    ${theme.breakpoints.up('md')} {
      background-color: ${theme.colors.background.primary};
      border-right: 1px solid ${theme.components.panel.borderColor};
      position: relative;
      width: ${theme.components.sidemenu.width}px;
    }

    .sidemenu-hidden & {
      display: none;
    }

    .sidemenu-open--xs & {
      background-color: ${theme.colors.background.primary};
      box-shadow: ${theme.shadows.z1};
      height: auto;
      position: absolute;
      width: 100%;
    }
  `,
  grafanaLogo: css`
    display: none;

    ${theme.breakpoints.up('md')} {
      align-items: center;
      display: flex;
      justify-content: center;
    }
  `,
  closeButton: css`
    display: none;

    .sidemenu-open--xs & {
      display: block;
      font-size: ${theme.typography.fontSize}px;
    }
  `,
  mobileSidemenuLogo: css`
    align-items: center;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing(2)};

    ${theme.breakpoints.up('md')} {
      display: none;
    }
  `,
});
