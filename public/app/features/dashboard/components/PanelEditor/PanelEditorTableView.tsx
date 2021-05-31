import { PanelChrome } from '@grafana/ui';
import { PanelRenderer } from 'app/features/panel/PanelRenderer';
import React, { useCallback, useEffect, useState } from 'react';
import { PanelModel, DashboardModel } from '../../state';
import { usePanelLatestData } from './usePanelLatestData';
import { PanelOptions } from 'app/plugins/panel/table/models.gen';
import { RefreshEvent } from 'app/types/events';
import { Subscription } from 'rxjs';
import { applyPanelTimeOverrides } from 'app/features/dashboard/utils/panel';
import { getTimeSrv, TimeSrv } from '../../services/TimeSrv';
interface Props {
  width: number;
  height: number;
  panel: PanelModel;
  dashboard: DashboardModel;
}

export function PanelEditorTableView({ width, height, panel, dashboard }: Props) {
  const { data } = usePanelLatestData(panel, { withTransforms: true, withFieldConfig: false }, false);
  const [options, setOptions] = useState<PanelOptions>({
    frameIndex: 0,
    showHeader: true,
  });

  const timeSrv: TimeSrv = getTimeSrv();
  const timeData = applyPanelTimeOverrides(panel, timeSrv.timeRange());

  const onRefresh = useCallback(() => {
    panel.runAllPanelQueries(dashboard.id, dashboard.getTimezone(), timeData, width);
  }, [dashboard, panel, timeData, width]);

  // Subscribe to panel events
  useEffect(() => {
    const subs = new Subscription();
    subs.add(panel.events.subscribe(RefreshEvent, onRefresh));
    return () => {
      subs.unsubscribe();
    };
  }, [onRefresh, panel]);

  if (!data) {
    return null;
  }

  return (
    <PanelChrome width={width} height={height} padding="none">
      {(innerWidth, innerHeight) => (
        <PanelRenderer
          title="Raw data"
          pluginId="table"
          width={innerWidth}
          height={innerHeight}
          data={data}
          options={options}
          onOptionsChange={setOptions}
        />
      )}
    </PanelChrome>
  );
}
