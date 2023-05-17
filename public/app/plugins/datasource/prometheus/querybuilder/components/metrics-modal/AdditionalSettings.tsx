import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Icon, Switch, Tooltip, useTheme2 } from '@grafana/ui';

import { testIds } from './MetricsModal';
import { placeholders } from './state/helpers';
import { MetricsModalState } from './state/state';

type AdditionalSettingsProps = {
  state: MetricsModalState;
  onChangeFullMetaSearch: () => void;
  onChangeIncludeNullMetadata: () => void;
  onChangeDisableTextWrap: () => void;
  onChangeUseBackend: () => void;
};

export function AdditionalSettings(props: AdditionalSettingsProps) {
  const { state, onChangeFullMetaSearch, onChangeIncludeNullMetadata, onChangeDisableTextWrap, onChangeUseBackend } =
    props;

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
        <p className={styles.selectItemLabel}>{placeholders.metadataSearchSwitch}</p>
      </div>
      <div className={styles.selectItem}>
        <Switch
          value={state.includeNullMetadata}
          disabled={!state.hasMetadata}
          onChange={() => onChangeIncludeNullMetadata()}
        />
        <p className={styles.selectItemLabel}>{placeholders.includeNullMetadata}</p>
      </div>
      <div className={styles.selectItem}>
        <Switch value={state.disableTextWrap} onChange={() => onChangeDisableTextWrap()} />
        <p className={styles.selectItemLabel}>Disable text wrap</p>
      </div>
      <div className={styles.selectItem}>
        <Switch data-testid={testIds.setUseBackend} value={state.useBackend} onChange={() => onChangeUseBackend()} />
        <p className={styles.selectItemLabel}>{placeholders.setUseBackend}&nbsp;</p>
        <Tooltip
          content={'Filter metric names by regex search, using an additional call on the Prometheus API.'}
          placement="bottom-end"
        >
          <Icon name="info-circle" size="xs" className={styles.backendTooltip} />
        </Tooltip>
      </div>
    </>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    backendTooltip: css`
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
