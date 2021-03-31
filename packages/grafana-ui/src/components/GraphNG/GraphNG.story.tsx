import { FieldColorModeId, toDataFrame, dateTime } from '@grafana/data';
import React from 'react';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';
import { GraphNG, GraphNGProps } from './GraphNG';
import { LegendDisplayMode, LegendPlacement } from '../VizLegend/types';
import { prepDataForStorybook } from '../../utils/storybook/data';
import { useTheme } from '../../themes';
import { Story } from '@storybook/react';
import { NOOP_CONTROL } from '../../utils/storybook/noopControl';

export default {
  title: 'Visualizations/GraphNG',
  component: GraphNG,
  decorators: [withCenteredStory],
  parameters: {
    knobs: {
      disable: true,
    },
  },
  argTypes: {
    legendDisplayMode: { control: { type: 'radio', options: ['table', 'list', 'hidden'] } },
    placement: { control: { type: 'radio', options: ['bottom', 'right'] } },
    timeZone: { control: { type: 'radio', options: ['browser', 'utc'] } },
    width: { control: { type: 'range', min: 200, max: 800 } },
    height: { control: { type: 'range', min: 200, max: 800 } },
    className: NOOP_CONTROL,
    timeRange: NOOP_CONTROL,
    data: NOOP_CONTROL,
    legend: NOOP_CONTROL,
    fields: NOOP_CONTROL,
  },
};

interface StoryProps extends GraphNGProps {
  legendDisplayMode: string;
  placement: LegendPlacement;
  unit: string;
}
export const Lines: Story<StoryProps> = ({ placement, unit, legendDisplayMode, ...args }) => {
  const theme = useTheme();
  const seriesA = toDataFrame({
    target: 'SeriesA',
    datapoints: [
      [10, 1546372800000],
      [20, 1546376400000],
      [10, 1546380000000],
    ],
  });

  seriesA.fields[1].config.custom = { line: { show: true } };
  seriesA.fields[1].config.color = { mode: FieldColorModeId.PaletteClassic };
  seriesA.fields[1].config.unit = unit;

  const data = prepDataForStorybook([seriesA], theme);

  return (
    <GraphNG
      {...args}
      data={data}
      legend={{
        displayMode:
          legendDisplayMode === 'hidden'
            ? LegendDisplayMode.Hidden
            : legendDisplayMode === 'table'
            ? LegendDisplayMode.Table
            : LegendDisplayMode.List,
        placement: placement,
        calcs: [],
      }}
    />
  );
};
Lines.args = {
  width: 600,
  height: 400,
  timeRange: {
    from: dateTime(1546372800000),
    to: dateTime(1546380000000),
    raw: {
      from: dateTime(1546372800000),
      to: dateTime(1546380000000),
    },
  },
  legendDisplayMode: 'list',
  placement: 'bottom',
  unit: 'short',
  timeZone: 'browser',
};
