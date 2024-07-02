import { DataLink, DynamicConfigValue, FieldMatcherID, PanelModel } from '@grafana/data';

import { CanvasElementOptions, Options } from './panelcfg.gen';

export const canvasMigrationHandler = (panel: PanelModel): Partial<Options> => {
  const pluginVersion = panel?.pluginVersion ?? '';

  // Rename text-box to rectangle
  // Initial plugin version is empty string for first migration
  if (pluginVersion === '') {
    const root = panel.options?.root;
    if (root?.elements) {
      for (const element of root.elements) {
        if (element.type === 'text-box') {
          element.type = 'rectangle';
        }
      }
    }
  }

  if (pluginVersion.startsWith('11.0')) {
    // Migration for v11.0 for ellipse element refactor: https://github.com/grafana/grafana/pull/84205
    const root = panel.options?.root;
    if (root?.elements) {
      for (const element of root.elements) {
        if (element.type === 'ellipse') {
          // Take existing ellipse specific background and border config and apply it to the element's general background and border config
          if (element.config.backgroundColor) {
            element.background = element.config.backgroundColor;
            delete element.config.backgroundColor;
          }
          if (element.config.borderColor) {
            element.border.color = element.config.borderColor;
            delete element.config.borderColor;
          }
          if (element.config.width) {
            element.border.width = element.config.width;
            delete element.config.width;
          }
        }
      }
    }
  }

  let defaultLinks = panel.fieldConfig.defaults.links;

  if (defaultLinks != null) {
    // copy to all elements that have any field-mapped dimension
    addLinks(panel.options.root.elements, defaultLinks);
    panel.fieldConfig.defaults.links = undefined;
  }

  for (const override of panel.fieldConfig.overrides) {
    if (override.matcher.id === FieldMatcherID.byName) {
      let props: DynamicConfigValue[] = [];

      // append override links to elements with dimensiones mapped to same field name
      // TODO: this isnt 100% correct, cause it will append to any already-added default field links, rather than override those
      for (const prop of override.properties) {
        if (prop.id === 'links') {
          addLinks(panel.options.root.elements, prop.value, override.matcher.options);
        } else {
          props.push(prop);
        }
      }

      override.properties = props;
    }
  }

  return panel.options;
};

function addLinks(elements: CanvasElementOptions[], links: DataLink[], fieldName?: string) {
  elements.forEach((element) => {
    let cfg = element.config as Record<string, any>;

    for (let k in cfg) {
      let dim = cfg[k];

      // todo: getFieldDisplayName?
      if (dim.field === fieldName) {
        element.config.links ??= [];
        element.config.links.push(...links);
      }
    }
  });
}
