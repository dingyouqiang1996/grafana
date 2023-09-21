import { PanelBuilders, SceneFlexItem, SceneQueryRunner, SceneTimeRange } from '@grafana/scenes';
import { DataSourceRef, GraphDrawStyle } from '@grafana/schema';

export function getEvalSuccessVsFailuresScene(
  timeRange: SceneTimeRange,
  datasource: DataSourceRef,
  panelTitle: string
) {
  const query = new SceneQueryRunner({
    datasource,
    queries: [
      {
        refId: 'A',
        expr: 'sum(grafanacloud_instance_rule_evaluations_total:rate5m) - sum(grafanacloud_instance_rule_evaluation_failures_total:rate5m)',
        range: true,
        legendFormat: 'success',
      },
      {
        refId: 'B',
        expr: 'sum(grafanacloud_instance_rule_evaluation_failures_total:rate5m)',
        range: true,
        legendFormat: 'failed',
      },
    ],
    $timeRange: timeRange,
  });

  return new SceneFlexItem({
    minHeight: 300,
    body: PanelBuilders.timeseries()
      .setTitle(panelTitle)
      .setData(query)
      .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
      .build(),
  });
}
