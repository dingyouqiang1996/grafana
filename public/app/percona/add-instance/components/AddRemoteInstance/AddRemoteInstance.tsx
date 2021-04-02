import React, { FC, useCallback, useMemo, useState } from 'react';
import { Form as FormFinal } from 'react-final-form';
import { Button, useTheme } from '@grafana/ui';
import { DATABASE_LABELS, Databases } from 'app/percona/shared/core';
import AddRemoteInstanceService, { toPayload } from './AddRemoteInstance.service';
import { getInstanceData } from './AddRemoteInstance.tools';
import { getStyles } from './AddRemoteInstance.styles';
import { AddRemoteInstanceProps } from './AddRemoteInstance.types';
import { AdditionalOptions, Labels, MainDetails } from './FormParts';
import { Messages } from './AddRemoteInstance.messages';
import { ExternalServiceConnectionDetails } from './FormParts/ExternalServiceConnectionDetails/ExternalServiceConnectionDetails';
import { InstanceTypes } from '../../panel.types';
import { HAProxyConnectionDetails } from './FormParts/HAProxyConnectionDetails/HAProxyConnectionDetails';
import { FormApi } from 'final-form';
import { logger } from '@percona/platform-core';

const AddRemoteInstance: FC<AddRemoteInstanceProps> = ({ instance: { type, credentials }, selectInstance }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { remoteInstanceCredentials, discoverName } = getInstanceData(type, credentials);
  const [loading, setLoading] = useState<boolean>(false);
  const initialValues: any = { ...remoteInstanceCredentials };

  if (type === Databases.mysql || type === Databases.mariadb) {
    initialValues.qan_mysql_perfschema = true;
  }

  if (type === Databases.postgresql) {
    initialValues.tracking = 'qan_postgresql_pgstatements_agent';
  }

  const onSubmit = useCallback(
    async values => {
      try {
        setLoading(true);

        if (values.isRDS) {
          await AddRemoteInstanceService.addRDS(toPayload(values, discoverName));
        } else if (values.isAzure) {
          await AddRemoteInstanceService.addAzure(toPayload(values, discoverName));
        } else {
          await AddRemoteInstanceService.addRemote(type, values);
        }

        window.location.href = '/graph/inventory/';
      } catch (e) {
        logger.error(e);
      } finally {
        setLoading(false);
      }
    },
    [type, discoverName]
  );

  const ConnectionDetails = ({ form, type }: { form: FormApi; type: InstanceTypes }) => {
    switch (type) {
      case InstanceTypes.external:
        return <ExternalServiceConnectionDetails form={form} />;
      case InstanceTypes.haproxy:
        return <HAProxyConnectionDetails remoteInstanceCredentials={remoteInstanceCredentials} />;
      default:
        return <MainDetails remoteInstanceCredentials={remoteInstanceCredentials} />;
    }
  };

  const formParts = useMemo(
    () => (form: FormApi) => (
      <>
        <ConnectionDetails form={form} type={type} />
        <Labels />
        {type !== InstanceTypes.external && (
          <AdditionalOptions
            remoteInstanceCredentials={remoteInstanceCredentials}
            loading={loading}
            instanceType={type}
            form={form}
          />
        )}
      </>
    ),
    []
  );

  const getHeader = (databaseType: string) => {
    if (databaseType === InstanceTypes.external) {
      return Messages.form.titles.addExternalService;
    }

    // @ts-ignore
    return `Add remote ${DATABASE_LABELS[databaseType]} Instance`;
  };

  return (
    <div className={styles.formWrapper}>
      <FormFinal
        onSubmit={onSubmit}
        initialValues={initialValues}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
        render={({ form, handleSubmit }) => (
          <form onSubmit={handleSubmit} data-qa="add-remote-instance-form">
            <h4 className={styles.addRemoteInstanceTitle}>{getHeader(type)}</h4>
            {formParts(form)}
            <div className={styles.addRemoteInstanceButtons}>
              <Button id="addInstance" disabled={loading}>
                {Messages.form.buttons.addService}
              </Button>
              <Button
                variant="secondary"
                onClick={() => selectInstance({ type: '' })}
                disabled={loading}
                className={styles.returnButton}
                icon="arrow-left"
              >
                {Messages.form.buttons.toMenu}
              </Button>
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default AddRemoteInstance;
