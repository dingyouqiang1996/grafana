import { Story } from '@storybook/react';
import React from 'react';

import { ToolbarButton, ButtonGroup } from '@grafana/ui';

import { DashboardStoryCanvas } from '../../utils/storybook/DashboardStoryCanvas';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';

import { ToolbarButtonProps } from './ToolbarButton';
import { ToolbarButtonRow } from './ToolbarButtonRow';

export default {
  title: 'Buttons/ToolbarButton',
  component: ToolbarButton,
  decorators: [withCenteredStory],
  parameters: {},
  args: {
    variant: 'default',
    fullWidth: false,
    disabled: false,
    toolbarButtonText: 'Just text',
    icon: 'cloud',
    showDropdown: false,
    isOpen: false,
    tooltip: 'This is a tooltip',
    isHighlighted: false,
    imgSrc: '',
    imgAlt: '',
  },
  argTypes: {
    variant: {
      control: {
        type: 'select',
      },
      options: ['default', 'primary', 'active', 'destructive'],
    },
    icon: {
      control: {
        type: 'select',
        options: ['sync', 'cloud'],
      },
    },
  },
};

interface StoryProps extends Partial<ToolbarButtonProps> {
  toolbarButtonText: string;
  showDropdown: boolean;
}

export const BasicWithText: Story<StoryProps> = (args) => {
  return (
    <ToolbarButton
      variant={args.variant}
      disabled={args.disabled}
      fullWidth={args.fullWidth}
      tooltip={args.tooltip}
      isOpen={args.showDropdown ? args.isOpen : undefined}
      isHighlighted={args.isHighlighted}
      imgSrc={args.imgSrc}
      imgAlt={args.imgAlt}
    >
      {args.toolbarButtonText}
    </ToolbarButton>
  );
};

export const BasicWithIcon: Story<StoryProps> = (args) => {
  return (
    <ToolbarButton
      variant={args.variant}
      icon={args.icon}
      isOpen={args.showDropdown ? args.isOpen : undefined}
      tooltip={args.tooltip}
      disabled={args.disabled}
      fullWidth={args.fullWidth}
      isHighlighted={args.isHighlighted}
      imgSrc={args.imgSrc}
      imgAlt={args.imgAlt}
    />
  );
};

export const List: Story<ToolbarButtonProps> = (args) => {
  return (
    <DashboardStoryCanvas>
      <ToolbarButtonRow>
        <ToolbarButton variant={args.variant} iconOnly={false} isOpen={false}>
          Last 6 hours
        </ToolbarButton>
        <ButtonGroup>
          <ToolbarButton icon="search-minus" variant={args.variant} />
          <ToolbarButton icon="search-plus" variant={args.variant} />
        </ButtonGroup>
        <ToolbarButton icon="sync" isOpen={false} variant={args.variant} />
      </ToolbarButtonRow>
    </DashboardStoryCanvas>
  );
};
