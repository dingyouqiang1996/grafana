var config = {
  defaults: {
    concurrency: 1,
    runners: ['axe'],
    chromeLaunchConfig: {
      args: ['--no-sandbox'],
    },
  },

  urls: [
    {
      url: '${HOST}/login',
      wait: 500,
      actions: [
        "wait for element input[name='user'] to be added",
        "set field input[name='user'] to admin",
        "set field input[name='password'] to admin",
        "click element button[aria-label='Login button']",
        "wait for element [aria-label='Skip change password button'] to be visible",
      ],
      threshold: 2,
    },
    {
      url: '${HOST}/?orgId=1',
      wait: 500,
      threshold: 7,
    },
    {
      url: '${HOST}/d/O6f11TZWk/panel-tests-bar-gauge',
      wait: 500,
      hideElements: '.sidemenu',
      threshold: 2,
    },
    {
      url: '${HOST}/d/O6f11TZWk/panel-tests-bar-gauge?orgId=1&editview=settings',
      wait: 500,
      rootElement: '.dashboard-settings',
      threshold: 10,
    },
    {
      url: '${HOST}/?orgId=1&search=open',
      wait: 500,
      rootElement: '.main-view',
      threshold: 15,
    },
    {
      url: '${HOST}/alerting/list',
      wait: 500,
      rootElement: '.main-view',
      threshold: 7,
    },
    {
      url: '${HOST}/datasources',
      wait: 500,
      rootElement: '.main-view',
      threshold: 36,
    },
    {
      url: '${HOST}/org/users',
      wait: 500,
      rootElement: '.main-view',
      threshold: 4,
    },
    {
      url: '${HOST}/org/teams',
      wait: 500,
      rootElement: '.main-view',
      threshold: 1,
    },
    {
      url: '${HOST}/plugins',
      wait: 500,
      rootElement: '.main-view',
      threshold: 41,
    },
    {
      url: '${HOST}/org',
      wait: 500,
      rootElement: '.main-view',
      threshold: 2,
    },
    {
      url: '${HOST}/org/apikeys',
      wait: 500,
      rootElement: '.main-view',
      threshold: 5,
    },
    {
      url: '${HOST}/dashboards',
      wait: 500,
      rootElement: '.main-view',
      threshold: 11,
    },
  ],
};

function myPa11yCiConfiguration(urls, defaults) {
  const HOST_SERVER = process.env.HOST || 'localhost';
  const PORT_SERVER = process.env.PORT || '3001';
  for (var idx = 0; idx < urls.length; idx++) {
    urls[idx] = { ...urls[idx], url: urls[idx].url.replace('${HOST}', `${HOST_SERVER}:${PORT_SERVER}`) };
  }

  return {
    defaults: defaults,
    urls: urls,
  };
}

module.exports = myPa11yCiConfiguration(config.urls, config.defaults);
