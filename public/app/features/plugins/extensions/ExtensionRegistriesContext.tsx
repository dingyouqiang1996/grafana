import { PropsWithChildren, createContext, useContext } from 'react';

import { ExposedComponentsRegistry } from 'app/features/plugins/extensions/registry/ExposedComponentsRegistry';

// Using a different context for each registry to avoid unnecessary re-renders
export const ExposedComponentsRegistryContext = createContext<ExposedComponentsRegistry | undefined>(undefined);

export function useExposedComponentsRegistry() {
  const context = useContext(ExposedComponentsRegistryContext);
  if (!context) {
    throw new Error('No `ExposedComponentsRegistryContext` found.');
  }
  return context;
}

export interface ExtensionRegistriesContextType {
  registries: {
    exposedComponents: ExposedComponentsRegistry;
  };
}

export const ExtensionRegistriesProvider = ({
  registries,
  children,
}: PropsWithChildren<ExtensionRegistriesContextType>) => {
  return (
    <ExposedComponentsRegistryContext.Provider value={registries.exposedComponents}>
      {children}
    </ExposedComponentsRegistryContext.Provider>
  );
};
