import { Field, FieldType, DataFrame, Vector, FieldDTO, DataFrameDTO } from '../types/dataFrame';
import { Labels, QueryResultMeta, KeyValue } from '../types/data';
import { guessFieldTypeForField, guessFieldTypeFromValue, toDataFrameDTO } from './processDataFrame';
import { ArrayVector, MutableVector, vectorToArray, CircularVector } from './vector';
import isArray from 'lodash/isArray';

export class FieldCache {
  fields: Field[] = [];

  private fieldByName: { [key: string]: Field } = {};
  private fieldByType: { [key: string]: Field[] } = {};

  constructor(private data: DataFrame) {
    this.fields = data.fields;

    for (const field of data.fields) {
      // Make sure it has a type
      if (field.type === FieldType.other) {
        const t = guessFieldTypeForField(field);
        if (t) {
          field.type = t;
        }
      }
      if (!this.fieldByType[field.type]) {
        this.fieldByType[field.type] = [];
      }
      this.fieldByType[field.type].push(field);

      if (this.fieldByName[field.name]) {
        console.warn('Duplicate field names in DataFrame: ', field.name);
      } else {
        this.fieldByName[field.name] = field;
      }
    }
  }

  getFields(type?: FieldType): Field[] {
    if (!type) {
      return [...this.data.fields]; // All fields
    }
    const fields = this.fieldByType[type];
    if (fields) {
      return [...fields];
    }
    return [];
  }

  hasFieldOfType(type: FieldType): boolean {
    const types = this.fieldByType[type];
    return types && types.length > 0;
  }

  getFirstFieldOfType(type: FieldType): Field | undefined {
    const arr = this.fieldByType[type];
    if (arr && arr.length > 0) {
      return arr[0];
    }
    return undefined;
  }

  hasFieldNamed(name: string): boolean {
    return !!this.fieldByName[name];
  }

  /**
   * Returns the first field with the given name.
   */
  getFieldByName(name: string): Field | undefined {
    return this.fieldByName[name];
  }
}

function makeFieldParser(value: string, field: Field): (value: string) => any {
  if (!field.type) {
    if (field.name === 'time' || field.name === 'Time') {
      field.type = FieldType.time;
    } else {
      field.type = guessFieldTypeFromValue(value);
    }
  }

  if (field.type === FieldType.number) {
    return (value: string) => {
      return parseFloat(value);
    };
  }

  // Will convert anything that starts with "T" to true
  if (field.type === FieldType.boolean) {
    return (value: string) => {
      return !(value[0] === 'F' || value[0] === 'f' || value[0] === '0');
    };
  }

  // Just pass the string back
  return (value: string) => value;
}

export type MutableField<T = any> = Field<T, MutableVector<T>>;

type MutableVectorCreator = (buffer?: any[]) => MutableVector;

export class MutableDataFrame<T = any> implements DataFrame, MutableVector<T> {
  name?: string;
  labels?: Labels;
  refId?: string;
  meta?: QueryResultMeta;

  fields: MutableField[] = [];
  values: KeyValue<MutableVector> = {};

  private first: Vector = new ArrayVector();
  private creator: MutableVectorCreator;

  constructor(source?: DataFrame | DataFrameDTO, creator?: MutableVectorCreator) {
    // This creates the underlying storage buffers
    this.creator = creator
      ? creator
      : (buffer?: any[]) => {
          return new ArrayVector(buffer);
        };

    // Copy values from
    if (source) {
      const { name, labels, refId, meta, fields } = source;
      if (name) {
        this.name = name;
      }
      if (labels) {
        this.labels = labels;
      }
      if (refId) {
        this.refId = refId;
      }
      if (meta) {
        this.meta = meta;
      }
      if (fields) {
        for (const f of fields) {
          this.addField(f);
        }
      }
    }

    // Get Length to show up if you use spread
    Object.defineProperty(this, 'length', {
      enumerable: true,
      get: () => {
        return this.first.length;
      },
    });
  }

  // Defined for Vector interface
  get length() {
    return this.first.length;
  }

  addFieldFor(value: any, name?: string): MutableField {
    return this.addField({
      name: name || '', // Will be filled in
      type: guessFieldTypeFromValue(value),
    });
  }

