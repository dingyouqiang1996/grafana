import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

import { useGetPublicDashboardConfig } from './usePublicDashboardConfig';

export const PublicDashboardFooter = function () {
  const styles = useStyles2(getStyles);
  const conf = useGetPublicDashboardConfig();

  return conf.footerHide ? null : (
    <div className={styles.footer}>
      <a className={styles.link} href={conf.footerLink} target="_blank" rel="noreferrer noopener">
        {conf.footerText} <img className={styles.logoImg} alt="" src={conf.footerLogo} />
      </a>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  footer: css({
    display: 'flex',
    justifyContent: 'end',
    height: '30px',
    backgroundColor: theme.colors.background.canvas,
    position: 'sticky',
    bottom: 0,
    zIndex: theme.zIndex.navbarFixed,
    padding: theme.spacing(0.5, 0),
  }),
  link: css({
    display: 'flex',
    alignItems: 'center',
  }),
  logoImg: css({
    height: '16px',
    marginLeft: theme.spacing(0.5),
  }),
});
