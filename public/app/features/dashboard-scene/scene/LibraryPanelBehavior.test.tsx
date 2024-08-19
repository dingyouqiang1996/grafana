import { of } from 'rxjs';

import { FieldType, LoadingState, PanelData, getDefaultTimeRange, toDataFrame } from '@grafana/data';
import { getPanelPlugin } from '@grafana/data/test/__mocks__/pluginMocks';
import { setPluginImportUtils, setRunRequest } from '@grafana/runtime';
import { SceneCanvasText, SceneGridLayout, SceneQueryRunner, VizPanel } from '@grafana/scenes';
import * as libpanels from 'app/features/library-panels/state/api';

import { vizPanelToPanel } from '../serialization/transformSceneToSaveModel';
import { activateFullSceneTree } from '../utils/test-utils';

import { DashboardGridItem } from './DashboardGridItem';
import { DashboardScene } from './DashboardScene';
import { LibraryPanelBehavior } from './LibraryPanelBehavior';
import { VizPanelLinks, VizPanelLinksMenu } from './PanelLinks';

setPluginImportUtils({
  importPanelPlugin: (id: string) => Promise.resolve(getPanelPlugin({})),
  getPanelPluginFromCache: (id: string) => undefined,
});

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  setPluginExtensionGetter: jest.fn(),
  getPluginLinkExtensions: jest.fn(() => ({
    extensions: [],
  })),
  getDataSourceSrv: () => {
    return {
      get: jest.fn().mockResolvedValue({
        getRef: () => ({ uid: 'ds1' }),
      }),
      getInstanceSettings: jest.fn().mockResolvedValue({ uid: 'ds1' }),
    };
  },
}));

const runRequestMock = jest.fn().mockReturnValue(
  of<PanelData>({
    state: LoadingState.Done,
    timeRange: getDefaultTimeRange(),
    series: [
      toDataFrame({
        fields: [{ name: 'value', type: FieldType.number, values: [1, 2, 3] }],
      }),
    ],
    request: {
      app: 'dashboard',
      requestId: 'request-id',
      dashboardUID: 'asd',
      interval: '1s',
      panelId: 1,
      range: getDefaultTimeRange(),
      targets: [],
      timezone: 'utc',
      intervalMs: 1000,
      startTime: 1,
      scopedVars: {
        __sceneObject: { value: new SceneCanvasText({ text: 'asd' }) },
      },
    },
  })
);

setRunRequest(runRequestMock);

describe('LibraryPanelBehavior', () => {
  it('should load library panel', async () => {
    const { gridItem, spy } = await buildTestSceneWithLibraryPanel();

    const behavior = gridItem.state.body.state.$behaviors![0] as LibraryPanelBehavior;
    expect(behavior).toBeDefined();

    expect(behavior.state.isLoaded).toBe(true);
    expect(behavior.state._loadedPanel).toBeDefined();
    expect(behavior.state._loadedPanel?.model).toBeDefined();
    expect(behavior.state._loadedPanel?.name).toBe('LibraryPanel A');
    expect(behavior.state._loadedPanel?.type).toBe('table');

    expect(spy).toHaveBeenCalled();
  });

  it('should not update panel if version is the same', async () => {
    const { gridItem } = await buildTestSceneWithLibraryPanel();

    const behavior = gridItem.state.body.state.$behaviors![0] as LibraryPanelBehavior;
    expect(behavior).toBeDefined();

    const panel = vizPanelToPanel(gridItem.state.body.clone({ $behaviors: undefined }));

    const libraryPanelState = {
      name: 'LibraryPanel B',
      title: 'LibraryPanel B title',
      uid: '222',
      type: 'table',
      version: 1,
      model: panel,
    };

    behavior.setPanelFromLibPanel(libraryPanelState);

    expect(behavior.state._loadedPanel?.name).toBe('LibraryPanel A');
    expect(behavior.state._loadedPanel?.uid).toBe('111');
  });

  it('should not update panel if behavior not part of a vizPanel', async () => {
    const { gridItem } = await buildTestSceneWithLibraryPanel();

    const behavior = gridItem.state.body.state.$behaviors![0] as LibraryPanelBehavior;
    expect(behavior).toBeDefined();

    const panel = vizPanelToPanel(gridItem.state.body.clone({ $behaviors: undefined }));

    const libraryPanelState = {
      name: 'LibraryPanel B',
      title: 'LibraryPanel B title',
      uid: '222',
      type: 'table',
      version: 2,
      model: panel,
    };

    const behaviorClone = behavior.clone();
    behaviorClone.setPanelFromLibPanel(libraryPanelState);

    expect(behaviorClone.state._loadedPanel?.name).toBe('LibraryPanel A');
    expect(behaviorClone.state._loadedPanel?.uid).toBe('111');
  });

  it('should not update panel if panel not part of a vigridItemzPanel', async () => {
    const { gridItem } = await buildTestSceneWithLibraryPanel();

    const behavior = gridItem.state.body.state.$behaviors![0] as LibraryPanelBehavior;
    expect(behavior).toBeDefined();

    const panel = vizPanelToPanel(gridItem.state.body.clone({ $behaviors: undefined }));

    const libraryPanelState = {
      name: 'LibraryPanel B',
      title: 'LibraryPanel B title',
      uid: '222',
      type: 'table',
      version: 2,
      model: panel,
    };

    const vizPanelClone = gridItem.state.body.clone();
    const behaviorClone = vizPanelClone.state.$behaviors![0] as LibraryPanelBehavior;
    behaviorClone.setPanelFromLibPanel(libraryPanelState);

    expect(behaviorClone.state._loadedPanel?.name).toBe('LibraryPanel A');
    expect(behaviorClone.state._loadedPanel?.uid).toBe('111');
  });
});

async function buildTestSceneWithLibraryPanel() {
  const libraryPanel = new VizPanel({
    title: 'Panel A',
    pluginId: 'table',
    key: 'panel-1',
    $behaviors: [new LibraryPanelBehavior({ title: 'LibraryPanel A title', name: 'LibraryPanel A', uid: '111' })],
    titleItems: [new VizPanelLinks({ menu: new VizPanelLinksMenu({}) })],
    $data: new SceneQueryRunner({
      datasource: { uid: 'abcdef' },
      queries: [{ refId: 'A' }],
    }),
  });

  const panel = vizPanelToPanel(libraryPanel.clone({ $behaviors: undefined }));

  const libraryPanelState = {
    name: 'LibraryPanel A',
    title: 'LibraryPanel A title',
    uid: '111',
    model: panel,
    type: 'table',
    version: 1,
  };

  const spy = jest.spyOn(libpanels, 'getLibraryPanel').mockResolvedValue({ ...libraryPanelState, ...panel });

  const gridItem = new DashboardGridItem({
    key: 'griditem-1',
    x: 0,
    y: 0,
    width: 10,
    height: 12,
    body: libraryPanel,
  });

  const scene = new DashboardScene({
    title: 'hello',
    uid: 'dash-1',
    meta: {
      canEdit: true,
    },
    body: new SceneGridLayout({
      children: [gridItem],
    }),
  });

  activateFullSceneTree(scene);

  await new Promise((r) => setTimeout(r, 1));

  return { scene, gridItem, spy };
}
