/* eslint-disable react/display-name */
import { TextInputField, TextareaInputField, validators, Modal, CheckboxField } from '@percona/platform-core';
import React, { FC, useCallback, useState } from 'react';
import { Form, FormRenderProps } from 'react-final-form';

import { Button, HorizontalGroup, useStyles } from '@grafana/ui';
import { Messages } from 'app/percona/dbaas/DBaaS.messages';
import { Table } from 'app/percona/shared/components/Elements/Table/Table';
import { Databases } from 'app/percona/shared/core';

import { AddClusterButton } from '../AddClusterButton/AddClusterButton';

import { clusterActionsRender } from './ColumnRenderers/ColumnRenderers';
import { getStyles } from './Kubernetes.styles';
import { NewKubernetesCluster, KubernetesProps, Kubernetes, OperatorToUpdate } from './Kubernetes.types';
import { KubernetesClusterStatus } from './KubernetesClusterStatus/KubernetesClusterStatus';
import { ManageComponentsVersionsModal } from './ManageComponentsVersionsModal/ManageComponentsVersionsModal';
import { UpdateOperatorModal } from './OperatorStatusItem/KubernetesOperatorStatus/UpdateOperatorModal/UpdateOperatorModal';
import { OperatorStatusItem } from './OperatorStatusItem/OperatorStatusItem';
import { ViewClusterConfigModal } from './ViewClusterConfigModal/ViewClusterConfigModal';

export const KubernetesInventory: FC<KubernetesProps> = ({
  kubernetes,
  deleteKubernetes,
  addKubernetes,
  getKubernetes,
  setLoading,
  loading,
}) => {
  const styles = useStyles(getStyles);
  const [selectedCluster, setSelectedCluster] = useState<Kubernetes | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewConfigModalVisible, setViewConfigModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manageComponentsModalVisible, setManageComponentsModalVisible] = useState(false);
  const [operatorToUpdate, setOperatorToUpdate] = useState<OperatorToUpdate | null>(null);
  const [updateOperatorModalVisible, setUpdateOperatorModalVisible] = useState(false);
  const { required } = validators;

  const deleteKubernetesCluster = useCallback(
    (force?: boolean) => {
      if (selectedCluster) {
        deleteKubernetes(selectedCluster, force);
        setDeleteModalVisible(false);
      }
    },
    [selectedCluster, deleteKubernetes]
  );

  const columns = [
    {
      Header: Messages.kubernetes.table.nameColumn,
      accessor: 'kubernetesClusterName',
    },
    {
      Header: Messages.kubernetes.table.clusterStatusColumn,
      accessor: (element: Kubernetes) => <KubernetesClusterStatus status={element.status} />,
    },
    {
      Header: Messages.kubernetes.table.operatorsColumn,
      accessor: (element: Kubernetes) => (
        <div>
          <OperatorStatusItem
            databaseType={Databases.mysql}
            operator={element.operators.xtradb}
            kubernetes={element}
            setSelectedCluster={setSelectedCluster}
            setOperatorToUpdate={setOperatorToUpdate}
            setUpdateOperatorModalVisible={setUpdateOperatorModalVisible}
          />
          <OperatorStatusItem
            databaseType={Databases.mongodb}
            operator={element.operators.psmdb}
            kubernetes={element}
            setSelectedCluster={setSelectedCluster}
            setOperatorToUpdate={setOperatorToUpdate}
            setUpdateOperatorModalVisible={setUpdateOperatorModalVisible}
          />
        </div>
      ),
    },
    {
      Header: Messages.kubernetes.table.actionsColumn,
      accessor: (kubernetesCluster: Kubernetes) =>
        clusterActionsRender({
          setSelectedCluster,
          setDeleteModalVisible,
          setViewConfigModalVisible,
          setManageComponentsModalVisible,
        })(kubernetesCluster),
    },
  ];

  const AddNewClusterButton = useCallback(
    () => (
      <AddClusterButton
        label={Messages.kubernetes.addAction}
        action={() => setAddModalVisible(!addModalVisible)}
        data-qa="kubernetes-new-cluster-button"
      />
    ),
    [addModalVisible]
  );

  return (
    <div>
      <div className={styles.actionPanel}>
        <AddNewClusterButton />
      </div>
      {selectedCluster && (
        <ViewClusterConfigModal
          isVisible={viewConfigModalVisible}
          setVisible={() => setViewConfigModalVisible(false)}
          selectedCluster={selectedCluster}
        />
      )}
      <Modal
        title={Messages.kubernetes.addModal.title}
        isVisible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      >
        <Form
          onSubmit={(values: NewKubernetesCluster) => {
            addKubernetes(values);
            setAddModalVisible(false);
          }}
          render={({ handleSubmit, valid, pristine }: FormRenderProps<NewKubernetesCluster>) => (
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

                <HorizontalGroup justify="center" spacing="md">
                  <Button
                    data-qa="kubernetes-add-cluster-button"
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
      <Modal
        title={Messages.kubernetes.deleteModal.title}
        isVisible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <Form
          onSubmit={() => {}}
          render={({ form, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <>
                <h4 className={styles.deleteModalContent}>{Messages.kubernetes.deleteModal.confirmMessage}</h4>
                <CheckboxField name="force" label={Messages.kubernetes.deleteModal.labels.force} />
                <HorizontalGroup justify="space-between" spacing="md">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setDeleteModalVisible(false)}
                    data-qa="cancel-delete-kubernetes-button"
                  >
                    {Messages.kubernetes.deleteModal.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    size="md"
                    onClick={() => deleteKubernetesCluster(Boolean(form.getState().values.force))}
                    data-qa="delete-kubernetes-button"
                  >
                    {Messages.kubernetes.deleteModal.confirm}
                  </Button>
                </HorizontalGroup>
              </>
            </form>
          )}
        />
      </Modal>
      {selectedCluster && manageComponentsModalVisible && (
        <ManageComponentsVersionsModal
          selectedKubernetes={selectedCluster}
          isVisible={manageComponentsModalVisible}
          setVisible={setManageComponentsModalVisible}
        />
      )}
      {selectedCluster && operatorToUpdate && updateOperatorModalVisible && (
        <UpdateOperatorModal
          kubernetesClusterName={selectedCluster.kubernetesClusterName}
          isVisible={updateOperatorModalVisible}
          selectedOperator={operatorToUpdate}
          setVisible={setUpdateOperatorModalVisible}
          setLoading={setLoading}
          setSelectedCluster={setSelectedCluster}
          setOperatorToUpdate={setOperatorToUpdate}
          onOperatorUpdated={getKubernetes}
        />
      )}
      <Table columns={columns} data={kubernetes} loading={loading} noData={<AddNewClusterButton />} />
    </div>
  );
};
