import { ThresholdsMode } from '@grafana/data';
import { PanelBuilders, SceneFlexItem, SceneQueryRunner, SceneTimeRange } from '@grafana/scenes';
import { DataSourceRef } from '@grafana/schema';

export function getPendingCloudAlertsScene(timeRange: SceneTimeRange, datasource: DataSourceRef, panelTitle: string) {
  const query = new SceneQueryRunner({
    datasource,
    queries: [
      {
        refId: 'A',
        instant: true,
        expr: 'sum by (alertstate) (ALERTS{alertstate="pending"})',
      },
    ],
    $timeRange: timeRange,
  });

  return new SceneFlexItem({
    minHeight: 300,
    body: PanelBuilders.stat()
      .setTitle(panelTitle)
      .setData(query)
      .setThresholds({
        mode: ThresholdsMode.Absolute,
        steps: [
          {
            color: 'yellow',
            value: 0,
          },
          {
            color: 'red',
            value: 80,
          },
        ],
      })
      .build(),
  });
}
