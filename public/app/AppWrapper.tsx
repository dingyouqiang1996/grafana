import React from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';
import { config, locationService, navigationLogger } from '@grafana/runtime';
import { Provider } from 'react-redux';
import { store } from 'app/store/store';
import { ErrorBoundaryAlert, ModalRoot, ModalsProvider } from '@grafana/ui';
import { GrafanaApp } from './app';
import { getAppRoutes } from 'app/routes/routes';
import { ConfigContext, ThemeProvider } from './core/utils/ConfigProvider';
import { RouteDescriptor } from './core/navigation/types';
import { contextSrv } from './core/services/context_srv';
import { SideMenu } from './core/components/sidemenu/SideMenu';
import { GrafanaRoute } from './core/navigation/GrafanaRoute';
import { AppNotificationList } from './core/components/AppNotifications/AppNotificationList';
import { SearchWrapper } from 'app/features/search';

interface AppWrapperProps {
  app: GrafanaApp;
}

interface AppWrapperState {
  ngInjector: any;
}

export class AppWrapper extends React.Component<AppWrapperProps, AppWrapperState> {
  container = React.createRef<HTMLDivElement>();

  constructor(props: AppWrapperProps) {
    super(props);

    this.state = {
      ngInjector: null,
    };
  }

  componentDidMount() {
    if (this.container) {
      this.bootstrapNgApp();
    } else {
      throw new Error('Failed to boot angular app, no container to attach to');
    }
  }

  bootstrapNgApp() {
    const injector = this.props.app.angularApp.bootstrap();
    this.setState({ ngInjector: injector });
  }

  renderRoute = (route: RouteDescriptor) => {
    const roles = route.roles ? route.roles() : [];
    console.log('render route');

    return (
      <Route
        exact
        path={route.path}
        key={`${route.path}`}
        render={(props) => {
          navigationLogger('AppWrapper', false, 'Rendering route', route, 'with match', props.location);
          // TODO[Router]: test this logic
          if (roles && roles.length) {
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
    navigationLogger('AppWrapper', false, 'rendering');

    // @ts-ignore
    const appSeed = `<grafana-app ng-cloak></app-notifications-list><div id="ngRoot"></div></grafana-app>`;

    return (
      <Provider store={store}>
        <ErrorBoundaryAlert style="page">
          <ConfigContext.Provider value={config}>
            <ThemeProvider>
              <ModalsProvider>
                <div className="grafana-app">
                  <Router history={locationService.getHistory()}>
                    <SideMenu />
                    <div className="main-view">
                      <div
                        ref={this.container}
                        dangerouslySetInnerHTML={{
                          __html: appSeed,
                        }}
                      />
                      <AppNotificationList />
                      <SearchWrapper />
                      {this.state.ngInjector && this.container && this.renderRoutes()}
                    </div>
                  </Router>
                </div>
                <ModalRoot />
              </ModalsProvider>
            </ThemeProvider>
          </ConfigContext.Provider>
        </ErrorBoundaryAlert>
      </Provider>
    );
  }
}
