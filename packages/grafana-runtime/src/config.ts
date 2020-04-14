import merge from 'lodash/merge';
import { getTheme } from '@grafana/ui';
import { DataSourceInstanceSettings, GrafanaTheme, GrafanaThemeType, PanelPluginMeta } from '@grafana/data';

export interface BuildInfo {
  version: string;
  commit: string;
  isEnterprise: boolean; // deprecated: use licenseInfo.hasLicense instead
  env: string;
  edition: string;
  latestVersion: string;
  hasUpdate: boolean;
}

interface FeatureToggles {
  transformations: boolean;
  expressions: boolean;
  newEdit: boolean;
  meta: boolean; // enterprise
  newVariables: boolean;
  tracingIntegration: boolean;
}

interface LicenseInfo {
  hasLicense: boolean;
  expiry: number;
  licenseUrl: string;
  stateInfo: string;
}

export class GrafanaBootConfig {
  datasources: { [str: string]: DataSourceInstanceSettings } = {};
  panels: { [key: string]: PanelPluginMeta } = {};
  minRefreshInterval = '';
  appSubUrl = '';
  windowTitlePrefix = '';
  buildInfo: BuildInfo = {} as BuildInfo;
  newPanelTitle = '';
  bootData: any;
  externalUserMngLinkUrl = '';
  externalUserMngLinkName = '';
  externalUserMngInfo = '';
  allowOrgCreate = false;
  disableLoginForm = false;
  defaultDatasource = '';
  alertingEnabled = false;
  alertingErrorOrTimeout = '';
  alertingNoDataOrNullValues = '';
  alertingMinInterval = 1;
  authProxyEnabled = false;
  exploreEnabled = false;
  ldapEnabled = false;
  samlEnabled = false;
  autoAssignOrg = true;
  verifyEmailEnabled = false;
  oauth: any;
  disableUserSignUp = false;
  loginHint: any;
  passwordHint: any;
  loginError: any;
  navTree: any;
  viewersCanEdit = false;
  editorsCanAdmin = false;
  disableSanitizeHtml = false;
  theme: GrafanaTheme;
  pluginsToPreload: string[] = [];
  featureToggles: FeatureToggles = {
    transformations: false,
    expressions: false,
    newEdit: false,
    meta: false,
    newVariables: true,
    tracingIntegration: false,
  };
  licenseInfo: LicenseInfo = {} as LicenseInfo;
  phantomJSRenderer = false;

  constructor(options: GrafanaBootConfig) {
    this.theme = options.bootData.user.lightTheme ? getTheme(GrafanaThemeType.Light) : getTheme(GrafanaThemeType.Dark);

    const defaults = {
      datasources: {},
      windowTitlePrefix: 'Grafana - ',
      panels: {},
      newPanelTitle: 'Panel Title',
      playlist_timespan: '1m',
      unsaved_changes_warning: true,
      appSubUrl: '',
      buildInfo: {
        version: 'v1.0',
        commit: '1',
        env: 'production',
        isEnterprise: false,
      },
      viewersCanEdit: false,
      editorsCanAdmin: false,
      disableSanitizeHtml: false,
    };

    merge(this, defaults, options);
  }
}

const bootData = (window as any).grafanaBootData || {
  settings: {},
  user: {},
  navTree: [],
};

const options = bootData.settings;
options.bootData = bootData;

export const config = new GrafanaBootConfig(options);
console.log('config', config);
