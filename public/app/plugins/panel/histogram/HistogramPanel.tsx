import React, { useMemo } from 'react';
import { PanelProps, buildHistogram, getHistogramFields } from '@grafana/data';

import { Histogram } from './Histogram';
import { PanelOptions } from './models.gen';
import { useTheme2 } from '@grafana/ui';

type Props = PanelProps<PanelOptions>;

import { histogramFieldsToFrame } from '@grafana/data/src/transformations/transformers/histogram';

export const HistogramPanel: React.FC<Props> = ({ data, options, width, height }) => {
  const theme = useTheme2();

  const histogram = useMemo(() => {
    if (!data?.series?.length) {
      return undefined;
    }
    if (data.series.length === 1) {
      const info = getHistogramFields(data.series[0]);
      if (info) {
        return histogramFieldsToFrame(info);
      }
    }
    const hist = buildHistogram(data.series, options);
    if (!hist) {
      return undefined;
    }
    return histogramFieldsToFrame(hist);
  }, [data.series, options]);

  if (!histogram || !histogram.fields.length) {
    return (
      <div className="panel-empty">
        <p>No histogram found in response</p>
      </div>
    );
  }

  return (
    <Histogram
      theme={theme}
      legend={null as any} // TODO!
      structureRev={data.structureRev}
      width={width}
      height={height}
      alignedFrame={histogram}
    />
  );
};
