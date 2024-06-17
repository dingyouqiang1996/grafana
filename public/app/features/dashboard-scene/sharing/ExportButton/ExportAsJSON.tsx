import { css } from '@emotion/css';
import saveAs from 'file-saver';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';

import { GrafanaTheme2 } from '@grafana/data';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors';
import { SceneObjectRef } from '@grafana/scenes';
import { Button, ClipboardButton, CodeEditor, Label, Stack, Switch, useTheme2 } from '@grafana/ui';
import { Trans } from 'app/core/internationalization';
import { DashboardExporter } from 'app/features/dashboard/components/DashExportModal';
import { DashboardModel } from 'app/features/dashboard/state';

import { DashboardScene } from '../../scene/DashboardScene';
import { transformSceneToSaveModel } from '../../serialization/transformSceneToSaveModel';
import { getVariablesCompatibility } from '../../utils/getVariablesCompatibility';
import { DashboardInteractions } from '../../utils/interactions';

const selector = e2eSelectors.pages.ExportDashboardDrawer.ExportAsJson;

export interface Props {
  dashboardRef: SceneObjectRef<DashboardScene>;
}

export default function ExportAsJSON({ dashboardRef }: Props) {
  const [isSharingExternally, setIsSharingExternally] = useState(true);

  function onShareExternallyChange() {
    setSharingExternallyState(!isSharingExternally);
  }

  const _exporter = new DashboardExporter();

  async function getExportableDashboardJson() {
    const saveModel = transformSceneToSaveModel(dashboardRef.resolve());

    const exportable = isSharingExternally
      ? await _exporter.makeExportable(
          new DashboardModel(saveModel, undefined, {
            getVariablesFromState: () => {
              return getVariablesCompatibility(window.__grafanaSceneContext);
            },
          })
        )
      : saveModel;

    return exportable;
  }

  async function onSaveAsFile() {
    const dashboardJson = await getExportableDashboardJson();
    const dashboardJsonPretty = JSON.stringify(dashboardJson, null, 2);

    const blob = new Blob([dashboardJsonPretty], {
      type: 'application/json;charset=utf-8',
    });

    const time = new Date().getTime();
    let title = 'dashboard';
    if ('title' in dashboardJson && dashboardJson.title) {
      title = dashboardJson.title;
    }
    saveAs(blob, `${title}-${time}.json`);
    DashboardInteractions.exportDownloadJsonClicked({
      externally: isSharingExternally,
    });
  }

  function onClose() {
    dashboardRef.resolve().setState({ overlay: undefined });
  }

  const theme = useTheme2();
  const styles = getStyles(theme);

  const dashboardJson = useAsync(async () => {
    const json = await getExportableDashboardJson();
    return JSON.stringify(json, null, 2);
  }, [isSharingExternally]);
  return (
    <>
      <p className="export-json-drawer-info-text">
        <Trans i18nKey="export.json.info-text">
          Copy or download a JSON file containing the JSON of your dashboard.
        </Trans>
      </p>

      <div className={styles.switchItem}>
        <Switch
          data-testid={selector.exportExternallyToggle}
          id="export-externally-toggle"
          value={isSharingExternally}
          onChange={onShareExternallyChange}
        />
        <Label className={styles.switchItemLabel}>
          <Trans i18nKey="export.json.export-externally-label">Export the dashboard to use in another instance</Trans>
        </Label>
      </div>

      <AutoSizer disableHeight className={styles.codeEditorBox} data-testid={selector.codeEditor}>
        {({ width }) => {
          if (dashboardJson.value) {
            return (
              <CodeEditor
                value={dashboardJson.value ?? ''}
                language="json"
                showMiniMap={false}
                height="500px"
                width={width}
                readOnly={true}
              />
            );
          }

          if (dashboardJson.loading) {
            return (
              <div>
                <Trans i18nKey="export.json.loading-text">Loading...</Trans>
              </div>
            );
          }

          return null;
        }}
      </AutoSizer>

      <Stack direction="row" wrap="wrap" alignItems="flex-start" gap={2} justifyContent="start">
        <Button data-testid={selector.saveToFileButton} variant="primary" icon="download-alt" onClick={onSaveAsFile}>
          <Trans i18nKey="export.json.save-button">Save to file</Trans>
        </Button>
        <ClipboardButton
          data-testid={selector.copyToClipboardButton}
          variant="secondary"
          icon="copy"
          disabled={dashboardJson.loading}
          getText={() => dashboardJson.value ?? ''}
        >
          <Trans i18nKey="export.json.copy-button">Copy to Clipboard</Trans>
        </ClipboardButton>
        <Button data-testid={selector.cancelButton} variant="secondary" onClick={onClose} fill="outline">
          <Trans i18nKey="export.json.cancel-button">Cancel</Trans>
        </Button>
      </Stack>
    </>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    switchItem: css({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }),
    switchItemLabel: css({
      margin: `0 0 0 ${theme.spacing(1)}`,
      alignSelf: 'center',
    }),
    codeEditorBox: css({
      margin: '16px 0px',
    }),
  };
}
