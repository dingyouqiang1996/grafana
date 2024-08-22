import { css } from '@emotion/css';
import * as H from 'history';
import { Action, KBarProvider } from 'kbar';
import { Component, ComponentType } from 'react';
import { Provider } from 'react-redux';
import { Router, Redirect, Switch, RouteComponentProps } from 'react-router-dom';
import { CompatRouter, CompatRoute } from 'react-router-dom-v5-compat';

import {
  config,
  HistoryWrapper,
  locationService,
  LocationServiceProvider,
  navigationLogger,
  reportInteraction,
} from '@grafana/runtime';
import {
  ErrorBoundaryAlert,
  GlobalStyles,
  ModalRoot,
  PortalContainer,
  Stack,
  IconButton,
  useSplitter,
  useStyles2,
} from '@grafana/ui';
import { getAppRoutes } from 'app/routes/routes';
import { store } from 'app/store/store';

import { AngularRoot } from './angular/AngularRoot';
import { loadAndInitAngularIfEnabled } from './angular/loadAndInitAngularIfEnabled';
import { GrafanaApp } from './app';
import { AppChrome } from './core/components/AppChrome/AppChrome';
import { TOP_BAR_LEVEL_HEIGHT } from './core/components/AppChrome/types';
import { AppNotificationList } from './core/components/AppNotifications/AppNotificationList';
import { GrafanaContext } from './core/context/GrafanaContext';
import { ModalsContextProvider } from './core/context/ModalsContextProvider';
import { SidecarContext, useSidecar } from './core/context/SidecarContext';
import { GrafanaRoute } from './core/navigation/GrafanaRoute';
import { RouteDescriptor } from './core/navigation/types';
import { sidecarService } from './core/services/SidecarService';
import { contextSrv } from './core/services/context_srv';
import { ThemeProvider } from './core/utils/ConfigProvider';
import { LiveConnectionWarning } from './features/live/LiveConnectionWarning';
import AppRootPage from './features/plugins/components/AppRootPage';

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
                <SidecarContext.Provider value={sidecarService}>
                  <div className="grafana-app">
                    {config.featureToggles.appSidecar ? (
                      <ExperimentalSplitPaneTree routes={ready && this.renderRoutes()} />
                    ) : (
                      <RouterTree routes={ready && this.renderRoutes()} />
                    )}
                  </div>
                </SidecarContext.Provider>
              </KBarProvider>
            </ThemeProvider>
          </GrafanaContext.Provider>
        </ErrorBoundaryAlert>
      </Provider>
    );
  }
}

function RouterTree(props: { routes?: JSX.Element | false }) {
  return (
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
  );
}

/**
 * Renders both the main app tree and a secondary sidecar app tree to show 2 apps at the same time in a resizable split
 * view.
 * @param props
 * @constructor
 */
function ExperimentalSplitPaneTree(props: { routes?: JSX.Element | false }) {
  const { activePluginId, closeApp } = useSidecar();

  let { containerProps, primaryProps, secondaryProps, splitterProps } = useSplitter({
    direction: 'row',
    initialSize: 0.6,
    dragPosition: 'end',
  });

  // The style changes allow the resizing to be more flexible and not constrained by the content dimensions. In the
  // future this could be a switch in the useSplitter but for now it's here until this feature is more final.
  function alterStyles<T extends { style: React.CSSProperties }>(props: T): T {
    return {
      ...props,
      style: { ...props.style, overflow: 'auto', minWidth: 'unset', minHeight: 'unset' },
    };
  }
  primaryProps = alterStyles(primaryProps);
  secondaryProps = alterStyles(secondaryProps);

  const styles = useStyles2(getStyles);
  const memoryLocationService = new HistoryWrapper(H.createMemoryHistory({ initialEntries: ['/'] }));

  return (
    <div {...(activePluginId ? containerProps : { className: 'grafana-app' })}>
      <div {...(activePluginId ? primaryProps : { className: 'grafana-app' })}>
        <RouterTree routes={props.routes} />
      </div>
      {/* Sidecar */}
      {activePluginId && (
        <>
          <div {...splitterProps} />
          <div {...secondaryProps}>
            <Router history={memoryLocationService.getHistory()}>
              <LocationServiceProvider service={memoryLocationService}>
                <CompatRouter>
                  <ModalsContextProvider>
                    <GlobalStyles />
                    <div className={styles.secondAppWrapper}>
                      <div className={styles.secondAppToolbar}>
                        <IconButton
                          size={'lg'}
                          style={{ margin: '8px' }}
                          name={'times'}
                          aria-label={'close'}
                          onClick={() => closeApp(activePluginId)}
                        />
                      </div>
                      <AppRootPage pluginId={activePluginId} />
                    </div>
                  </ModalsContextProvider>
                </CompatRouter>
              </LocationServiceProvider>
            </Router>
          </div>
        </>
      )}
    </div>
  );
}

const getStyles = () => {
  return {
    secondAppWrapper: css({
      label: 'secondAppWrapper',
      display: 'flex',
      height: '100%',
      paddingTop: TOP_BAR_LEVEL_HEIGHT * 2,
      flexGrow: 1,
      flexDirection: 'column',
    }),

    secondAppToolbar: css({
      label: 'secondAppToolbar',
      display: 'flex',
      justifyContent: 'flex-end',
    }),
  };
};
