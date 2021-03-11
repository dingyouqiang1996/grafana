import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { AppEvents, locationUtil } from '@grafana/data';
import appEvents from 'app/core/app_events';
import { StoreState } from 'app/types';
import { historySrv } from './HistorySrv';
import { DashboardModel } from '../../state';
import { locationService } from '@grafana/runtime';

const restoreDashboard = async (version: number, dashboard: DashboardModel) => {
  return await historySrv.restoreDashboard(dashboard, version);
};

export const useDashboardRestore = (version: number) => {
  const dashboard = useSelector((state: StoreState) => state.dashboard.getModel());
  const [state, onRestoreDashboard] = useAsyncFn(async () => await restoreDashboard(version, dashboard!), []);
  useEffect(() => {
    if (state.value) {
      const newUrl = locationUtil.stripBaseFromUrl(state.value.url);
      locationService.replace(newUrl, true);
      appEvents.emit(AppEvents.alertSuccess, ['Dashboard restored', 'Restored from version ' + version]);
    }
  }, [state, version]);
  return { state, onRestoreDashboard };
};
