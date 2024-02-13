import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { advanceTo, clear } from 'jest-date-mock';
import React from 'react';

import { dateTime } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { config, locationService } from '@grafana/runtime';
import { SceneGridItem, SceneGridLayout, SceneTimeRange, VizPanel } from '@grafana/scenes';

import { DashboardScene } from '../scene/DashboardScene';

import { ShareLinkTab } from './ShareLinkTab';

jest.mock('app/core/utils/shortLinks', () => ({
  createShortLink: jest.fn().mockResolvedValue(`http://localhost:3000/goto/shortend-uid`),
}));

describe('ShareLinkTab', () => {
  const fakeCurrentDate = dateTime('2019-02-11T19:00:00.000Z').toDate();

  afterAll(() => {
    clear();
  });

  beforeAll(() => {
    advanceTo(fakeCurrentDate);

    config.appUrl = 'http://dashboards.grafana.com/grafana/';
    config.rendererAvailable = true;
    config.bootData.user.orgId = 1;
    config.featureToggles.dashboardSceneForViewers = true;
    locationService.push('/d/dash-1?from=now-6h&to=now');
  });

  describe('with locked time range (absolute) range', () => {
    it('should generate share url absolute time', async () => {
      buildAndRenderScenario({});

      expect(await screen.findByRole('textbox', { name: 'Link URL' })).toHaveValue(
        'http://dashboards.grafana.com/grafana/d/dash-1?from=2019-02-11T13:00:00.000Z&to=2019-02-11T19:00:00.000Z&viewPanel=panel-12'
      );
    });
  });

  describe('with disabled locked range range', () => {
    it('should generate share url with relative time', async () => {
      const tab = buildAndRenderScenario({});
      act(() => tab.onToggleLockedTime());

      expect(await screen.findByRole('textbox', { name: 'Link URL' })).toHaveValue(
        'http://dashboards.grafana.com/grafana/d/dash-1?from=now-6h&to=now&viewPanel=panel-12'
      );
    });
  });

  it('should add theme when specified', async () => {
    const tab = buildAndRenderScenario({});
    act(() => tab.onThemeChange('light'));

    expect(await screen.findByRole('textbox', { name: 'Link URL' })).toHaveValue(
      'http://dashboards.grafana.com/grafana/d/dash-1?from=2019-02-11T13:00:00.000Z&to=2019-02-11T19:00:00.000Z&viewPanel=panel-12&theme=light'
    );
  });

  it('should shorten url', async () => {
    buildAndRenderScenario({});

    await userEvent.click(await screen.findByLabelText('Shorten URL'));

    expect(await screen.findByRole('textbox', { name: 'Link URL' })).toHaveValue(
      `http://localhost:3000/goto/shortend-uid`
    );
  });

  it('should generate render url', async () => {
    buildAndRenderScenario({});

    expect(
      await screen.findByRole('link', { name: selectors.pages.SharePanelModal.linkToRenderedImage })
    ).toHaveAttribute(
      'href',
      'http://dashboards.grafana.com/grafana/render/d-solo/dash-1?from=2019-02-11T13:00:00.000Z&to=2019-02-11T19:00:00.000Z&viewPanel=panel-12&width=1000&height=500&scale=1&tz=Pacific%2FEaster'
    );
  });
});

interface ScenarioOptions {
  withPanel?: boolean;
}

function buildAndRenderScenario(options: ScenarioOptions) {
  const panel = new VizPanel({
    title: 'Panel A',
    pluginId: 'table',
    key: 'panel-12',
  });

  const dashboard = new DashboardScene({
    title: 'hello',
    uid: 'dash-1',
    meta: {
      canEdit: true,
    },
    $timeRange: new SceneTimeRange({}),
    body: new SceneGridLayout({
      children: [
        new SceneGridItem({
          key: 'griditem-1',
          x: 0,
          y: 0,
          width: 10,
          height: 12,
          body: panel,
        }),
      ],
    }),
  });

  const tab = new ShareLinkTab({ dashboardRef: dashboard.getRef(), panelRef: panel.getRef() });

  render(<tab.Component model={tab} />);

  return tab;
}
