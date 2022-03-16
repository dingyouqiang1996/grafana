import { HorizontalGroup, useStyles2 } from '@grafana/ui';
import { isEmpty } from 'lodash';
import React, { FC } from 'react';
import { useRulesSourcesWithRuler } from '../../../hooks/useRuleSourcesWithRuler';
import { RuleFormType } from '../../../types/rule-form';
import { GrafanaManagedRuleType } from './GrafanaManaged';
import { CortexFlavoredType } from './CortexFlavor';
import { RecordingRuleType } from './RecordingRule';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data/src';

interface RuleTypePickerProps {
  onChange: (value: RuleFormType) => void;
  selected: RuleFormType;
}

const RuleTypePicker: FC<RuleTypePickerProps> = ({ selected, onChange }) => {
  const rulesSourcesWithRuler = useRulesSourcesWithRuler();
  const hasLotexDatasources = !isEmpty(rulesSourcesWithRuler);

  const styles = useStyles2(getStyles);

  return (
    <div>
      <HorizontalGroup spacing="md">
        <GrafanaManagedRuleType selected={selected === RuleFormType.grafana} onClick={onChange} />
        <CortexFlavoredType
          selected={selected === RuleFormType.cloudAlerting}
          onClick={onChange}
          disabled={!hasLotexDatasources}
        />
        <RecordingRuleType
          selected={selected === RuleFormType.cloudRecording}
          onClick={onChange}
          disabled={!hasLotexDatasources}
        />
      </HorizontalGroup>
      <small className={styles.meta}>
        Select &ldquo;Grafana managed&rdquo; unless you have a Cortex or Loki data source with the Ruler API enabled.
      </small>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  meta: css`
    color: ${theme.colors.text.disabled};
  `,
});

export { RuleTypePicker };
