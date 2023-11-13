import { css } from '@emotion/css';
import { compact } from 'lodash';
import React, { lazy, Suspense } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, LoadingPlaceholder, Text, useStyles2 } from '@grafana/ui';
import { alertRuleApi } from 'app/features/alerting/unified/api/alertRuleApi';
import { Stack } from 'app/plugins/datasource/parca/QueryEditor/Stack';
import { AlertQuery } from 'app/types/unified-alerting-dto';

import { Folder } from '../RuleFolderPicker';

import { useGetAlertManagersMetadata } from './useGetAlertManagersSourceNamesAndImage';

const NotificationPreviewByAlertManager = lazy(() => import('./NotificationPreviewByAlertManager'));

interface NotificationPreviewProps {
  customLabels: Array<{
    key: string;
    value: string;
  }>;
  alertQueries: AlertQuery[];
  condition: string | null;
  folder: Folder | null;
  alertName?: string;
  alertUid?: string;
}

// TODO the scroll position keeps resetting when we preview
// this is to be expected because the list of routes dissapears as we start the request but is very annoying
export const NotificationPreview = ({
  alertQueries,
  customLabels,
  condition,
  folder,
  alertName,
  alertUid,
}: NotificationPreviewProps) => {
  const styles = useStyles2(getStyles);
  const disabled = !condition || !folder;

  const previewEndpoint = alertRuleApi.endpoints.preview;

  const [trigger, { data = [], isLoading, isUninitialized: previewUninitialized }] = previewEndpoint.useMutation();

  // potential instances are the instances that are going to be routed to the notification policies
  // convert data to list of labels: are the representation of the potential instances
  const potentialInstances = compact(data.flatMap((label) => label?.labels));

  const onPreview = () => {
    if (!folder || !condition) {
      return;
    }

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
  const alertManagerMetaData = useGetAlertManagersMetadata();

  const onlyOneAM = alertManagerMetaData.length === 1;

  return (
    <Stack direction="column">
      <div className={styles.routePreviewHeaderRow}>
        <div className={styles.previewHeader}>
          <Text element="h4">Alert instance routing preview</Text>
          {isLoading && previewUninitialized && (
            <Text color="secondary" variant="bodySmall">
              Loading...
            </Text>
          )}
          {previewUninitialized ? (
            <Text color="secondary" variant="bodySmall">
              When you have your folder selected and your query and labels are configured, click &quot;Preview
              routing&quot; to see the results here.
            </Text>
          ) : (
            <Text color="secondary" variant="bodySmall">
              Based on the labels added, alert instances are routed to the following notification policies. Expand each
              notification policy below to view more details.
            </Text>
          )}
        </div>
        <div className={styles.button}>
          <Button icon="sync" variant="secondary" type="button" onClick={onPreview} disabled={disabled}>
            Preview routing
          </Button>
        </div>
      </div>
      {!isLoading && !previewUninitialized && potentialInstances.length > 0 && (
        <Suspense fallback={<LoadingPlaceholder text="Loading preview..." />}>
          {alertManagerMetaData.map((alertManagerSource) => (
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
  previewHeader: css`
    margin: 0;
  `,
  routePreviewHeaderRow: css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  `,
  collapseLabel: css`
    flex: 1;
  `,
  button: css`
    justify-content: flex-end;
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
