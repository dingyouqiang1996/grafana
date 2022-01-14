import { dataQa } from '@percona/platform-core';
import React from 'react';

import { getMount } from 'app/percona/shared/helpers/testUtils';

import { dbClustersStub } from '../__mocks__/dbClustersStubs';

import { EditDBClusterModal } from './EditDBClusterModal';
import { setVisibleStub, onDBClusterAddedStub } from './__mocks__/addDBClusterModalStubs';

jest.mock('app/core/app_events');
jest.mock('../DBCluster.service');
jest.mock('../PSMDB.service');
jest.mock('../XtraDB.service');

describe('EditDBClusterModal::', () => {
  it('should render advanced options', async () => {
    const root = await getMount(
      <EditDBClusterModal
        isVisible
        setVisible={setVisibleStub}
        onDBClusterChanged={onDBClusterAddedStub}
        selectedCluster={dbClustersStub[0]}
      />
    );

    expect(root.find(dataQa('resources-radio-button'))).toBeTruthy();
    expect(root.find(dataQa('memory-field-container'))).toBeTruthy();
    expect(root.find(dataQa('cpu-field-container'))).toBeTruthy();
    expect(root.find(dataQa('disk-field-container'))).toBeTruthy();
    expect(root.find(dataQa('disk-number-input')).prop('disabled')).toBeTruthy();
    expect(root.find(dataQa('resources-bar'))).toBeTruthy();
  });
});
