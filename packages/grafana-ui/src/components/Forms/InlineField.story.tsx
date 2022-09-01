import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { Input } from '../Input/Input';
import { Select } from '../Select/Select';

import { InlineField } from './InlineField';
import mdx from './InlineField.mdx';

const meta: ComponentMeta<typeof InlineField> = {
  title: 'Forms/InlineField',
  component: InlineField,
  argTypes: {
    label: { control: { type: 'text' } },
    labelWidth: { control: { type: 'number', min: 12 } },
    tooltip: { control: { type: 'text' } },
    error: { control: { type: 'text' } },
  },
  parameters: {
    docs: {
      page: mdx,
    },
    controls: {
      exclude: ['htmlFor', 'className', 'children'],
    },
  },
};

export const basic: ComponentStory<typeof InlineField> = (args) => {
  return (
    <InlineField {...args}>
      <Input placeholder="Inline input" />
    </InlineField>
  );
};

basic.args = {
  label: 'Inline field',
  transparent: false,
  grow: false,
  shrink: false,
  disabled: false,
  interactive: false,
  loading: false,
  required: false,
  invalid: false,
  validationMessageHorizontalOverflow: false,
};

export const withTooltip: ComponentStory<typeof InlineField> = () => {
  return (
    <InlineField label="Label" tooltip="Tooltip">
      <Input placeholder="Inline input" />
    </InlineField>
  );
};

export const grow: ComponentStory<typeof InlineField> = () => {
  return (
    <InlineField label="Label" grow>
      <Input placeholder="Inline input" />
    </InlineField>
  );
};

export const withSelect: ComponentStory<typeof InlineField> = () => {
  return (
    <InlineField label="Select option">
      <Select
        width={16}
        onChange={action('item selected')}
        options={[
          { value: 1, label: 'One' },
          { value: 2, label: 'Two' },
        ]}
      />
    </InlineField>
  );
};

export const multiple: ComponentStory<typeof InlineField> = () => {
  return (
    <>
      <InlineField label="Field 1">
        <Input placeholder="Inline input" />
      </InlineField>
      <InlineField label="Field 2">
        <Input placeholder="Inline input" />
      </InlineField>
      <InlineField label="Field 3">
        <Input placeholder="Inline input" />
      </InlineField>
    </>
  );
};

export default meta;
