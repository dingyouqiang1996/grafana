import { PanelBuilders, SceneFlexItem, SceneQueryRunner } from '@grafana/scenes';
import { DataSourceRef, GraphDrawStyle, TooltipDisplayMode } from '@grafana/schema';

import { INSTANCE_ID, overrideToFixedColor, PANEL_STYLES } from '../../../home/Insights';
import { InsightsRatingModal } from '../../RatingModal';

export function getRuleGroupEvaluationsScene(datasource: DataSourceRef, panelTitle: string) {
  const exprA = INSTANCE_ID
    ? `grafanacloud_instance_rule_evaluations_total:rate5m{rule_group="$rule_group", id="${INSTANCE_ID}} - grafanacloud_instance_rule_evaluation_failures_total:rate5m{rule_group=~"$rule_group", id="${INSTANCE_ID}}`
    : `grafanacloud_instance_rule_evaluations_total:rate5m{rule_group="$rule_group"} - grafanacloud_instance_rule_evaluation_failures_total:rate5m{rule_group=~"$rule_group"}`;

  const exprB = INSTANCE_ID
    ? `grafanacloud_instance_rule_evaluation_failures_total:rate5m{rule_group=~"$rule_group", id="${INSTANCE_ID}}`
    : `grafanacloud_instance_rule_evaluation_failures_total:rate5m{rule_group=~"$rule_group"}`;

  const query = new SceneQueryRunner({
    datasource,
    queries: [
      {
        refId: 'A',
        exprA,
        range: true,
        legendFormat: 'success',
      },
      {
        refId: 'B',
        exprB,
        range: true,
        legendFormat: 'failed',
      },
    ],
  });

  return new SceneFlexItem({
    ...PANEL_STYLES,
    body: PanelBuilders.timeseries()
      .setTitle(panelTitle)
      .setDescription('The number of successful and failed evaluations for the rule group')
      .setData(query)
      .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
      .setOption('tooltip', { mode: TooltipDisplayMode.Multi })
      .setOverrides((b) =>
        b
          .matchFieldsWithName('success')
          .overrideColor(overrideToFixedColor('success'))
          .matchFieldsWithName('failed')
          .overrideColor(overrideToFixedColor('failed'))
      )
      .setHeaderActions(<InsightsRatingModal panel={panelTitle} />)
      .build(),
  });
}
