import { ComponentClass } from 'react';
import { SelectOptionItem } from '../components/index';

export interface ExtensionProps<T = any> {
  options: T;
  onOptionsChange: (options: T) => void;
}

export interface Extension<TOptions = any> {
  id: string; // Unique Key -- saved in configs
  name: string; // Display Name, can change without breaking configs
  description: string;
  defaultOptions?: TOptions; // what to use when creating a new instance
  aliasIds?: string[]; // when the ID changes, we may want backwards compatibility ('current' => 'last')

  /**
   * Some extensions should not be user selectable
   *  like: 'all' and 'any' matchers;
   */
  excludeFromPicker?: boolean;

  /**
   * Convert the options to a string
   */
  getOptionsDisplayText?: (options: TOptions) => string;

  /**
   * The Options editor
   */
  editor?: ComponentClass<ExtensionProps<TOptions>>;

  /**
   * ??? maybe a readonly alternative to `getOptionsDisplayText`?
   */
  display?: ComponentClass<ExtensionProps<TOptions>>;
}

interface ExtensionSelectInfo {
  options: Array<SelectOptionItem<string>>;
  current: Array<SelectOptionItem<string>>;
}

export class ExtensionRegistry<T extends Extension> {
  private ordered: T[] = [];
  private byId = new Map<string, T>();
  private initalized = false;

  constructor(private init?: () => T[]) {}

  getIfExists(id: string): T | undefined {
    if (!this.initalized) {
      if (this.init) {
        for (const ext of this.init()) {
          this.register(ext);
        }
      }
      this.initalized = true;
    }
    return this.byId.get(id);
  }

  get(id: string): T {
    const v = this.getIfExists(id);
    if (!v) {
      for (const key of this.byId.keys()) {
        console.log('KEY: ', key);
      }
      throw new Error('Undefined: ' + id);
    }
    return v;
  }

  selectOptions(current?: string[], filter?: (ext: T) => boolean): ExtensionSelectInfo {
    const select = {
      options: [],
      current: [],
    } as ExtensionSelectInfo;

    const currentIds: any = {};
    if (current) {
      for (const id of current) {
        currentIds[id] = true;
      }
    }

    for (const ext of this.ordered) {
      if (ext.excludeFromPicker) {
        continue;
      }
      if (filter && !filter(ext)) {
        continue;
      }

      const option = {
        value: ext.id,
        label: ext.name,
        description: ext.description,
      };

      select.options.push(option);
      if (currentIds[ext.id]) {
        select.current.push(option);
      }
    }
    return select;
  }

  /**
   * Return a list of values by ID, or all values if not specified
   */
  list(ids?: any[]): T[] {
    if (ids) {
      const found: T[] = [];
      for (const id of ids) {
        const v = this.getIfExists(id);
        if (v) {
          found.push(v);
        }
      }
      return found;
    }
    return this.ordered;
  }

  register(ext: T) {
    if (this.byId.has(ext.id)) {
      throw new Error('Duplicate Key:' + ext.id);
    }
    this.byId.set(ext.id, ext);
    this.ordered.push(ext);

    if (ext.aliasIds) {
      for (const alias of ext.aliasIds) {
        if (!this.byId.has(alias)) {
          this.byId.set(alias, ext);
        }
      }
    }
  }
}
