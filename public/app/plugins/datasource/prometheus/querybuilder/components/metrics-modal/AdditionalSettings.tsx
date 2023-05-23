import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Icon, Switch, useTheme2 } from '@grafana/ui';

import { testIds } from './MetricsModal';
import { placeholders } from './state/helpers';
import { MetricsModalState } from './state/state';

type AdditionalSettingsProps = {
  state: MetricsModalState;
  onChangeFullMetaSearch: () => void;
  onChangeIncludeNullMetadata: () => void;
  onChangeDisableTextWrap: () => void;
  onChangeUseBackend: () => void;
  onChangeInferType: () => void;
};

export function AdditionalSettings(props: AdditionalSettingsProps) {
  const {
    state,
    onChangeFullMetaSearch,
    onChangeIncludeNullMetadata,
    onChangeDisableTextWrap,
    onChangeUseBackend,
    onChangeInferType,
  } = props;

  const theme = useTheme2();
  const styles = getStyles(theme);

  return (
    <>
      <div className={styles.selectItem}>
        <Switch
          data-testid={testIds.searchWithMetadata}
          value={state.fullMetaSearch}
          disabled={state.useBackend || !state.hasMetadata}
          onChange={() => onChangeFullMetaSearch()}
        />
        <div className={styles.selectItemLabel}>{placeholders.metadataSearchSwitch}</div>
      </div>
      <div className={styles.selectItem}>
        <Switch
          value={state.includeNullMetadata}
          disabled={!state.hasMetadata}
          onChange={() => onChangeIncludeNullMetadata()}
        />
        <div className={styles.selectItemLabel}>{placeholders.includeNullMetadata}</div>
      </div>
      <div className={styles.selectItem}>
        <Switch value={state.disableTextWrap} onChange={() => onChangeDisableTextWrap()} />
        <div className={styles.selectItemLabel}>Disable text wrap</div>
      </div>
      <div className={styles.selectItem}>
        <Switch data-testid={testIds.setUseBackend} value={state.useBackend} onChange={() => onChangeUseBackend()} />
        <div className={styles.selectItemLabel}>{placeholders.setUseBackend}&nbsp;</div>
        <Icon
          name="info-circle"
          size="xs"
          className={styles.settingsIcon}
          title="Filter metric names by regex search, using an additional call on the Prometheus API."
        />
      </div>
      <div className={styles.selectItem}>
        <Switch data-testid={testIds.inferType} value={state.inferType} onChange={() => onChangeInferType()} />
        <div className={styles.selectItemLabel}>{placeholders.inferType}&nbsp;</div>
        <Icon
          name="info-circle"
          size="xs"
          className={styles.settingsIcon}
          title="For example, metrics ending in _sum, _count, will be given an inferred type of counter. Metrics ending in _bucket with be given a type of histogram."
        />
      </div>
    </>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    settingsIcon: css`
      color: ${theme.colors.text.secondary};
    `,
    selectItem: css`
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 4px 0;
    `,
    selectItemLabel: css`
      margin: 0 0 0 ${theme.spacing(1)};
      align-self: center;
      color: ${theme.colors.text.secondary};
      font-size: 12px;
    `,
  };
}
