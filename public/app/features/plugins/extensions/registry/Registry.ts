import { Observable, ReplaySubject, Subject, firstValueFrom, map, scan, startWith } from 'rxjs';

import { deepFreeze } from '../utils';

export type PluginExtensionConfigs<T> = {
  pluginId: string;
  configs: T[];
};

export type RegistryItem<T> = {
  pluginId: string;
  config: T;
};

export type RegistryType<T> = Record<string | symbol, RegistryItem<T>>;

// This is the base-class used by the separate specific registries.
export abstract class Registry<T> {
  // Used in cases when we would like to pass a read-only registry to plugin.
  // In these cases we are passing in the `registrySubject` to the constructor.
  // (If TRUE `initialState` is ignored.)
  private isReadOnly: boolean;
  // This is the subject that receives extension configs for a loaded plugin.
  private resultSubject: Subject<PluginExtensionConfigs<T>>;
  // This is the subject that we expose.
  // (It will buffer the last value on the stream - the registry - and emit it to new subscribers immediately.)
  private registrySubject: ReplaySubject<RegistryType<T>>;

  constructor(options: { registrySubject?: ReplaySubject<RegistryType<T>>; initialState?: RegistryType<T> }) {
    this.resultSubject = new Subject<PluginExtensionConfigs<T>>();
    this.isReadOnly = false;

    // If the registry subject (observable) is provided, it means that all the registry updates are taken care of outside of this class -> it is read-only.
    if (options.registrySubject) {
      this.registrySubject = options.registrySubject;
      this.isReadOnly = true;

      return;
    }

    this.registrySubject = new ReplaySubject<RegistryType<T>>(1);
    this.resultSubject
      .pipe(
        scan(this.mapToRegistry, options.initialState ?? {}),
        // Emit an empty registry to start the stream (it is only going to do it once during construction, and then just passes down the values)
        startWith(options.initialState ?? {}),
        map((registry) => deepFreeze(registry))
      )
      // Emitting the new registry to `this.registrySubject`
      .subscribe(this.registrySubject);
  }

  abstract mapToRegistry(registry: RegistryType<T>, item: PluginExtensionConfigs<T>): RegistryType<T>;

  register(result: PluginExtensionConfigs<T>): void {
    if (this.isReadOnly) {
      throw new Error('Cannot register to a read-only registry');
    }

    this.resultSubject.next(result);
  }

  asObservable(): Observable<RegistryType<T>> {
    return this.registrySubject.asObservable();
  }

  getState(): Promise<RegistryType<T>> {
    return firstValueFrom(this.asObservable());
  }

  /**
   * Returns a read-only version of the registry.
   */
  readOnly() {
    return new (this.constructor as new (options: { registrySubject: ReplaySubject<RegistryType<T>> }) => this)({
      registrySubject: this.registrySubject,
    });
  }
}
