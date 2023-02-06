import {
  AppPluginConfig,
  PluginExtensionTypes,
  PluginsExtensionLinkConfig,
  PluginsExtensionRegistry,
  PluginsExtensionLink,
} from '@grafana/runtime';

export function createPluginExtensionsRegistry(apps: Record<string, AppPluginConfig> = {}): PluginsExtensionRegistry {
  const registry: PluginsExtensionRegistry = {};

  for (const [pluginId, config] of Object.entries(apps)) {
    const extensions = config.extensions;

    if (!Array.isArray(extensions)) {
      continue;
    }

    for (const extension of extensions) {
      const target = extension.target;
      const item = createRegistryItem(pluginId, extension);

      if (!Array.isArray(registry[target])) {
        registry[target] = [item];
        continue;
      }

      registry[target].push(item);
      continue;
    }
  }

  for (const key of Object.keys(registry)) {
    Object.freeze(registry[key]);
  }

  return Object.freeze(registry);
}

function createRegistryItem(pluginId: string, extension: PluginsExtensionLinkConfig): PluginsExtensionLink {
  return Object.freeze({
    type: PluginExtensionTypes.link,
    title: extension.title,
    description: extension.description,
    href: `/a/${pluginId}${extension.path}`,
    key: hashish(extension.title + extension.path),
  });
}

function hashish(vals: string): number {
  return Array.from(vals).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);
}
