import React, { CSSProperties } from 'react';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';
import { PanelChrome, useTheme } from '@grafana/ui';
import { PanelChromeProps } from './PanelChrome';
import { HorizontalGroup, VerticalGroup } from '../Layout/Layout';
import { merge } from 'lodash';
import { GrafanaTheme } from '@grafana/data';

export default {
  title: 'Visualizations/PanelChrome',
  component: PanelChrome,
  decorators: [withCenteredStory],
  parameters: {
    docs: {},
  },
};

function renderPanel(name: string, overrides: Partial<PanelChromeProps>, theme: GrafanaTheme) {
  const props: PanelChromeProps = {
    width: 400,
    height: 130,
    title: 'Default title',
    children: () => undefined,
  };

  merge(props, overrides);

  const contentStyle: CSSProperties = {
    background: theme.colors.bg2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <PanelChrome {...props}>
      {(innerWidth, innerHeight) => {
        return <div style={{ width: innerWidth, height: innerHeight, ...contentStyle }}>{name}</div>;
      }}
    </PanelChrome>
  );
}

export const StandardPanel = () => {
  const theme = useTheme();

  return (
    <div style={{ background: theme.colors.dashboardBg, padding: 100 }}>
      <HorizontalGroup spacing="md">
        <VerticalGroup spacing="md">
          {renderPanel('Default panel', {}, theme)}
          {renderPanel('No padding', { padding: 'none' }, theme)}
        </VerticalGroup>
        <VerticalGroup spacing="md">
          {renderPanel('No title', { title: '' }, theme)}
          {renderPanel(
            'Very long title',
            { title: 'Very long title that should get ellipsis when there is no more space' },
            theme
          )}
        </VerticalGroup>
      </HorizontalGroup>
    </div>
  );
};
