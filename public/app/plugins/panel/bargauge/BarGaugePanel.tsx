// Libraries
import React, { PureComponent } from 'react';

// Services & Utils
import { config } from 'app/core/config';

import { BarGauge, VizRepeater, DataLinksContextMenu } from '@grafana/ui';
import { BarGaugeOptions } from './types';
import {
  getFieldDisplayValues,
  FieldDisplay,
  PanelProps,
  getDisplayValueAlignmentFactors,
  DisplayValueAlignmentFactors,
} from '@grafana/data';
import { getFieldLinksSupplier } from 'app/features/panel/panellinks/linkSuppliers';

export class BarGaugePanel extends PureComponent<PanelProps<BarGaugeOptions>> {
  renderValue = (
    value: FieldDisplay,
    width: number,
    height: number,
    alignmentFactors: DisplayValueAlignmentFactors
  ): JSX.Element => {
    const { options } = this.props;
    const { field, display } = value;

    return (
      <DataLinksContextMenu links={getFieldLinksSupplier(value)}>
        {({ openMenu, targetClassName }) => {
          return (
            <BarGauge
              value={display}
              width={width}
              height={height}
              orientation={options.orientation}
              thresholds={field.thresholds}
              theme={config.theme}
              itemSpacing={this.getItemSpacing()}
              displayMode={options.displayMode}
              minValue={field.min}
              maxValue={field.max}
              onClick={openMenu}
              className={targetClassName}
              alignmentFactors={alignmentFactors}
            />
          );
        }}
      </DataLinksContextMenu>
    );
  };

  getValues = (): FieldDisplay[] => {
    const { data, options, replaceVariables } = this.props;
    return getFieldDisplayValues({
      ...options,
      replaceVariables,
      theme: config.theme,
      data: data.series,
      autoMinMax: true,
    });
  };

  getItemSpacing(): number {
    if (this.props.options.displayMode === 'lcd') {
      return 2;
    }

    return 10;
  }

  render() {
    const { height, width, options, data, renderCounter } = this.props;

    return (
      <VizRepeater
        source={data}
        getAlignmentFactors={getDisplayValueAlignmentFactors}
        getValues={this.getValues}
        renderValue={this.renderValue}
        renderCounter={renderCounter}
        width={width}
        height={height}
        itemSpacing={this.getItemSpacing()}
        orientation={options.orientation}
      />
    );
  }
}
