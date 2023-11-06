import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { ComponentProps } from 'react';

import {
  createTheme,
  ExploreLogsPanelState,
  LogsSortOrder,
  standardTransformersRegistry,
  toUtc,
} from '@grafana/data/src';
import { organizeFieldsTransformer } from '@grafana/data/src/transformations/transformers/organize';
import { config } from '@grafana/runtime';

import { extractFieldsTransformer } from '../../transformers/extractFields/extractFields';

import { LogsTableWrap } from './LogsTableWrap';
import { getMockLokiFrame, getMockLokiFrameDataPlane } from './utils/testMocks.test';

const getComponent = (partialProps?: Partial<ComponentProps<typeof LogsTableWrap>>) => {
  return (
    <LogsTableWrap
      range={{
        from: toUtc('2019-01-01 10:00:00'),
        to: toUtc('2019-01-01 16:00:00'),
        raw: { from: 'now-1h', to: 'now' },
      }}
      onClickFilterOutLabel={() => undefined}
      onClickFilterLabel={() => undefined}
      updatePanelState={() => undefined}
      panelState={undefined}
      logsSortOrder={LogsSortOrder.Descending}
      splitOpen={() => undefined}
      timeZone={'utc'}
      width={50}
      logsFrames={[getMockLokiFrame()]}
      theme={createTheme()}
      {...partialProps}
    />
  );
};
const setup = (partialProps?: Partial<ComponentProps<typeof LogsTableWrap>>) => {
  return render(getComponent(partialProps));
};

describe('LogsTableWrap', () => {
  beforeAll(() => {
    const transformers = [extractFieldsTransformer, organizeFieldsTransformer];
    standardTransformersRegistry.setInit(() => {
      return transformers.map((t) => {
        return {
          id: t.id,
          aliasIds: t.aliasIds,
          name: t.name,
          transformation: t,
          description: t.description,
          editor: () => null,
        };
      });
    });
  });

  it('should render 4 table rows', async () => {
    setup();

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // tableFrame has 3 rows + 1 header row
      expect(rows.length).toBe(4);
    });
  });

  it('should render 4 table rows (dataplane)', async () => {
    config.featureToggles.lokiLogsDataplane = true;
    setup({ logsFrames: [getMockLokiFrameDataPlane()] });

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // tableFrame has 3 rows + 1 header row
      expect(rows.length).toBe(4);
    });
  });

  it('updatePanelState should be called when a column is selected', async () => {
    const updatePanelState = jest.fn() as (panelState: Partial<ExploreLogsPanelState>) => void;
    setup({
      panelState: {
        visualisationType: 'table',
        columns: undefined,
      },
      updatePanelState: updatePanelState,
    });

    expect.assertions(3);

    const checkboxLabel = screen.getByLabelText('app');
    expect(checkboxLabel).toBeInTheDocument();

    // Add a new column
    await waitFor(() => {
      checkboxLabel.click();
      expect(updatePanelState).toBeCalledWith({
        visualisationType: 'table',
        columns: { 0: 'app' },
      });
    });

    // Remove the same column
    await waitFor(() => {
      checkboxLabel.click();
      expect(updatePanelState).toBeCalledWith({
        visualisationType: 'table',
        columns: {},
      });
    });
  });

  it('search input should search matching columns', async () => {
    config.featureToggles.lokiLogsDataplane = false;
    const updatePanelState = jest.fn() as (panelState: Partial<ExploreLogsPanelState>) => void;
    setup({
      panelState: {
        visualisationType: 'table',
        columns: undefined,
      },
      updatePanelState: updatePanelState,
    });

    await waitFor(() => {
      expect(screen.getByLabelText('app')).toBeInTheDocument();
      expect(screen.getByLabelText('cluster')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search fields by name');
    fireEvent.change(searchInput, { target: { value: 'app' } });

    expect(screen.getByLabelText('app')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByLabelText('cluster')).not.toBeInTheDocument();
    });
  });

  it.only('search input should search matching columns (dataplane)', async () => {
    config.featureToggles.lokiLogsDataplane = true;

    const updatePanelState = jest.fn() as (panelState: Partial<ExploreLogsPanelState>) => void;
    setup({
      panelState: {},
      updatePanelState: updatePanelState,
      logsFrames: [getMockLokiFrameDataPlane()],
    });

    await waitFor(() => {
      expect(screen.getByLabelText('app')).toBeInTheDocument();
      expect(screen.getByLabelText('cluster')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search fields by name');
    fireEvent.change(searchInput, { target: { value: 'app' } });

    expect(screen.getByLabelText('app')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByLabelText('cluster')).not.toBeInTheDocument();
    });
  });
});
