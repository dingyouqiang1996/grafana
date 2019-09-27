// import React from 'react';
import { storiesOf } from '@storybook/react';
import { Table } from './Table';
import { getTheme } from '../../themes';

import { migratedTestTable, migratedTestStyles, simpleTable } from './examples';
import { GrafanaThemeType } from '../../types/index';
import { DataFrame, FieldType, ArrayVector, ScopedVars } from '@grafana/data';
import { withFullSizeStory } from '../../utils/storybook/withFullSizeStory';
import { number, boolean } from '@storybook/addon-knobs';
import Tables from './Tables';

const replaceVariables = (value: string, scopedVars?: ScopedVars) => {
  if (scopedVars) {
    // For testing variables replacement in link
    for (const key in scopedVars) {
      const val = scopedVars[key];
      value = value.replace('$' + key, val.value);
    }
  }
  return value;
};

export function columnIndexToLeter(column: number) {
  const A = 'A'.charCodeAt(0);
  const c1 = Math.floor(column / 26);
  const c2 = column % 26;
  if (c1 > 0) {
    return String.fromCharCode(A + c1 - 1) + String.fromCharCode(A + c2);
  }
  return String.fromCharCode(A + c2);
}

export function makeDummyTable(columnCount: number, rowCount: number): DataFrame {
  return {
    fields: Array.from(new Array(columnCount), (x, i) => {
      const colId = columnIndexToLeter(i);
      const values = new ArrayVector<string>();
      for (let i = 0; i < rowCount; i++) {
        values.buffer.push(colId + (i + 1));
      }
      return {
        name: colId,
        type: FieldType.string,
        config: {},
        values,
      };
    }),
    length: rowCount,
  };
}

storiesOf('UI/Table', module)
  .add('Basic Table', () => {
    // NOTE: This example does not seem to survice rotate &
    // Changing fixed headers... but the next one does?
    // perhaps `simpleTable` is static and reused?

    const showHeader = boolean('Show Header', true);
    const fixedHeader = boolean('Fixed Header', true);
    const fixedColumns = number('Fixed Columns', 0, { min: 0, max: 50, step: 1, range: false });
    const rotate = boolean('Rotate', false);

    return withFullSizeStory(Table, {
      styles: [],
      data: { ...simpleTable },
      replaceVariables,
      showHeader,
      fixedHeader,
      fixedColumns,
      rotate,
      theme: getTheme(GrafanaThemeType.Light),
    });
  })
  .add('Variable Size', () => {
    const columnCount = number('Column Count', 15, { min: 2, max: 50, step: 1, range: false });
    const rowCount = number('Row Count', 20, { min: 0, max: 100, step: 1, range: false });

    const showHeader = boolean('Show Header', true);
    const fixedHeader = boolean('Fixed Header', true);
    const fixedColumns = number('Fixed Columns', 1, { min: 0, max: 50, step: 1, range: false });
    const rotate = boolean('Rotate', false);

    return withFullSizeStory(Table, {
      styles: [],
      data: makeDummyTable(columnCount, rowCount),
      replaceVariables,
      showHeader,
      fixedHeader,
      fixedColumns,
      rotate,
      theme: getTheme(GrafanaThemeType.Light),
    });
  })
  .add('Test Config (migrated)', () => {
    return withFullSizeStory(Table, {
      styles: migratedTestStyles,
      data: migratedTestTable,
      replaceVariables,
      showHeader: true,
      rotate: true,
      theme: getTheme(GrafanaThemeType.Light),
    });
  })
  .add('Multiple Tables', () => {
    const tables: DataFrame[] = [
      readCSV('A,B,C\n1,2,3\n4,5\n,7,8,9,0')[0],
      makeDummyTable(4, 20), // simple
      makeDummyTable(10, 5), // simple
    ];
    tables[0].name = 'from CSV';
    tables[1].name = 'simple wide';
    tables[2].name = 'simple tall';

    tables[0].refId = 'A';
    tables[1].labels = { a: 'AAA', b: 'bbb' };

    const showHeader = boolean('Show Header', true);
    const fixedHeader = boolean('Fixed Header', true);
    const fixedColumns = number('Fixed Columns', 0, { min: 0, max: 50, step: 1, range: false });
    const rotate = boolean('Rotate', false);

    return withFullSizeStory(Tables, {
      styles: [],
      data: tables,
      replaceVariables,
      showHeader,
      fixedHeader,
      fixedColumns,
      rotate,
      theme: getTheme(GrafanaThemeType.Light),
    });
  });
