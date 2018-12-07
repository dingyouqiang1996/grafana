import _ from 'lodash';
import { PanelPlugin } from 'app/types/plugins';

export interface BuildInfo {
  version: string;
  commit: string;
  isEnterprise: boolean;
  env: string;
}

export interface SearchPanelOptions {
  starredCount: number;
  recentCount: number;
}

export class Settings {
  datasources: any;
  panels: PanelPlugin[];
  appSubUrl: string;
  windowTitlePrefix: string;
  buildInfo: BuildInfo;
  newPanelTitle: string;
  bootData: any;
  externalUserMngLinkUrl: string;
  externalUserMngLinkName: string;
  externalUserMngInfo: string;
  allowOrgCreate: boolean;
  disableLoginForm: boolean;
  defaultDatasource: string;
  alertingEnabled: boolean;
  alertingErrorOrTimeout: string;
  alertingNoDataOrNullValues: string;
  authProxyEnabled: boolean;
  exploreEnabled: boolean;
  ldapEnabled: boolean;
  oauth: any;
  disableUserSignUp: boolean;
  loginHint: any;
  loginError: any;
  searchPanelOptions: SearchPanelOptions;

  constructor(options) {
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
      searchPanelOptions: {
        recentCount: 5,
        starredCount: 5,
      },
    };

    _.extend(this, defaults, options);
  }
}

const bootData = (window as any).grafanaBootData || {
  settings: {},
  user: {},
};

const options = bootData.settings;
options.bootData = bootData;

const config = new Settings(options);
export default config;
