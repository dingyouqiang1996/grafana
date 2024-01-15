import { isNumber } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { DashboardModel } from 'app/features/dashboard/state';

export interface HistoryListOpts {
  limit: number;
  start: number;
}

export interface RevisionsModel {
  id: number;
  checked: boolean;
  uid: string;
  parentVersion: number;
  version: number;
  created: Date;
  createdBy: string;
  message: string;
  data: string;
}

export class HistorySrv {
  getHistoryList(dashboardUID: string, options: HistoryListOpts) {
    if (typeof dashboardUID !== 'string') {
      return Promise.resolve([]);
    }

    return getBackendSrv().get(`api/dashboards/uid/${dashboardUID}/versions`, options);
  }

  getDashboardVersion(uid: string, version: number) {
    return getBackendSrv().get(`api/dashboards/uid/${uid}/versions/${version}`);
  }

  restoreDashboard(dashboardUID: string, version: number) {
    const url = `api/dashboards/uid/${dashboardUID}/restore`;

    return isNumber(version) ? getBackendSrv().post(url, { version }) : Promise.resolve({});
  }
}

const historySrv = new HistorySrv();
export { historySrv };
