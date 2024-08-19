import { useMemo } from 'react';
import { useObservable } from 'react-use';

import { UsePluginComponentResult } from '@grafana/runtime';

import { useExposedComponentsRegistry } from './ExtensionRegistriesContext';
import { wrapWithPluginContext } from './utils';

export function usePluginComponent<Props extends object = {}>(id: string): UsePluginComponentResult<Props> {
  const registry = useExposedComponentsRegistry();
  const registryState = useObservable(registry.asObservable());

  return useMemo(() => {
    if (!registryState || !registryState[id]) {
      return {
        isLoading: false,
        component: null,
      };
    }

    const registryItem = registryState[id];

    return {
      isLoading: false,
      component: wrapWithPluginContext(registryItem.pluginId, registryItem.config.component),
    };
  }, [id, registryState]);
};
