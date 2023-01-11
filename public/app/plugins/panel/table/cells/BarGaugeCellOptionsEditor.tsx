import React from 'react';

import { SelectableValue } from '@grafana/data';
import { BarGaugeDisplayMode, TableBarGaugeCellOptions, TableCellDisplayMode } from '@grafana/schema';
import { Field, HorizontalGroup, Select } from '@grafana/ui';

import { TableCellEditorProps } from '../models.gen';

const barGaugeOpts: SelectableValue[] = [
  { value: BarGaugeDisplayMode.Basic, label: 'Basic' },
  { value: BarGaugeDisplayMode.Gradient, label: 'Gradient' },
  { value: BarGaugeDisplayMode.Lcd, label: 'Retro LCD' },
];

export const BarGaugeCellOptionsEditor = ({
  cellOptions,
  onChange,
}: TableCellEditorProps<TableBarGaugeCellOptions>) => {
  const onCellOptionsChange = (v: SelectableValue) => {
    cellOptions.mode = v.value;
    onChange(cellOptions);
  };

  return (
    <HorizontalGroup>
      <Field label="Gauge Display Mode">
        <Select value={cellOptions?.mode} onChange={onCellOptionsChange} options={barGaugeOpts} />
      </Field>
    </HorizontalGroup>
  );
};
