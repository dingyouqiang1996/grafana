import React, { useState, useEffect } from 'react';

import { CoreApp } from '@grafana/data';
import { Modal } from '@grafana/ui';
import { LocalStorageValueProvider } from 'app/core/components/LocalStorageValueProvider';

import { LokiLabelBrowser } from '../../components/LokiLabelBrowser';
import { LokiDatasource } from '../../datasource';
import { LokiQuery } from '../../types';

export interface Props {
  isOpen: boolean;
  datasource: LokiDatasource;
  query: LokiQuery;
  app?: CoreApp;
  onClose: () => void;
  onChange: (query: LokiQuery) => void;
  onRunQuery: () => void;
}

export const LabelBrowserModal = (props: Props) => {
  const { isOpen, onClose, datasource, app } = props;
  const [labelsLoaded, setLabelsLoaded] = useState(false);
  const LAST_USED_LABELS_KEY = 'grafana.datasources.loki.browser.labels';

  useEffect(() => {
    datasource.languageProvider.start().then(() => {
      setLabelsLoaded(true);
    });
  }, [datasource]);

  const changeQuery = (value: string) => {
    const { query, onChange, onRunQuery } = props;
    const nextQuery = { ...query, expr: value };
    onChange(nextQuery);
    onRunQuery();
  };

  const onChange = (selector: string) => {
    changeQuery(selector);
    onClose();
  };

  const getChooserText = (logLabelsLoaded: boolean, hasLogLabels: boolean) => {
    if (!logLabelsLoaded) {
      return 'Loading labels...';
    }
    if (!hasLogLabels) {
      return '(No labels found)';
    }
    return 'Label browser';
  };

  const hasLogLabels = datasource.languageProvider.getLabelKeys().length > 0;
  const labelBrowserText = getChooserText(labelsLoaded, hasLogLabels);

  if (labelBrowserText === 'Loading labels...') {
    return (
      <Modal title="Label browser" isOpen={isOpen} onDismiss={onClose}>
        <p>Loading labels...</p>
      </Modal>
    );
  }

  if (labelBrowserText === '(No labels found)') {
    return (
      <Modal title="Label browser" isOpen={isOpen} onDismiss={onClose}>
        <p>No labels found.</p>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} title="Label browser" onDismiss={onClose}>
      <LocalStorageValueProvider<string[]> storageKey={LAST_USED_LABELS_KEY} defaultValue={[]}>
        {(lastUsedLabels, onLastUsedLabelsSave, onLastUsedLabelsDelete) => {
          return (
            <LokiLabelBrowser
              languageProvider={datasource.languageProvider}
              onChange={onChange}
              lastUsedLabels={lastUsedLabels}
              storeLastUsedLabels={onLastUsedLabelsSave}
              deleteLastUsedLabels={onLastUsedLabelsDelete}
              app={app}
            />
          );
        }}
      </LocalStorageValueProvider>
    </Modal>
  );
};
