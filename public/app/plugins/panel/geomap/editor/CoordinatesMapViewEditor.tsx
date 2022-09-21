import React from 'react';

import { InlineFieldRow, InlineField } from '@grafana/ui';
import { NumberInput } from 'app/core/components/OptionsUI/NumberInput';

import { MapViewConfig } from '../types';

type Props = {
  labelWidth: number;
  value: MapViewConfig;
  onChange: (value?: MapViewConfig | undefined) => void;
};

export const CoordinatesMapViewEditor = ({ labelWidth, value, onChange }: Props) => {
  return (
    <>
      <InlineFieldRow>
        <InlineField label="Latitude" labelWidth={labelWidth} grow={true}>
          <NumberInput
            value={value.lat}
            min={-90}
            max={90}
            step={0.001}
            onChange={(v) => {
              onChange({ ...value, lat: v });
            }}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Longitude" labelWidth={labelWidth} grow={true}>
          <NumberInput
            value={value.lon}
            min={-180}
            max={180}
            step={0.001}
            onChange={(v) => {
              onChange({ ...value, lon: v });
            }}
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
};
