import {
  CheckboxField,
  Modal,
  PasswordInputField,
  TextareaInputField,
  TextInputField,
  validators,
} from '@percona/platform-core';
import React from 'react';
import { Form, FormRenderProps } from 'react-final-form';

import { Button, HorizontalGroup, useStyles } from '@grafana/ui';
import { Messages } from 'app/percona/dbaas/DBaaS.messages';

import { PMMServerUrlWarning } from '../../PMMServerURLWarning/PMMServerUrlWarning';
import { NewKubernetesCluster } from '../Kubernetes.types';

import { AWS_CREDENTIALS_DOC_LINK } from './AddKubernetesModal.constants';
import { Messages as ModalMessages } from './AddKubernetesModal.messages';
import { getStyles } from './AddKubernetesModal.styles';
import { AddKubernetesModalProps } from './AddKubernetesModal.types';

const { required } = validators;
const {
  isEKSCheckboxLabel,
  isEKSCheckboxTooltip,
  awsAccessKeyIDLabel,
  awsAccessKeyIDTooltip,
  awsSecretAccessKeyLabel,
  awsSecretAccessKeyTooltip,
} = ModalMessages;

export const AddKubernetesModal = ({
  isVisible,
  addKubernetes,
  setAddModalVisible,
  showMonitoringWarning,
}: AddKubernetesModalProps) => {
  const styles = useStyles(getStyles);

  return (
    <Modal title={Messages.kubernetes.addModal.title} isVisible={isVisible} onClose={() => setAddModalVisible(false)}>
      {showMonitoringWarning && <PMMServerUrlWarning className={styles.urlWarningWrapper} />}
      <Form
        onSubmit={(values: NewKubernetesCluster) => {
          addKubernetes(values);
          setAddModalVisible(false);
        }}
        render={({ handleSubmit, valid, pristine, values: { isEKS } }: FormRenderProps<NewKubernetesCluster>) => (
          <form onSubmit={handleSubmit}>
            <>
              <TextInputField
                name="name"
                label={Messages.kubernetes.addModal.fields.clusterName}
                validators={[required]}
              />
              <TextareaInputField
                name="kubeConfig"
                label={Messages.kubernetes.addModal.fields.kubeConfig}
                validators={[required]}
              />
              <CheckboxField
                name="isEKS"
                label={isEKSCheckboxLabel}
                fieldClassName={styles.checkbox}
                tooltipIcon="info-circle"
                tooltipText={isEKSCheckboxTooltip}
              />
              {isEKS && (
                <>
                  <TextInputField
                    name="awsAccessKeyID"
                    label={awsAccessKeyIDLabel}
                    tooltipIcon="info-circle"
                    tooltipText={awsAccessKeyIDTooltip}
                    tooltipLink={AWS_CREDENTIALS_DOC_LINK}
                    validators={[required]}
                  />
                  <PasswordInputField
                    name="awsSecretAccessKey"
                    label={awsSecretAccessKeyLabel}
                    tooltipIcon="info-circle"
                    tooltipText={awsSecretAccessKeyTooltip}
                    tooltipLink={AWS_CREDENTIALS_DOC_LINK}
                    validators={[required]}
                  />
                </>
              )}
              <HorizontalGroup justify="center" spacing="md">
                <Button
                  type="submit"
                  data-testid="kubernetes-add-cluster-button"
                  size="md"
                  variant="primary"
                  disabled={!valid || pristine}
                >
                  {Messages.kubernetes.addModal.confirm}
                </Button>
              </HorizontalGroup>
            </>
          </form>
        )}
      />
    </Modal>
  );
};
