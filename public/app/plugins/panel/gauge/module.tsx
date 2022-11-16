import { PanelPlugin } from '@grafana/data';
import { commonOptionsBuilder } from '@grafana/ui';

import { addOrientationOption, addStandardDataReduceOptions } from '../stat/common';

import { gaugePanelMigrationHandler, gaugePanelChangedHandler } from './GaugeMigrations';
import { GaugePanel } from './GaugePanel';
import { PanelOptions, defaultPanelOptions } from './models.gen';
import { GaugeSuggestionsSupplier } from './suggestions';

export const plugin = new PanelPlugin<PanelOptions>(GaugePanel)
  .useFieldConfig()
  .setPanelOptions((builder) => {
    addStandardDataReduceOptions(builder);
    addOrientationOption(builder);

    builder
      .addBooleanSwitch({
        path: 'showThresholdLabels',
        name: 'Show threshold labels',
        description: 'Render the threshold values around the gauge bar',
        defaultValue: defaultPanelOptions.showThresholdLabels,
      })
      .addBooleanSwitch({
        path: 'showThresholdMarkers',
        name: 'Show threshold markers',
        description: 'Renders the thresholds as an outer bar',
        defaultValue: defaultPanelOptions.showThresholdMarkers,
      })
      .addNumberInput({
        path: 'neutral',
        name: 'Neutral',
        description: 'Leave empty to use Min as neutral point',
        settings: {
          placeholder: 'auto',
        },
      });

    commonOptionsBuilder.addTextSizeOptions(builder);
  })
  .setPanelChangeHandler(gaugePanelChangedHandler)
  .setSuggestionsSupplier(new GaugeSuggestionsSupplier())
  .setMigrationHandler(gaugePanelMigrationHandler);
