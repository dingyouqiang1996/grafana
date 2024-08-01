import * as H from 'history';
import { Action, KBarProvider } from 'kbar';
import { Component, ComponentType } from 'react';
import { Provider } from 'react-redux';
import { Router, Redirect, Switch, RouteComponentProps } from 'react-router-dom';
import { CompatRouter, CompatRoute } from 'react-router-dom-v5-compat';

import { DataQuery } from '@grafana/data';
import {
  config,
  navigationLogger,
  reportInteraction,
  HistoryWrapper,
  LocationServiceProvider,
  locationService,
} from '@grafana/runtime';
import { ErrorBoundaryAlert, GlobalStyles, ModalRoot, PortalContainer, Stack, IconButton } from '@grafana/ui';
import { getAppRoutes } from 'app/routes/routes';
import { dispatch, getState, store } from 'app/store/store';

import { AngularRoot } from './angular/AngularRoot';
import { loadAndInitAngularIfEnabled } from './angular/loadAndInitAngularIfEnabled';
import { GrafanaApp } from './app';
import { AppChrome } from './core/components/AppChrome/AppChrome';
import { TOP_BAR_LEVEL_HEIGHT } from './core/components/AppChrome/types';
import { AppNotificationList } from './core/components/AppNotifications/AppNotificationList';
import { SplitPaneWrapper } from './core/components/SplitPaneWrapper/SplitPaneWrapper';
import { GrafanaContext } from './core/context/GrafanaContext';
import { ModalsContextProvider } from './core/context/ModalsContextProvider';
import { GrafanaRoute } from './core/navigation/GrafanaRoute';
import { RouteDescriptor } from './core/navigation/types';
import windowSplit from './core/reducers/windowSplit';
import { contextSrv } from './core/services/context_srv';
import { ThemeProvider } from './core/utils/ConfigProvider';
import { changeQueries } from './features/explore/state/query';
import { LiveConnectionWarning } from './features/live/LiveConnectionWarning';
import AppRootPage from './features/plugins/components/AppRootPage';
import { useDispatch, useSelector } from './types';

interface AppWrapperProps {
  app: GrafanaApp;
}

interface AppWrapperState {
  ready?: boolean;
}

/** Used by enterprise */
let bodyRenderHooks: ComponentType[] = [];
let pageBanners: ComponentType[] = [];

export function addBodyRenderHook(fn: ComponentType) {
  bodyRenderHooks.push(fn);
}

export function addPageBanner(fn: ComponentType) {
  pageBanners.push(fn);
}

export class AppWrapper extends Component<AppWrapperProps, AppWrapperState> {
  constructor(props: AppWrapperProps) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    await loadAndInitAngularIfEnabled();
    this.setState({ ready: true });
    $('.preloader').remove();
  }

  renderRoute = (route: RouteDescriptor) => {
    const roles = route.roles ? route.roles() : [];

    return (
      <CompatRoute
        exact={route.exact === undefined ? true : route.exact}
        sensitive={route.sensitive === undefined ? false : route.sensitive}
        path={route.path}
        key={route.path}
        render={(props: RouteComponentProps) => {
          // TODO[Router]: test this logic
          if (roles?.length) {
            if (!roles.some((r: string) => contextSrv.hasRole(r))) {
              return <Redirect to="/" />;
            }
          }

          return <GrafanaRoute {...props} route={route} />;
        }}
      />
    );
  };

  renderRoutes() {
    return <Switch>{getAppRoutes().map((r) => this.renderRoute(r))}</Switch>;
  }

  onChangeQueries = (newQueries: DataQuery[]) => {
    const exploreId = Object.keys(getState().explore.panes)[0];
    dispatch(changeQueries({ exploreId, queries: newQueries }));
  };

  render() {
    const { app } = this.props;
    const { ready } = this.state;

    navigationLogger('AppWrapper', false, 'rendering');

    const commandPaletteActionSelected = (action: Action) => {
      reportInteraction('command_palette_action_selected', {
        actionId: action.id,
        actionName: action.name,
      });
    };

    return (
      <Provider store={store}>
        <ErrorBoundaryAlert style="page">
          <GrafanaContext.Provider value={app.context}>
            <ThemeProvider value={config.theme2}>
              <KBarProvider
                actions={[]}
                options={{ enableHistory: true, callbacks: { onSelectAction: commandPaletteActionSelected } }}
              >
                <div className="grafana-app">
                  <WindowSplitWrapper routes={ready && this.renderRoutes()} />
                </div>
              </KBarProvider>
            </ThemeProvider>
          </GrafanaContext.Provider>
        </ErrorBoundaryAlert>
      </Provider>
    );
  }
}

function WindowSplitWrapper(props: { routes: React.ReactNode }) {
  const secondAppId = useSelector((state) => state.windowSplit.secondAppId);
  const dispatch = useDispatch();

  const history2 = new HistoryWrapper(H.createMemoryHistory({ initialEntries: ['/'] }));

  return (
    <SplitPaneWrapper
      splitOrientation="vertical"
      paneSize={0.25}
      minSize={200}
      maxSize={200 * -1}
      primary="second"
      splitVisible={!!secondAppId}
      paneStyle={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      <Router history={locationService.getHistory()}>
        <LocationServiceProvider service={locationService}>
          <CompatRouter>
            <ModalsContextProvider>
              <GlobalStyles />
              <AppChrome>
                <AngularRoot />
                <AppNotificationList />
                <Stack gap={0} grow={1} direction="column">
                  {pageBanners.map((Banner, index) => (
                    <Banner key={index.toString()} />
                  ))}
                  {props.routes}
                </Stack>
                {bodyRenderHooks.map((Hook, index) => (
                  <Hook key={index.toString()} />
                ))}
              </AppChrome>
              <LiveConnectionWarning />
              <ModalRoot />
              <PortalContainer />
            </ModalsContextProvider>
          </CompatRouter>
        </LocationServiceProvider>
      </Router>
      {secondAppId && (
        <Router history={history2.getHistory()}>
          <LocationServiceProvider service={history2}>
            <CompatRouter>
              <ModalsContextProvider>
                <GlobalStyles />
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    paddingTop: TOP_BAR_LEVEL_HEIGHT,
                    flexGrow: 1,
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      size={'lg'}
                      style={{ margin: '8px' }}
                      name={'times'}
                      aria-label={'close'}
                      onClick={() => {
                        dispatch(windowSplit.actions.closeSplitApp({ secondAppId }));
                      }}
                    />
                  </div>
                  <AppRootPage pluginId={secondAppId} />
                </div>
              </ModalsContextProvider>
            </CompatRouter>
          </LocationServiceProvider>
        </Router>
      )}
    </SplitPaneWrapper>
  );
}
