import { rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

import 'whatwg-fetch';
import { AlertmanagersChoiceResponse } from 'app/features/alerting/unified/api/alertmanagerApi';
import { mockAlertmanagerChoiceResponse } from 'app/features/alerting/unified/mocks/alertmanagerApi';
import { AlertmanagerChoice } from 'app/plugins/datasource/alertmanager/types';
import { AccessControlAction } from 'app/types';

const alertmanagerChoiceMockedResponse: AlertmanagersChoiceResponse = {
  alertmanagersChoice: AlertmanagerChoice.Internal,
  numExternalAlertmanagers: 0,
};

const folderAccess = {
  [AccessControlAction.AlertingRuleCreate]: true,
  [AccessControlAction.AlertingRuleRead]: true,
  [AccessControlAction.AlertingRuleUpdate]: true,
  [AccessControlAction.AlertingRuleDelete]: true,
};

export function createMockGrafanaServer() {
  const server = setupServer();

  mockFolderAccess(server, folderAccess);
  mockAlertmanagerChoiceResponse(server, alertmanagerChoiceMockedResponse);
  mockGrafanaIncidentPluginSettings(server);

  return server;
}

// this endpoint is used to determine of we have edit / delete permissions for the Grafana managed alert rule
// a user must alsso have permissions for the folder (namespace) in which the alert rule is stored
function mockFolderAccess(server: SetupServer, accessControl: Partial<Record<AccessControlAction, boolean>>) {
  server.use(
    rest.get('/api/folders/:uid', (req, res, ctx) => {
      const uid = req.params.uid;

      return res(
        ctx.json({
          title: 'My Folder',
          uid,
          accessControl,
        })
      );
    })
  );

  return server;
}

function mockGrafanaIncidentPluginSettings(server: SetupServer) {
  server.use(
    rest.get('/api/plugins/grafana-incident-app/settings', (_, res, ctx) => {
      return res(ctx.status(200));
    })
  );
}