  addField(f: Field | FieldDTO): MutableField {
    let buffer: any[] | undefined = undefined;
    if (f.values) {
      if (isArray(f.values)) {
        buffer = f.values as any[];
      } else {
        buffer = (f.values as Vector).toArray();
      }
    }
    let type = f.type;
    if (!type && buffer && buffer.length) {
      type = guessFieldTypeFromValue(buffer[0]);
    }
    if (!type) {
      type = FieldType.other;
    }

    // Make sure it has a name
    let name = f.name;
    if (!name) {
      if (type === FieldType.time) {
        name = this.values['Time'] ? `Time ${this.fields.length + 1}` : 'Time';
      } else {
        name = `Field ${this.fields.length + 1}`;
      }
    }
    // The Field Already exists
    if (this.values[name]) {
      throw new Error('Duplicate field name: ' + name);
    }

    const field: MutableField = {
      name,
      type,
      config: f.config || {},
      values: this.creator(buffer),
    };
    if (type === FieldType.other) {
      type = guessFieldTypeForField(field);
      if (type) {
        field.type = type;
      }
    }
    this.values[name] = field.values;
    this.fields.push(field);
    this.first = this.fields[0].values;
    this.validate();
    return field;
  }

  validate() {
    // Make sure all arrays are the same length
    const length = this.fields.reduce((v: number, f) => {
      return Math.max(v, f.values.length);
    }, 0);

    // Add empty elements until everything mastches
    for (const field of this.fields) {
      while (field.values.length !== length) {
        field.values.add(undefined);
      }
    }
  }

  private addMissingFieldsFor(value: any) {
    for (const key of Object.keys(value)) {
      if (!this.values[key]) {
        this.addField({
          name: key,
          type: guessFieldTypeFromValue(value[key]),
        });
      }
    }
  }

  /**
   * Reverse all values
   */
  reverse() {
    for (const f of this.fields) {
      f.values.reverse();
    }
  }

  /**
   * This will add each value to the corresponding column
   */
  appendRow(row: any[]) {
    // Add any extra columns
    for (let i = this.fields.length; i < row.length; i++) {
      this.addField({
        name: `Field ${i + 1}`,
        type: guessFieldTypeFromValue(row[i]),
      });
    }

    // The first line may change the field types
    if (this.length < 1) {
      for (let i = 0; i < this.fields.length; i++) {
        const f = this.fields[i];
        if (!f.type || f.type === FieldType.other) {
          f.type = guessFieldTypeFromValue(row[i]);
        }
      }
    }

    for (let i = 0; i < this.fields.length; i++) {
      const f = this.fields[i];
      const v = row[i];
      if (!f.parse) {
        f.parse = makeFieldParser(v, f);
      }
      f.values.add(f.parse(v));
    }
  }

  /**
   * Add all properties of the value as fields on the frame
   */
  add(value: T, addMissingFields?: boolean) {
    if (addMissingFields) {
      this.addMissingFieldsFor(value);
    }
    // Will add one value for every field
    const obj = value as any;
    for (const field of this.fields) {
      const val = obj[field.name];
      if (!field.parse) {
        field.parse = makeFieldParser(val, field);
      }
      field.values.add(field.parse(val));
    }
  }

  set(index: number, value: T, addMissingFields?: boolean) {
    if (index > this.length) {
      throw new Error('Unable ot set value beyond current length');
    }

    if (addMissingFields) {
      this.addMissingFieldsFor(value);
    }

    const obj = (value as any) || {};
    for (const field of this.fields) {
      field.values.set(index, obj[field.name]);
    }
  }

  /**
   * Get an object with a property for each field in the DataFrame
   */
  get(idx: number): T {
    const v: any = {};
    for (const field of this.fields) {
      v[field.name] = field.values.get(idx);
    }
    return v as T;
  }

  toArray(): T[] {
    return vectorToArray(this);
  }

  /**
   * The simplified JSON values used in JSON.stringify()
   */
  toJSON() {
    return toDataFrameDTO(this);
  }
}

interface CircularOptions {
  append?: 'head' | 'tail';
  capacity?: number;
}

/**
 * This dataframe can have values constantly added, and will never
 * exceed the given capacity
 */
export class CircularDataFrame<T = any> extends MutableDataFrame<T> {
  constructor(options: CircularOptions) {
    super(undefined, (buffer?: any[]) => {
      return new CircularVector({
        buffer,
        ...options,
      });
    });
  }
}
