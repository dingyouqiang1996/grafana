import { PanelPlugin, VizOrientation } from '@grafana/data';
import { BarGaugeDisplayMode, BarGaugeNamePlacement, BarGaugeSizing, BarGaugeValueMode } from '@grafana/schema';
import { commonOptionsBuilder, sharedSingleStatPanelChangedHandler } from '@grafana/ui';

import { addOrientationOption, addStandardDataReduceOptions } from '../stat/common';

import { barGaugePanelMigrationHandler } from './BarGaugeMigrations';
import { BarGaugePanel } from './BarGaugePanel';
import { Options, defaultOptions } from './panelcfg.gen';
import { BarGaugeSuggestionsSupplier } from './suggestions';

export const plugin = new PanelPlugin<Options>(BarGaugePanel)
  .useFieldConfig()
  .setPanelOptions((builder) => {
    addStandardDataReduceOptions(builder);
    addOrientationOption(builder);
    commonOptionsBuilder.addTextSizeOptions(builder);

    builder
      .addRadio({
        path: 'displayMode',
        name: 'Display mode',
        settings: {
          options: [
            { value: BarGaugeDisplayMode.Gradient, label: 'Gradient' },
            { value: BarGaugeDisplayMode.Lcd, label: 'Retro LCD' },
            { value: BarGaugeDisplayMode.Basic, label: 'Basic' },
          ],
        },
        defaultValue: defaultOptions.displayMode,
      })
      .addRadio({
        path: 'valueMode',
        name: 'Value display',
        settings: {
          options: [
            { value: BarGaugeValueMode.Color, label: 'Value color' },
            { value: BarGaugeValueMode.Text, label: 'Text color' },
            { value: BarGaugeValueMode.Hidden, label: 'Hidden' },
          ],
        },
        defaultValue: defaultOptions.valueMode,
      })
      .addRadio({
        path: 'namePlacement',
        name: 'Name placement',
        settings: {
          options: [
            { value: BarGaugeNamePlacement.Auto, label: 'Auto' },
            { value: BarGaugeNamePlacement.Top, label: 'Top' },
            { value: BarGaugeNamePlacement.Left, label: 'Left' },
          ],
        },
        defaultValue: defaultOptions.namePlacement,
        showIf: (options) => options.orientation === VizOrientation.Horizontal,
      })
      .addBooleanSwitch({
        path: 'showUnfilled',
        name: 'Show unfilled area',
        description: 'When enabled renders the unfilled region as gray',
        defaultValue: defaultOptions.showUnfilled,
        showIf: (options) => options.displayMode !== 'lcd',
      })
      .addRadio({
        path: 'sizing',
        name: 'Bar size',
        settings: {
          options: [
            { value: BarGaugeSizing.Auto, label: 'Auto' },
            { value: BarGaugeSizing.Manual, label: 'Manual' },
          ],
        },
        defaultValue: defaultOptions.sizing,
        showIf: (options) => options.orientation !== VizOrientation.Auto,
      })
      .addNumberInput({
        path: 'minVizWidth',
        name: 'Min width',
        description: 'Minimum column width',
        defaultValue: defaultOptions.minVizWidth,
        showIf: (options) =>
          options.sizing === BarGaugeSizing.Manual && options.orientation === VizOrientation.Vertical,
      })
      .addNumberInput({
        path: 'minVizHeight',
        name: 'Min height',
        description: 'Minimum row height',
        defaultValue: defaultOptions.minVizHeight,
        showIf: (options) =>
          options.sizing === BarGaugeSizing.Manual && options.orientation === VizOrientation.Horizontal,
      })
      .addNumberInput({
        path: 'maxVizHeight',
        name: 'Max height',
        description: 'Maximum row height',
        defaultValue: defaultOptions.maxVizHeight,
        showIf: (options) =>
          options.sizing === BarGaugeSizing.Manual && options.orientation === VizOrientation.Horizontal,
      });
  })
  .setPanelChangeHandler(sharedSingleStatPanelChangedHandler)
  .setMigrationHandler(barGaugePanelMigrationHandler)
  .setSuggestionsSupplier(new BarGaugeSuggestionsSupplier());
