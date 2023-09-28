import { uniq } from 'lodash';
import React from 'react';

import { SafeDynamicImport } from 'app/core/components/DynamicImports/SafeDynamicImport';
import { NavLandingPage } from 'app/core/components/NavLandingPage/NavLandingPage';
import { config } from 'app/core/config';
import { RouteDescriptor } from 'app/core/navigation/types';
import { AccessControlAction } from 'app/types';

import { evaluateAccess } from './unified/utils/access-control';

const commonRoutes: RouteDescriptor[] = [];

const legacyRoutes: RouteDescriptor[] = [
  ...commonRoutes,
  {
    path: '/alerting',
    component: () => <NavLandingPage navId="alerting-legacy" />,
  },
  {
    path: '/alerting/list',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertRuleListIndex" */ 'app/features/alerting/AlertRuleList')
    ),
  },
  {
    path: '/alerting/ng/list',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertRuleList" */ 'app/features/alerting/AlertRuleList')
    ),
  },
  {
    path: '/alerting/notifications',
    roles: config.unifiedAlertingEnabled ? () => ['Editor', 'Admin'] : undefined,
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/NotificationsListPage')
    ),
  },
  {
    path: '/alerting/notifications/templates/new',
    roles: () => ['Editor', 'Admin'],
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/NotificationsListPage')
    ),
  },
  {
    path: '/alerting/notifications/templates/:id/edit',
    roles: () => ['Editor', 'Admin'],
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/NotificationsListPage')
    ),
  },
  {
    path: '/alerting/notifications/receivers/new',
    roles: () => ['Editor', 'Admin'],
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/NotificationsListPage')
    ),
  },
  {
    path: '/alerting/notifications/receivers/:id/edit',
    roles: () => ['Editor', 'Admin'],
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/NotificationsListPage')
    ),
  },
  {
    path: '/alerting/notifications/global-config',
    roles: () => ['Admin', 'Editor'],
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/NotificationsListPage')
    ),
  },
  {
    path: '/alerting/notification/new',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NewNotificationChannel" */ 'app/features/alerting/NewNotificationChannelPage')
    ),
  },
  {
    path: '/alerting/notification/:id/edit',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "EditNotificationChannel"*/ 'app/features/alerting/EditNotificationChannelPage')
    ),
  },
];

const unifiedRoutes: RouteDescriptor[] = [
  ...commonRoutes,
  {
    path: '/alerting',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingHome" */ 'app/features/alerting/unified/home/Home')
    ),
  },
  {
    path: '/alerting/home',
    exact: false,
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingHome" */ 'app/features/alerting/unified/home/Home')
    ),
  },
  {
    path: '/alerting/list',
    roles: evaluateAccess([AccessControlAction.AlertingRuleRead, AccessControlAction.AlertingRuleExternalRead]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertRuleListIndex" */ 'app/features/alerting/unified/RuleList')
    ),
  },
  {
    path: '/alerting/routes',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsRead,
      AccessControlAction.AlertingNotificationsExternalRead,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertAmRoutes" */ 'app/features/alerting/unified/NotificationPolicies')
    ),
  },
  {
    path: '/alerting/routes/mute-timing/new',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsWrite,
      AccessControlAction.AlertingNotificationsExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "MuteTimings" */ 'app/features/alerting/unified/MuteTimings')
    ),
  },
  {
    path: '/alerting/routes/mute-timing/edit',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsWrite,
      AccessControlAction.AlertingNotificationsExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "MuteTimings" */ 'app/features/alerting/unified/MuteTimings')
    ),
  },
  {
    path: '/alerting/silences',
    roles: evaluateAccess([
      AccessControlAction.AlertingInstanceRead,
      AccessControlAction.AlertingInstancesExternalRead,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertSilences" */ 'app/features/alerting/unified/Silences')
    ),
  },
  {
    path: '/alerting/silence/new',
    roles: evaluateAccess([
      AccessControlAction.AlertingInstanceCreate,
      AccessControlAction.AlertingInstancesExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertSilences" */ 'app/features/alerting/unified/Silences')
    ),
  },
  {
    path: '/alerting/silence/:id/edit',
    roles: evaluateAccess([
      AccessControlAction.AlertingInstanceUpdate,
      AccessControlAction.AlertingInstancesExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertSilences" */ 'app/features/alerting/unified/Silences')
    ),
  },
  {
    path: '/alerting/notifications',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsRead,
      AccessControlAction.AlertingNotificationsExternalRead,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/unified/Receivers')
    ),
  },
  {
    path: '/alerting/notifications/:type/new',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsWrite,
      AccessControlAction.AlertingNotificationsExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/unified/Receivers')
    ),
  },
  {
    path: '/alerting/notifications/:type/:id/edit',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsWrite,
      AccessControlAction.AlertingNotificationsExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/unified/Receivers')
    ),
  },
  {
    path: '/alerting/notifications/:type/:id/duplicate',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsWrite,
      AccessControlAction.AlertingNotificationsExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/unified/Receivers')
    ),
  },
  {
    path: '/alerting/notifications/:type',
    roles: evaluateAccess([
      AccessControlAction.AlertingNotificationsWrite,
      AccessControlAction.AlertingNotificationsExternalWrite,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "NotificationsListPage" */ 'app/features/alerting/unified/Receivers')
    ),
  },
  {
    path: '/alerting/groups/',
    roles: evaluateAccess([
      AccessControlAction.AlertingInstanceRead,
      AccessControlAction.AlertingInstancesExternalRead,
    ]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertGroups" */ 'app/features/alerting/unified/AlertGroups')
    ),
  },
  {
    path: '/alerting/new/:type?',
    pageClass: 'page-alerting',
    roles: evaluateAccess([AccessControlAction.AlertingRuleCreate, AccessControlAction.AlertingRuleExternalWrite]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingRuleForm"*/ 'app/features/alerting/unified/RuleEditor')
    ),
  },
  {
    path: '/alerting/:id/edit',
    pageClass: 'page-alerting',
    roles: evaluateAccess([AccessControlAction.AlertingRuleUpdate, AccessControlAction.AlertingRuleExternalWrite]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingRuleForm"*/ 'app/features/alerting/unified/RuleEditor')
    ),
  },
  {
    path: '/alerting/:sourceName/:id/view',
    pageClass: 'page-alerting',
    roles: evaluateAccess([AccessControlAction.AlertingRuleRead, AccessControlAction.AlertingRuleExternalRead]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingRule"*/ 'app/features/alerting/unified/RuleViewer')
    ),
  },
  {
    path: '/alerting/:sourceName/:name/find',
    pageClass: 'page-alerting',
    roles: evaluateAccess([AccessControlAction.AlertingRuleRead, AccessControlAction.AlertingRuleExternalRead]),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingRedirectToRule"*/ 'app/features/alerting/unified/RedirectToRuleViewer')
    ),
  },
  {
    path: '/alerting/admin',
    roles: () => ['Admin'],
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingAdmin" */ 'app/features/alerting/unified/Admin')
    ),
  },
];

export function getAlertingRoutes(cfg = config): RouteDescriptor[] {
  if (cfg.unifiedAlertingEnabled) {
    return unifiedRoutes;
  } else if (cfg.alertingEnabled) {
    return legacyRoutes;
  }

  const uniquePaths = uniq([...legacyRoutes, ...unifiedRoutes].map((route) => route.path));
  return uniquePaths.map((path) => ({
    path,
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "AlertingFeatureTogglePage"*/ 'app/features/alerting/FeatureTogglePage')
    ),
  }));
}
