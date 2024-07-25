import { config } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

import { Trans, t } from '../../core/internationalization';

import { Page as CloudPage } from './cloud/Page';
import { Page as OnPremPage } from './onprem/Page';

export default function MigrateToCloud() {
  const feedbackURL = config.cloudMigrationFeedbackURL;
  return (
    <Page navId="migrate-to-cloud">
      <Alert
        title={t('migrate-to-cloud.public-preview.title', 'Migrate to Grafana Cloud is in public preview')}
        severity={'info'}
        onRemove={
          feedbackURL
            ? () => {
                window.location.href = feedbackURL;
              }
            : undefined
        }
        buttonContent={'Give feedback'}
      >
        <Trans i18nKey="migrate-to-cloud.public-preview.message">
          Help us improve this feature by providing feedback and reporting any issues.
        </Trans>
      </Alert>
      {config.cloudMigrationIsTarget ? <CloudPage /> : <OnPremPage />}
    </Page>
  );
}
