import { NavIndex } from '@grafana/data';

export const navIndex: NavIndex = {
  home: {
    id: 'home',
    text: 'Home',
    icon: 'home-alt',
    url: '/',
    sortWeight: -2000,
  },
  starred: {
    id: 'starred',
    text: 'Starred',
    icon: 'star',
    sortWeight: -1900,
    emptyMessageId: 'starred-empty',
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'dashboards/browse': {
    id: 'dashboards/browse',
    text: 'Dashboards',
    subTitle: 'Create and manage dashboards to visualize your data',
    icon: 'apps',
    url: '/dashboards',
    sortWeight: -1700,
    children: [
      {
        id: 'dashboards/playlists',
        text: 'Playlists',
        subTitle: 'Groups of dashboards that are displayed in a sequence',
        icon: 'presentation-play',
        url: '/playlists',
      },
      {
        id: 'dashboards/snapshots',
        text: 'Snapshots',
        subTitle: 'Interactive, publically available, point-in-time representations of dashboards',
        icon: 'camera',
        url: '/dashboard/snapshots',
      },
      {
        id: 'dashboards/library-panels',
        text: 'Library panels',
        subTitle: 'Reusable panels that can be added to multiple dashboards',
        icon: 'library-panel',
        url: '/library-panels',
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'dashboards/playlists': {
    id: 'dashboards/playlists',
    text: 'Playlists',
    subTitle: 'Groups of dashboards that are displayed in a sequence',
    icon: 'presentation-play',
    url: '/playlists',
  },
  'dashboards/snapshots': {
    id: 'dashboards/snapshots',
    text: 'Snapshots',
    subTitle: 'Interactive, publically available, point-in-time representations of dashboards',
    icon: 'camera',
    url: '/dashboard/snapshots',
  },
  'dashboards/library-panels': {
    id: 'dashboards/library-panels',
    text: 'Library panels',
    subTitle: 'Reusable panels that can be added to multiple dashboards',
    icon: 'library-panel',
    url: '/library-panels',
  },
  'not-found': {
    text: 'Page not found',
    subTitle: '404 Error',
    icon: 'exclamation-triangle',
  },
  error: {
    text: 'Page error',
    subTitle: 'An unexpected error',
    icon: 'exclamation-triangle',
  },
  explore: {
    id: 'explore',
    text: 'Explore',
    subTitle: 'Explore your data',
    icon: 'compass',
    url: '/explore',
    sortWeight: -1500,
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  alerting: {
    id: 'alerting',
    text: 'Alerting',
    subTitle: 'Learn about problems in your systems moments after they occur',
    icon: 'bell',
    url: '/alerting',
    sortWeight: -1400,
    children: [
      {
        id: 'alert-list',
        text: 'Alert rules',
        subTitle: 'Rules that determine whether an alert will fire',
        icon: 'list-ul',
        url: '/alerting/list',
      },
      {
        id: 'receivers',
        text: 'Contact points',
        subTitle: 'Choose how to notify your  contact points when an alert instance fires',
        icon: 'comment-alt-share',
        url: '/alerting/notifications',
      },
      {
        id: 'am-routes',
        text: 'Notification policies',
        subTitle: 'Determine how alerts are routed to contact points',
        icon: 'sitemap',
        url: '/alerting/routes',
      },
      {
        id: 'silences',
        text: 'Silences',
        subTitle: 'Stop notifications from one or more alerting rules',
        icon: 'bell-slash',
        url: '/alerting/silences',
      },
      {
        id: 'groups',
        text: 'Alert groups',
        subTitle: 'See grouped alerts from an Alertmanager instance',
        icon: 'layer-group',
        url: '/alerting/groups',
      },
      {
        id: 'alerting-admin',
        text: 'Admin',
        icon: 'cog',
        url: '/alerting/admin',
      },
      {
        id: 'alert',
        text: 'Create alert rule',
        subTitle: 'Create an alert rule',
        icon: 'plus',
        url: '/alerting/new',
        hideFromTabs: true,
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'alert-list': {
    id: 'alert-list',
    text: 'Alert rules',
    subTitle: 'Rules that determine whether an alert will fire',
    icon: 'list-ul',
    url: '/alerting/list',
  },
  receivers: {
    id: 'receivers',
    text: 'Contact points',
    subTitle: 'Choose how to notify your  contact points when an alert instance fires',
    icon: 'comment-alt-share',
    url: '/alerting/notifications',
  },
  'am-routes': {
    id: 'am-routes',
    text: 'Notification policies',
    subTitle: 'Determine how alerts are routed to contact points',
    icon: 'sitemap',
    url: '/alerting/routes',
  },
  silences: {
    id: 'silences',
    text: 'Silences',
    subTitle: 'Stop notifications from one or more alerting rules',
    icon: 'bell-slash',
    url: '/alerting/silences',
  },
  groups: {
    id: 'groups',
    text: 'Alert groups',
    subTitle: 'See grouped alerts from an Alertmanager instance',
    icon: 'layer-group',
    url: '/alerting/groups',
  },
  'alerting-admin': {
    id: 'alerting-admin',
    text: 'Admin',
    icon: 'cog',
    url: '/alerting/admin',
  },
  alert: {
    id: 'alert',
    text: 'Create alert rule',
    subTitle: 'Create an alert rule',
    icon: 'plus',
    url: '/alerting/new',
    hideFromTabs: true,
  },
  connections: {
    id: 'connections',
    text: 'Connections',
    icon: 'link',
    url: '/connections',
    sortWeight: -1300,
    children: [
      {
        id: 'connections-add-new-connection',
        text: 'Add new connection',
        subTitle: 'Browse and create new connections',
        url: '/connections/add-new-connection',
      },
      {
        id: 'connections-datasources',
        text: 'Data sources',
        subTitle: 'Manage your existing datasource connections',
        url: '/connections/datasources',
      },
      {
        id: 'standalone-plugin-page-/connections/infrastructure',
        text: 'Infrastructure',
        url: '/connections/infrastructure',
        pluginId: 'grafana-easystart-app',
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'connections-datasources': {
    id: 'connections-datasources',
    text: 'Data sources',
    subTitle: 'Manage your existing datasource connections',
    url: '/connections/datasources',
  },
  'standalone-plugin-page-/connections/infrastructure': {
    id: 'standalone-plugin-page-/connections/infrastructure',
    text: 'Infrastructure',
    url: '/connections/infrastructure',
    pluginId: 'grafana-easystart-app',
  },
  'connections-add-new-connection': {
    id: 'connections-add-new-connection',
    text: 'Add new connection',
    subTitle: 'Browse and create new connections',
    url: '/connections/add-new-connection',
  },
  cfg: {
    id: 'cfg',
    text: 'Administration',
    subTitle: 'Organization: Main Org. 123',
    icon: 'cog',
    url: '/admin',
    sortWeight: -1100,
    children: [
      {
        id: 'datasources',
        text: 'Data sources',
        subTitle: 'Add and configure data sources',
        icon: 'database',
        url: '/datasources',
      },
      {
        id: 'users',
        text: 'Users',
        subTitle: 'Invite and assign roles to users',
        icon: 'user',
        url: '/org/users',
      },
      {
        id: 'teams',
        text: 'Teams',
        subTitle: 'Groups of users that have common dashboard and permission needs',
        icon: 'users-alt',
        url: '/org/teams',
      },
      {
        id: 'plugins',
        text: 'Plugins',
        subTitle: 'Extend the Grafana experience with plugins',
        icon: 'plug',
        url: '/plugins',
      },
      {
        id: 'org-settings',
        text: 'Preferences',
        subTitle: 'Manage preferences across an organization',
        icon: 'sliders-v-alt',
        url: '/org',
      },
      {
        id: 'apikeys',
        text: 'API keys',
        subTitle: 'Manage and create API keys that are used to interact with Grafana HTTP APIs',
        icon: 'key-skeleton-alt',
        url: '/org/apikeys',
      },
      {
        id: 'serviceaccounts',
        text: 'Service accounts',
        subTitle: 'Use service accounts to run automated workloads in Grafana',
        icon: 'gf-service-account',
        url: '/org/serviceaccounts',
      },
      {
        id: 'admin',
        text: 'Server admin',
        subTitle: 'Manage server-wide settings and access to resources such as organizations, users, and licenses',
        icon: 'shield',
        url: '/admin/server',
        children: [
          {
            id: 'global-users',
            text: 'Users',
            subTitle: 'Manage and create users across the whole Grafana server',
            icon: 'user',
            url: '/admin/users',
          },
          {
            id: 'global-orgs',
            text: 'Organizations',
            subTitle: 'Isolated instances of Grafana running on the same server',
            icon: 'building',
            url: '/admin/orgs',
          },
          {
            id: 'server-settings',
            text: 'Settings',
            subTitle: 'View the settings defined in your Grafana config',
            icon: 'sliders-v-alt',
            url: '/admin/settings',
          },
          {
            id: 'upgrading',
            text: 'Stats and license',
            icon: 'unlock',
            url: '/admin/upgrading',
          },
        ],
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  datasources: {
    id: 'datasources',
    text: 'Data sources',
    subTitle: 'Add and configure data sources',
    icon: 'database',
    url: '/datasources',
  },
  users: {
    id: 'users',
    text: 'Users',
    subTitle: 'Invite and assign roles to users',
    icon: 'user',
    url: '/org/users',
  },
  teams: {
    id: 'teams',
    text: 'Teams',
    subTitle: 'Groups of users that have common dashboard and permission needs',
    icon: 'users-alt',
    url: '/org/teams',
  },
  plugins: {
    id: 'plugins',
    text: 'Plugins',
    subTitle: 'Extend the Grafana experience with plugins',
    icon: 'plug',
    url: '/plugins',
  },
  'org-settings': {
    id: 'org-settings',
    text: 'Preferences',
    subTitle: 'Manage preferences across an organization',
    icon: 'sliders-v-alt',
    url: '/org',
  },
  apikeys: {
    id: 'apikeys',
    text: 'API keys',
    subTitle: 'Manage and create API keys that are used to interact with Grafana HTTP APIs',
    icon: 'key-skeleton-alt',
    url: '/org/apikeys',
  },
  serviceaccounts: {
    id: 'serviceaccounts',
    text: 'Service accounts',
    subTitle: 'Use service accounts to run automated workloads in Grafana',
    icon: 'gf-service-account',
    url: '/org/serviceaccounts',
  },
  admin: {
    id: 'admin',
    text: 'Server admin',
    subTitle: 'Manage server-wide settings and access to resources such as organizations, users, and licenses',
    icon: 'shield',
    url: '/admin/server',
    children: [
      {
        id: 'global-users',
        text: 'Users',
        subTitle: 'Manage and create users across the whole Grafana server',
        icon: 'user',
        url: '/admin/users',
      },
      {
        id: 'global-orgs',
        text: 'Organizations',
        subTitle: 'Isolated instances of Grafana running on the same server',
        icon: 'building',
        url: '/admin/orgs',
      },
      {
        id: 'server-settings',
        text: 'Settings',
        subTitle: 'View the settings defined in your Grafana config',
        icon: 'sliders-v-alt',
        url: '/admin/settings',
      },
      {
        id: 'upgrading',
        text: 'Stats and license',
        icon: 'unlock',
        url: '/admin/upgrading',
      },
    ],
  },
  'global-users': {
    id: 'global-users',
    text: 'Users',
    subTitle: 'Manage and create users across the whole Grafana server',
    icon: 'user',
    url: '/admin/users',
  },
  'global-orgs': {
    id: 'global-orgs',
    text: 'Organizations',
    subTitle: 'Isolated instances of Grafana running on the same server',
    icon: 'building',
    url: '/admin/orgs',
  },
  'server-settings': {
    id: 'server-settings',
    text: 'Settings',
    subTitle: 'View the settings defined in your Grafana config',
    icon: 'sliders-v-alt',
    url: '/admin/settings',
  },
  upgrading: {
    id: 'upgrading',
    text: 'Stats and license',
    icon: 'unlock',
    url: '/admin/upgrading',
  },
  monitoring: {
    id: 'monitoring',
    text: 'Observability',
    subTitle: 'Monitoring and infrastructure apps',
    icon: 'heart-rate',
    url: '/monitoring',
    sortWeight: -900,
    children: [
      {
        id: 'plugin-page-grafana-synthetic-monitoring-app',
        text: 'Synthetic Monitoring',
        img: 'public/plugins/grafana-synthetic-monitoring-app/img/logo.svg',
        url: '/a/grafana-synthetic-monitoring-app/home',
        sortWeight: 2,
        isSection: true,
        children: [
          {
            text: 'Summary',
            url: '/a/grafana-synthetic-monitoring-app/redirect?dashboard=summary',
            pluginId: 'grafana-synthetic-monitoring-app',
          },
          {
            text: 'Checks',
            url: '/a/grafana-synthetic-monitoring-app/checks',
            pluginId: 'grafana-synthetic-monitoring-app',
          },
          {
            text: 'Probes',
            url: '/a/grafana-synthetic-monitoring-app/probes',
            pluginId: 'grafana-synthetic-monitoring-app',
          },
          {
            text: 'Alerts',
            url: '/a/grafana-synthetic-monitoring-app/alerts',
            pluginId: 'grafana-synthetic-monitoring-app',
          },
          {
            text: 'Config',
            url: '/plugins/grafana-synthetic-monitoring-app',
            pluginId: 'grafana-synthetic-monitoring-app',
          },
        ],
        pluginId: 'grafana-synthetic-monitoring-app',
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'plugin-page-grafana-synthetic-monitoring-app': {
    id: 'plugin-page-grafana-synthetic-monitoring-app',
    text: 'Synthetic Monitoring',
    img: 'public/plugins/grafana-synthetic-monitoring-app/img/logo.svg',
    url: '/a/grafana-synthetic-monitoring-app/home',
    sortWeight: 2,
    isSection: true,
    children: [
      {
        text: 'Summary',
        url: '/a/grafana-synthetic-monitoring-app/redirect?dashboard=summary',
        pluginId: 'grafana-synthetic-monitoring-app',
      },
      {
        text: 'Checks',
        url: '/a/grafana-synthetic-monitoring-app/checks',
        pluginId: 'grafana-synthetic-monitoring-app',
      },
      {
        text: 'Probes',
        url: '/a/grafana-synthetic-monitoring-app/probes',
        pluginId: 'grafana-synthetic-monitoring-app',
      },
      {
        text: 'Alerts',
        url: '/a/grafana-synthetic-monitoring-app/alerts',
        pluginId: 'grafana-synthetic-monitoring-app',
      },
      {
        text: 'Config',
        url: '/plugins/grafana-synthetic-monitoring-app',
        pluginId: 'grafana-synthetic-monitoring-app',
      },
    ],
    pluginId: 'grafana-synthetic-monitoring-app',
  },
  undefined: {
    text: 'Cluster Alerts',
    icon: 'info-circle',
    url: '/d/xESAiFcnk',
    pluginId: 'redis-explorer-app',
    parentItem: {
      id: 'plugin-page-redis-explorer-app',
      text: 'Redis Explorer',
      img: 'public/plugins/redis-explorer-app/img/logo.svg',
      url: '/a/redis-explorer-app/',
      sortWeight: -1200,
      isSection: true,
      children: [
        {
          text: 'Enterprise Clusters',
          icon: 'apps',
          url: '/d/1dKhTjtGk',
          pluginId: 'redis-explorer-app',
        },
        {
          text: 'Cluster Overview',
          icon: 'monitor',
          url: '/d/viroIzSGz',
          pluginId: 'redis-explorer-app',
        },
        {
          text: 'Cluster Nodes',
          icon: 'sitemap',
          url: '/d/hqze6rtGz',
          pluginId: 'redis-explorer-app',
        },
        {
          text: 'Cluster Databases',
          icon: 'database',
          url: '/d/k_A8MjtMk',
          pluginId: 'redis-explorer-app',
        },
      ],
      pluginId: 'redis-explorer-app',
      parentItem: {
        id: 'apps',
        text: 'Apps',
        subTitle: 'App plugins that extend the Grafana experience',
        icon: 'apps',
        url: '/apps',
        sortWeight: -800,
        children: [
          {
            id: 'plugin-page-cloudflare-app',
            text: 'Cloudflare Grafana App',
            img: 'public/plugins/cloudflare-app/img/cf_icon.png',
            url: '/a/cloudflare-app',
            sortWeight: -1200,
            isSection: true,
            children: [
              {
                text: 'Zones',
                url: '/d/KAVdMAw9k',
                pluginId: 'cloudflare-app',
              },
              {
                text: 'DNS Firewall',
                url: '/d/QrKttDVqu',
                pluginId: 'cloudflare-app',
              },
            ],
            pluginId: 'cloudflare-app',
          },
          {
            id: 'plugin-page-grafana-easystart-app',
            text: 'Integrations and Connections',
            img: 'public/plugins/grafana-easystart-app/img/logo.svg',
            url: '/a/grafana-easystart-app',
            sortWeight: -1200,
            isSection: true,
            children: [
              {
                text: 'Custom page',
                url: '/connections/custom-page',
                pluginId: 'grafana-easystart-app',
              },
            ],
            pluginId: 'grafana-easystart-app',
          },
          {
            id: 'plugin-page-grafana-k6-app',
            text: 'k6 Cloud App',
            img: 'public/plugins/grafana-k6-app/img/logo.svg',
            url: '/a/grafana-k6-app',
            sortWeight: -1200,
            isSection: true,
            pluginId: 'grafana-k6-app',
          },
          {
            id: 'plugin-page-myorg-app-basic',
            text: 'Basic App',
            img: 'public/plugins/myorg-app-basic/img/logo.svg',
            url: '/a/myorg-app-basic/one',
            sortWeight: -1200,
            isSection: true,
            children: [
              {
                text: 'Page Two',
                url: '/a/myorg-app-basic/two',
                pluginId: 'myorg-app-basic',
              },
              {
                text: 'Page Three',
                url: '/a/myorg-app-basic/three',
                pluginId: 'myorg-app-basic',
              },
              {
                text: 'Page Four',
                url: '/a/myorg-app-basic/four',
                pluginId: 'myorg-app-basic',
              },
              {
                text: 'Configuration',
                icon: 'cog',
                url: '/plugins/myorg-app-basic',
                pluginId: 'myorg-app-basic',
              },
            ],
            pluginId: 'myorg-app-basic',
          },
        ],
        parentItem: {
          id: 'home',
          text: 'Home',
          icon: 'home-alt',
          url: '/',
          sortWeight: -2000,
        },
      },
    },
  },
  apps: {
    id: 'apps',
    text: 'Apps',
    subTitle: 'App plugins that extend the Grafana experience',
    icon: 'apps',
    url: '/apps',
    sortWeight: -800,
    children: [
      {
        id: 'plugin-page-cloudflare-app',
        text: 'Cloudflare Grafana App',
        img: 'public/plugins/cloudflare-app/img/cf_icon.png',
        url: '/a/cloudflare-app',
        sortWeight: -1200,
        isSection: true,
        children: [
          {
            text: 'Zones',
            url: '/d/KAVdMAw9k',
            pluginId: 'cloudflare-app',
          },
          {
            text: 'DNS Firewall',
            url: '/d/QrKttDVqu',
            pluginId: 'cloudflare-app',
          },
        ],
        pluginId: 'cloudflare-app',
      },
      {
        id: 'plugin-page-grafana-easystart-app',
        text: 'Integrations and Connections',
        img: 'public/plugins/grafana-easystart-app/img/logo.svg',
        url: '/a/grafana-easystart-app',
        sortWeight: -1200,
        isSection: true,
        children: [
          {
            text: 'Custom page',
            url: '/connections/custom-page',
            pluginId: 'grafana-easystart-app',
          },
        ],
        pluginId: 'grafana-easystart-app',
      },
      {
        id: 'plugin-page-grafana-k6-app',
        text: 'k6 Cloud App',
        img: 'public/plugins/grafana-k6-app/img/logo.svg',
        url: '/a/grafana-k6-app',
        sortWeight: -1200,
        isSection: true,
        pluginId: 'grafana-k6-app',
      },
      {
        id: 'plugin-page-myorg-app-basic',
        text: 'Basic App',
        img: 'public/plugins/myorg-app-basic/img/logo.svg',
        url: '/a/myorg-app-basic/one',
        sortWeight: -1200,
        isSection: true,
        children: [
          {
            text: 'Page Two',
            url: '/a/myorg-app-basic/two',
            pluginId: 'myorg-app-basic',
          },
          {
            text: 'Page Three',
            url: '/a/myorg-app-basic/three',
            pluginId: 'myorg-app-basic',
          },
          {
            text: 'Page Four',
            url: '/a/myorg-app-basic/four',
            pluginId: 'myorg-app-basic',
          },
          {
            text: 'Configuration',
            icon: 'cog',
            url: '/plugins/myorg-app-basic',
            pluginId: 'myorg-app-basic',
          },
        ],
        pluginId: 'myorg-app-basic',
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'plugin-page-cloudflare-app': {
    id: 'plugin-page-cloudflare-app',
    text: 'Cloudflare Grafana App',
    img: 'public/plugins/cloudflare-app/img/cf_icon.png',
    url: '/a/cloudflare-app',
    sortWeight: -1200,
    isSection: true,
    children: [
      {
        text: 'Zones',
        url: '/d/KAVdMAw9k',
        pluginId: 'cloudflare-app',
      },
      {
        text: 'DNS Firewall',
        url: '/d/QrKttDVqu',
        pluginId: 'cloudflare-app',
      },
    ],
    pluginId: 'cloudflare-app',
  },
  'plugin-page-grafana-easystart-app': {
    id: 'plugin-page-grafana-easystart-app',
    text: 'Integrations and Connections',
    img: 'public/plugins/grafana-easystart-app/img/logo.svg',
    url: '/a/grafana-easystart-app',
    sortWeight: -1200,
    isSection: true,
    children: [
      {
        text: 'Custom page',
        url: '/connections/custom-page',
        pluginId: 'grafana-easystart-app',
      },
    ],
    pluginId: 'grafana-easystart-app',
  },
  'plugin-page-grafana-k6-app': {
    id: 'plugin-page-grafana-k6-app',
    text: 'k6 Cloud App',
    img: 'public/plugins/grafana-k6-app/img/logo.svg',
    url: '/a/grafana-k6-app',
    sortWeight: -1200,
    isSection: true,
    pluginId: 'grafana-k6-app',
  },
  'plugin-page-myorg-app-basic': {
    id: 'plugin-page-myorg-app-basic',
    text: 'Basic App',
    img: 'public/plugins/myorg-app-basic/img/logo.svg',
    url: '/a/myorg-app-basic/one',
    sortWeight: -1200,
    isSection: true,
    children: [
      {
        text: 'Page Two',
        url: '/a/myorg-app-basic/two',
        pluginId: 'myorg-app-basic',
      },
      {
        text: 'Page Three',
        url: '/a/myorg-app-basic/three',
        pluginId: 'myorg-app-basic',
      },
      {
        text: 'Page Four',
        url: '/a/myorg-app-basic/four',
        pluginId: 'myorg-app-basic',
      },
      {
        text: 'Configuration',
        icon: 'cog',
        url: '/plugins/myorg-app-basic',
        pluginId: 'myorg-app-basic',
      },
    ],
    pluginId: 'myorg-app-basic',
  },
  'plugin-page-redis-explorer-app': {
    id: 'plugin-page-redis-explorer-app',
    text: 'Redis Explorer',
    img: 'public/plugins/redis-explorer-app/img/logo.svg',
    url: '/a/redis-explorer-app/',
    sortWeight: -1200,
    isSection: true,
    children: [
      {
        text: 'Enterprise Clusters',
        icon: 'apps',
        url: '/d/1dKhTjtGk',
        pluginId: 'redis-explorer-app',
      },
      {
        text: 'Cluster Overview',
        icon: 'monitor',
        url: '/d/viroIzSGz',
        pluginId: 'redis-explorer-app',
      },
      {
        text: 'Cluster Nodes',
        icon: 'sitemap',
        url: '/d/hqze6rtGz',
        pluginId: 'redis-explorer-app',
      },
      {
        text: 'Cluster Databases',
        icon: 'database',
        url: '/d/k_A8MjtMk',
        pluginId: 'redis-explorer-app',
      },
    ],
    pluginId: 'redis-explorer-app',
    parentItem: {
      id: 'apps',
      text: 'Apps',
      subTitle: 'App plugins that extend the Grafana experience',
      icon: 'apps',
      url: '/apps',
      sortWeight: -800,
      children: [
        {
          id: 'plugin-page-cloudflare-app',
          text: 'Cloudflare Grafana App',
          img: 'public/plugins/cloudflare-app/img/cf_icon.png',
          url: '/a/cloudflare-app',
          sortWeight: -1200,
          isSection: true,
          children: [
            {
              text: 'Zones',
              url: '/d/KAVdMAw9k',
              pluginId: 'cloudflare-app',
            },
            {
              text: 'DNS Firewall',
              url: '/d/QrKttDVqu',
              pluginId: 'cloudflare-app',
            },
          ],
          pluginId: 'cloudflare-app',
        },
        {
          id: 'plugin-page-grafana-easystart-app',
          text: 'Integrations and Connections',
          img: 'public/plugins/grafana-easystart-app/img/logo.svg',
          url: '/a/grafana-easystart-app',
          sortWeight: -1200,
          isSection: true,
          children: [
            {
              text: 'Custom page',
              url: '/connections/custom-page',
              pluginId: 'grafana-easystart-app',
            },
          ],
          pluginId: 'grafana-easystart-app',
        },
        {
          id: 'plugin-page-grafana-k6-app',
          text: 'k6 Cloud App',
          img: 'public/plugins/grafana-k6-app/img/logo.svg',
          url: '/a/grafana-k6-app',
          sortWeight: -1200,
          isSection: true,
          pluginId: 'grafana-k6-app',
        },
        {
          id: 'plugin-page-myorg-app-basic',
          text: 'Basic App',
          img: 'public/plugins/myorg-app-basic/img/logo.svg',
          url: '/a/myorg-app-basic/one',
          sortWeight: -1200,
          isSection: true,
          children: [
            {
              text: 'Page Two',
              url: '/a/myorg-app-basic/two',
              pluginId: 'myorg-app-basic',
            },
            {
              text: 'Page Three',
              url: '/a/myorg-app-basic/three',
              pluginId: 'myorg-app-basic',
            },
            {
              text: 'Page Four',
              url: '/a/myorg-app-basic/four',
              pluginId: 'myorg-app-basic',
            },
            {
              text: 'Configuration',
              icon: 'cog',
              url: '/plugins/myorg-app-basic',
              pluginId: 'myorg-app-basic',
            },
          ],
          pluginId: 'myorg-app-basic',
        },
      ],
      parentItem: {
        id: 'home',
        text: 'Home',
        icon: 'home-alt',
        url: '/',
        sortWeight: -2000,
      },
    },
  },
  profile: {
    id: 'profile',
    text: 'admin',
    img: '/avatar/46d229b033af06a191ff2267bca9ae56',
    url: '/profile',
    sortWeight: -600,
    roundIcon: true,
    children: [
      {
        id: 'profile/settings',
        text: 'Preferences',
        icon: 'sliders-v-alt',
        url: '/profile',
      },
      {
        id: 'profile/notifications',
        text: 'Notification history',
        icon: 'bell',
        url: '/profile/notifications',
      },
      {
        id: 'profile/password',
        text: 'Change password',
        icon: 'lock',
        url: '/profile/password',
      },
      {
        id: 'sign-out',
        text: 'Sign out',
        icon: 'arrow-from-right',
        url: '/logout',
        target: '_self',
        hideFromTabs: true,
      },
    ],
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
  'profile/settings': {
    id: 'profile/settings',
    text: 'Preferences',
    icon: 'sliders-v-alt',
    url: '/profile',
  },
  'profile/notifications': {
    id: 'profile/notifications',
    text: 'Notification history',
    icon: 'bell',
    url: '/profile/notifications',
  },
  'profile/password': {
    id: 'profile/password',
    text: 'Change password',
    icon: 'lock',
    url: '/profile/password',
  },
  'sign-out': {
    id: 'sign-out',
    text: 'Sign out',
    icon: 'arrow-from-right',
    url: '/logout',
    target: '_self',
    hideFromTabs: true,
  },
  help: {
    id: 'help',
    text: 'Help',
    subTitle: 'Grafana v9.4.0-pre (8f5dc47e87)',
    icon: 'question-circle',
    url: '#',
    sortWeight: -500,
    parentItem: {
      id: 'home',
      text: 'Home',
      icon: 'home-alt',
      url: '/',
      sortWeight: -2000,
    },
  },
};
