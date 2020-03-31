import {
  FieldConfigEditorRegistry,
  FieldConfigSource,
  GrafanaPlugin,
  PanelEditorProps,
  PanelMigrationHandler,
  PanelOptionEditorsRegistry,
  PanelPluginMeta,
  PanelProps,
  PanelTypeChangedHandler,
  StandardFieldConfigProperties,
} from '../types';
import { FieldConfigEditorBuilder, PanelOptionsEditorBuilder } from '../utils/OptionsUIBuilders';
import { ComponentClass, ComponentType } from 'react';
import set from 'lodash/set';
import { deprecationWarning } from '../utils';

export class PanelPlugin<TOptions = any, TFieldConfigOptions extends object = any> extends GrafanaPlugin<
  PanelPluginMeta
> {
  private _defaults?: TOptions;
  private _commonFieldConfigProperties: StandardFieldConfigProperties[] = [
    StandardFieldConfigProperties.Title,
    StandardFieldConfigProperties.Decimals,
    StandardFieldConfigProperties.Max,
    StandardFieldConfigProperties.Min,
    StandardFieldConfigProperties.NoValue,
    StandardFieldConfigProperties.Links,
    StandardFieldConfigProperties.Unit,
    StandardFieldConfigProperties.Thresholds,
    StandardFieldConfigProperties.Mappings,
    StandardFieldConfigProperties.Color,
  ];

  private _fieldConfigDefaults: FieldConfigSource<TFieldConfigOptions> = {
    defaults: {},
    overrides: [],
  };
  private _customFieldConfigs?: FieldConfigEditorRegistry;
  private customFieldConfigsUIBuilder = new FieldConfigEditorBuilder<TFieldConfigOptions>();
  private registerCustomFieldConfigs?: (builder: FieldConfigEditorBuilder<TFieldConfigOptions>) => void;

  private _optionEditors?: PanelOptionEditorsRegistry;
  private optionsUIBuilder = new PanelOptionsEditorBuilder<TOptions>();
  private registerOptionEditors?: (builder: PanelOptionsEditorBuilder<TOptions>) => void;

  panel: ComponentType<PanelProps<TOptions>>;
  editor?: ComponentClass<PanelEditorProps<TOptions>>;
  onPanelMigration?: PanelMigrationHandler<TOptions>;
  onPanelTypeChanged?: PanelTypeChangedHandler<TOptions>;
  noPadding?: boolean;

  /**
   * Legacy angular ctrl.  If this exists it will be used instead of the panel
   */
  angularPanelCtrl?: any;

  constructor(panel: ComponentType<PanelProps<TOptions>>) {
    super();
    this.panel = panel;
  }

  get defaults() {
    let result = this._defaults || {};

    if (!this._defaults) {
      const editors = this.optionEditors;

      if (!editors || editors.list().length === 0) {
        return null;
      }

      for (const editor of editors.list()) {
        set(result, editor.id, editor.defaultValue);
      }
    }
    return result;
  }

  get fieldConfigDefaults(): FieldConfigSource<TFieldConfigOptions> {
    let result = this._fieldConfigDefaults.defaults.custom;

    if (!result) {
      result = {} as TFieldConfigOptions;
    }
    const editors = this.customFieldConfigs;

    if (!editors || (editors && editors.list().length === 0)) {
      return this._fieldConfigDefaults;
    }

    for (const editor of editors.list()) {
      set(result, editor.id, editor.defaultValue);
    }

    return {
      defaults: {
        ...this._fieldConfigDefaults.defaults,
        custom: Object.keys(result)
          ? {
              ...result,
            }
          : undefined,
      },
      // TODO: not sure yet what about overrides, if anything
      overrides: [],
    };
  }

  get commonFieldConfigProperties() {
    return this._commonFieldConfigProperties;
  }

  /**
   * @deprecated setDefaults is deprecated in favor of setPanelOptions
   */
  setDefaults(defaults: TOptions) {
    deprecationWarning('PanelPlugin', 'setDefaults', 'setPanelOptions');
    this._defaults = defaults;
    return this;
  }

  /**
   * Enables configuration of panel's default field config
   *
   * @deprecated setFieldConfigDefaults is deprecated in favor of setCustomFieldOptions
   */
  setFieldConfigDefaults(defaultConfig: Partial<FieldConfigSource<TFieldConfigOptions>>) {
    this._fieldConfigDefaults = {
      defaults: {},
      overrides: [],
      ...defaultConfig,
    };

    return this;
  }

  get customFieldConfigs() {
    if (!this._customFieldConfigs && this.registerCustomFieldConfigs) {
      this.registerCustomFieldConfigs(this.customFieldConfigsUIBuilder);
      this._customFieldConfigs = this.customFieldConfigsUIBuilder.getRegistry();
    }

    return this._customFieldConfigs;
  }

  get optionEditors() {
    if (!this._optionEditors && this.registerOptionEditors) {
      this.registerOptionEditors(this.optionsUIBuilder);
      this._optionEditors = this.optionsUIBuilder.getRegistry();
    }

    return this._optionEditors;
  }

  setEditor(editor: ComponentClass<PanelEditorProps<TOptions>>) {
    this.editor = editor;
    return this;
  }

  setNoPadding() {
    this.noPadding = true;
    return this;
  }

  /**
   * This function is called before the panel first loads if
   * the current version is different than the version that was saved.
   *
   * This is a good place to support any changes to the options model
   */
  setMigrationHandler(handler: PanelMigrationHandler) {
    this.onPanelMigration = handler;
    return this;
  }

  /**
   * This function is called when the visualization was changed. This
   * passes in the panel model for previous visualisation options inspection
   * and panel model updates.
   *
   * This is useful for supporting PanelModel API updates when changing
   * between Angular and React panels.
   */
  setPanelChangeHandler(handler: PanelTypeChangedHandler) {
    this.onPanelTypeChanged = handler;
    return this;
  }

  /**
   * Enables custom field properties editor creation
   *
   * @example
   * ```typescript
   *
   * import { ShapePanel } from './ShapePanel';
   *
   * interface ShapePanelOptions {}
   *
   * export const plugin = new PanelPlugin<ShapePanelOptions>(ShapePanel)
   *   .setCustomFieldOptions(builder => {
   *     builder
   *       .addNumberInput({
   *         id: 'shapeBorderWidth',
   *         name: 'Border width',
   *         description: 'Border width of the shape',
   *         settings: {
   *           min: 1,
   *           max: 5,
   *         },
   *       })
   *       .addSelect({
   *         id: 'displayMode',
   *         name: 'Display mode',
   *         description: 'How the shape shout be rendered'
   *         settings: {
   *           options: [{value: 'fill', label: 'Fill' }, {value: 'transparent', label: 'Transparent }]
   *         },
   *       })
   *   })
   * ```
   *
   * @public
   **/
  setCustomFieldOptions(builder: (builder: FieldConfigEditorBuilder<TFieldConfigOptions>) => void) {
    // builder is applied lazily when custom field configs are accessed
    this.registerCustomFieldConfigs = builder;
    return this;
  }

  /**
   * Enables panel options editor creation
   *
   * @example
   * ```typescript
   *
   * import { ShapePanel } from './ShapePanel';
   *
   * interface ShapePanelOptions {}
   *
   * export const plugin = new PanelPlugin<ShapePanelOptions>(ShapePanel)
   *   .setPanelOptions(builder => {
   *     builder
   *       .addSelect({
   *         id: 'shape',
   *         name: 'Shape',
   *         description: 'Select shape to render'
   *         settings: {
   *           options: [
   *             {value: 'circle', label: 'Circle' },
   *             {value: 'square', label: 'Square },
   *             {value: 'triangle', label: 'Triangle }
   *            ]
   *         },
   *       })
   *   })
   * ```
   *
   * @public
   **/
  setPanelOptions(builder: (builder: PanelOptionsEditorBuilder<TOptions>) => void) {
    // builder is applied lazily when options UI is created
    this.registerOptionEditors = builder;
    return this;
  }

  /**
   * Allows specyfing which common field config options panel should use
   *
   * @example
   * ```typescript
   *
   * import { ShapePanel } from './ShapePanel';
   *
   * interface ShapePanelOptions {}
   *
   * // when plugin should only display specific common options
   * export const plugin = new PanelPlugin<ShapePanelOptions>(ShapePanel)
   *  .useCommonFieldConfig([StandardFieldConfigProperties.Min, StandardFieldConfigProperties.Max, StandardFieldConfigProperties.Links]);
   *
   * // when plugin should use all common options
   * export const plugin = new PanelPlugin<ShapePanelOptions>(ShapePanel)
   *  .useCommonFieldConfig();
   * ```
   *
   * @public
   */
  useCommonFieldConfig(properties?: StandardFieldConfigProperties[]) {
    if (properties) {
      this._commonFieldConfigProperties = properties;
    }
    return this;
  }
}
