import { css } from '@emotion/css';
import { compact } from 'lodash';
import React, { lazy, Suspense } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, LoadingPlaceholder, useStyles2 } from '@grafana/ui';
import { Text } from '@grafana/ui/src/unstable';
import { alertRuleApi } from 'app/features/alerting/unified/api/alertRuleApi';
import { Stack } from 'app/plugins/datasource/parca/QueryEditor/Stack';
import { AlertQuery } from 'app/types/unified-alerting-dto';

import { Folder } from '../RuleFolderPicker';

import { useGetAlertManagersSourceNamesAndImage } from './useGetAlertManagersSourceNamesAndImage';

const NotificationPreviewByAlertManager = lazy(() => import('./NotificationPreviewByAlertManager'));

interface NotificationPreviewProps {
  customLabels: Array<{
    key: string;
    value: string;
  }>;
  alertQueries: AlertQuery[];
  condition: string;
  folder: Folder;
  alertName?: string;
  alertUid?: string;
}

export const NotificationPreview = ({
  alertQueries,
  customLabels,
  condition,
  folder,
  alertName,
  alertUid,
}: NotificationPreviewProps) => {
  const styles = useStyles2(getStyles);

  const { usePreviewMutation } = alertRuleApi;

  const [trigger, { data = [], isLoading, isUninitialized: previewUninitialized }] = usePreviewMutation();

  // potential instances are the instances that are going to be routed to the notification policies
  // convert data to list of labels: are the representation of the potential instances
  const potentialInstances = compact(data.flatMap((label) => label?.labels));

  const onPreview = () => {
    // Get the potential labels given the alert queries, the condition and the custom labels (autogenerated labels are calculated on the BE side)
    trigger({
      alertQueries: alertQueries,
      condition: condition,
      customLabels: customLabels,
      folder: folder,
      alertName: alertName,
      alertUid: alertUid,
    });
  };

  // Get list of alert managers source name + image
  const alertManagerSourceNamesAndImage = useGetAlertManagersSourceNamesAndImage();

  const onlyOneAM = alertManagerSourceNamesAndImage.length === 1;
  const renderHowToPreview = !Boolean(data?.length) && !isLoading;

  return (
    <Stack direction="column" gap={2}>
      <div className={styles.routePreviewHeaderRow}>
        <div className={styles.previewHeader}>
          <Text element="h4">Alert instance routing preview</Text>
        </div>
        <div className={styles.button}>
          <Button icon="sync" variant="secondary" type="button" onClick={onPreview}>
            Preview routing
          </Button>
        </div>
      </div>
      {!renderHowToPreview && (
        <div className={styles.textMuted}>
          Based on the labels added, alert instances are routed to the following notification policies. Expand each
          notification policy below to view more details.
        </div>
      )}
      {isLoading && <div className={styles.textMuted}>Loading...</div>}
      {renderHowToPreview && (
        <div className={styles.previewHowToText}>
          {`When your query and labels are configured, click "Preview routing" to see the results here.`}
        </div>
      )}
      {!isLoading && !previewUninitialized && potentialInstances.length > 0 && (
        <Suspense fallback={<LoadingPlaceholder text="Loading preview..." />}>
          {alertManagerSourceNamesAndImage.map((alertManagerSource) => (
            <NotificationPreviewByAlertManager
              alertManagerSource={alertManagerSource}
              potentialInstances={potentialInstances}
              onlyOneAM={onlyOneAM}
              key={alertManagerSource.name}
            />
          ))}
        </Suspense>
      )}
    </Stack>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  collapsableSection: css`
    width: auto;
    border: 0;
  `,
  textMuted: css`
    color: ${theme.colors.text.secondary};
  `,
  previewHowToText: css`
    display: flex;
    color: ${theme.colors.text.secondary};
    justify-content: center;
    font-size: ${theme.typography.size.sm};
  `,
  previewHeader: css`
    margin: 0;
  `,
  routePreviewHeaderRow: css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `,
  collapseLabel: css`
    flex: 1;
  `,
  button: css`
    justify-content: flex-end;
    display: flex;
  `,
  tagsInDetails: css`
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  `,
  policyPathItemMatchers: css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(1)};
  `,
});
