import { CheckboxField } from '@percona/platform-core';
import React, { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-final-form';

import { AppEvents } from '@grafana/data';
import { Button, HorizontalGroup, Modal } from '@grafana/ui';
import { InventoryDataService } from 'app/percona/inventory/Inventory.tools';
import { AgentsList } from 'app/percona/inventory/Inventory.types';
import { Table } from 'app/percona/shared/components/Elements/Table/Table';
import { SelectedTableRows } from 'app/percona/shared/components/Elements/Table/Table.types';
import { FormElement } from 'app/percona/shared/components/Form';
import { filterFulfilled, processPromiseResults } from 'app/percona/shared/helpers/promises';

import { appEvents } from '../../../core/app_events';
import { AGENTS_COLUMNS } from '../Inventory.constants';
import { InventoryService } from '../Inventory.service';

import { styles } from './Tabs.styles';

interface Agent {
  agent_id: string;
  [key: string]: string;
}

export const Agents = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelectedRows] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result: AgentsList = await InventoryService.getAgents();

      setData(InventoryDataService.getAgentModel(result));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const removeAgents = useCallback(
    async (agents: Array<SelectedTableRows<Agent>>, forceMode) => {
      try {
        setLoading(true);
        // eslint-disable-next-line max-len
        const requests = agents.map((agent) =>
          InventoryService.removeAgent({ agent_id: agent.original.agent_id, force: forceMode })
        );
        const results = await processPromiseResults(requests);

        const successfullyDeleted = results.filter(filterFulfilled).length;

        appEvents.emit(AppEvents.alertSuccess, [
          `${successfullyDeleted} of ${agents.length} agents successfully deleted`,
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setSelectedRows([]);
        loadData();
      }
    },
    [loadData]
  );

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.actionPanel}>
        <Button
          size="md"
          disabled={selected.length === 0}
          onClick={() => {
            setModalVisible(!modalVisible);
          }}
          icon="trash-alt"
          variant="destructive"
          className={styles.destructiveButton}
        >
          Delete
        </Button>
      </div>
      <Modal
        title={
          <div className="modal-header-title">
            <span className="p-l-1">Confirm action</span>
          </div>
        }
        isOpen={modalVisible}
        onDismiss={() => setModalVisible(false)}
      >
        <Form
          onSubmit={() => {}}
          render={({ form, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <>
                <h4 className={styles.confirmationText}>
                  Are you sure that you want to permanently delete {selected.length}{' '}
                  {selected.length === 1 ? 'agent' : 'agents'}?
                </h4>
                <FormElement
                  dataQa="form-field-force"
                  label="Force mode"
                  element={<CheckboxField name="force" label="Force mode is going to delete all associated agents" />}
                />

                <HorizontalGroup justify="space-between" spacing="md">
                  <Button variant="secondary" size="md" onClick={() => setModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="md"
                    onClick={() => {
                      removeAgents(selected, form.getState().values.force);
                      setModalVisible(false);
                    }}
                    variant="destructive"
                    className={styles.destructiveButton}
                  >
                    Proceed
                  </Button>
                </HorizontalGroup>
              </>
            </form>
          )}
        />
      </Modal>
      <div className={styles.tableInnerWrapper} data-qa="table-inner-wrapper">
        <Table
          className={styles.table}
          columns={AGENTS_COLUMNS}
          data={data}
          rowSelection
          onRowSelection={(selected) => setSelectedRows(selected)}
          noData={<h1>No agents Available</h1>}
          loading={loading}
        />
      </div>
    </div>
  );
};
