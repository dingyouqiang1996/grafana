import React from 'react';
import { PluginListPage, Props } from './PluginListPage';
import { NavModel, PluginSignatureErrorCode, PluginMeta } from '@grafana/data';
import { mockToolkitActionCreator } from 'test/core/redux/mocks';
import { setPluginsSearchQuery } from './state/reducers';
import { render, screen, waitFor } from '@testing-library/react';
import { selectors } from '@grafana/e2e-selectors';
import { Provider } from 'react-redux';
import { configureStore } from '../../store/configureStore';
import { afterEach } from '../../../test/lib/common';

let errorsReturnMock: any = [];

jest.mock('@grafana/runtime', () => {
  const original = jest.requireActual('@grafana/runtime');
  const mockedRuntime = {
    ...original,
    getBackendSrv: () => ({
      get: () => {
        return errorsReturnMock as any;
      },
    }),
  };

  mockedRuntime.config.pluginAdminEnabled = false;

  return mockedRuntime;
});

const setup = (propOverrides?: object) => {
  const store = configureStore();
  const props: Props = {
    navModel: {
      main: {
        text: 'Configuration',
      },
      node: {
        text: 'Plugins',
      },
    } as NavModel,
    plugins: [] as PluginMeta[],
    searchQuery: '',
    setPluginsSearchQuery: mockToolkitActionCreator(setPluginsSearchQuery),
    loadPlugins: jest.fn(),
    hasFetched: false,
  };

  Object.assign(props, propOverrides);

  return render(
    <Provider store={store}>
      <PluginListPage {...props} />
    </Provider>
  );
};

describe('Render', () => {
  afterEach(() => {
    errorsReturnMock = [];
  });

  it('should render component', async () => {
    errorsReturnMock = [];
    setup();
    await waitFor(() => {
      expect(screen.queryByLabelText(selectors.pages.PluginsList.page)).toBeInTheDocument();
      expect(screen.queryByLabelText(selectors.pages.PluginsList.list)).not.toBeInTheDocument();
    });
  });

  it('should render list', async () => {
    errorsReturnMock = [];
    setup({
      hasFetched: true,
    });
    await waitFor(() => {
      expect(screen.queryByLabelText(selectors.pages.PluginsList.list)).toBeInTheDocument();
    });
  });

  describe('Plugin signature errors', () => {
    it('should render notice if there are plugins with signing errors', async () => {
      errorsReturnMock = [{ pluginId: 'invalid-sig', errorCode: PluginSignatureErrorCode.invalidSignature }];
      setup({
        hasFetched: true,
      });

      await waitFor(() =>
        expect(screen.getByLabelText(selectors.pages.PluginsList.signatureErrorNotice)).toBeInTheDocument()
      );
    });
  });
});
