import { Location } from 'history';

import { locationUtil, NavModel, NavModelItem, PanelModel } from '@grafana/data';
import { config } from '@grafana/runtime';
import { contextSrv } from 'app/core/core';
import { AccessControlAction } from 'app/types';

import { DashboardModel } from './DashboardModel';

export function buildDashboardNavModel(
  dashboard: DashboardModel,
  editview: string | undefined,
  editIndex: number | undefined,
  editPanel: PanelModel | null,
  viewPanel: PanelModel | null,
  location: Location<any>
): NavModel {
  let node: NavModelItem = {
    id: 'dashboard',
    text: dashboard.title,
    icon: 'apps',
    active: true,
    url: locationUtil.getUrlForPartial(location, { editview: null, editIndex: null, editPanel: null, viewPanel: null }),
    parentItem: {
      id: 'dashboard',
      text: 'Dashbords',
      url: '/dashboards',
    },
    children: [],
  };

  if (dashboard.meta.folderTitle && dashboard.meta.folderUid) {
    node.parentItem = {
      id: 'folder',
      text: dashboard.meta.folderTitle,
      url: `/dashboards/f/${dashboard.meta.folderUid}`,
      parentItem: node.parentItem,
    };
  }

  let main = node;

  if (editview) {
    const children: NavModelItem[] = [];

    if (dashboard.meta.canEdit) {
      children.push({
        text: 'Settings',
        id: 'settings',
      });

      children.push({
        text: 'Annotations',
        id: 'annotations',
        subTitle:
          'Here you manage annotation queries that return events. These can be visualized in all Graphs as discrete events.',
        // icon: 'comment-alt',
      });

      children.push({
        text: 'Variables',
        subTitle: 'Variables can be used as dynamic filters to make your dashboard more generic and re-usable.',
        id: 'templating',
        // icon: 'calculator-alt',
      });

      children.push({
        text: 'Links',
        id: 'links',
        // icon: 'link',
        // component: <LinksSettings dashboard={dashboard} />,
      });
    }

    if (dashboard.meta.canMakeEditable) {
      children.push({
        text: 'General',
        id: 'settings',
        // icon: 'sliders-v-alt',
        // component: <MakeEditable onMakeEditable={onMakeEditable} />,
      });
    }

    if (dashboard.id && dashboard.meta.canSave) {
      children.push({
        text: 'Versions',
        id: 'versions',
        // icon: 'history',
        // component: <VersionsSettings dashboard={dashboard} />,
      });
    }

    if (dashboard.id && dashboard.meta.canAdmin) {
      if (!config.featureToggles['accesscontrol']) {
        children.push({
          text: 'Permissions',
          id: 'permissions',
          // icon: 'lock',
          // component: <DashboardPermissions dashboard={dashboard} />,
        });
      } else if (contextSrv.hasPermission(AccessControlAction.DashboardsPermissionsRead)) {
        children.push({
          text: 'Permissions',
          id: 'permissions',
          // icon: 'lock',
          // component: <AccessControlDashboardPermissions dashboard={dashboard} />,
        });
      }
    }

    children.push({
      text: 'JSON Model',
      id: 'dashboard_json',
      // icon: 'arrow',
      // component: <JsonEditorSettings dashboard={dashboard} />,
    });

    main.children = children;

    for (const child of main.children) {
      child.url = locationUtil.getUrlForPartial(location, { editview: child.id, editIndex: null });
      if (child.id === editview) {
        child.active = child.id === editview;
        node = child;
        node.parentItem = main;
        main.active = false;

        if (editIndex != null) {
          const name = editview.substring(0, editview.length - 1);
          // node.active = false;

          node = {
            text: 'Edit ' + name,
            active: true,
            parentItem: {
              ...node,
              active: false,
            },
          };
        }
      }
    }
  } else {
    if (editPanel) {
      node = {
        text: 'Edit panel',
        active: true,
        parentItem: {
          ...node,
          active: false,
        },
      };
    }

    if (viewPanel) {
      node = {
        text: 'View panel',
        active: true,
        parentItem: {
          ...node,
          active: false,
        },
      };
    }
  }

  return {
    main,
    node,
  };
}
