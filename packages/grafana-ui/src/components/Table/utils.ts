import { TextAlignProperty } from 'csstype';
import { DataFrame, Field, FieldType } from '@grafana/data';
import { TableRow, TableFieldOptions } from './types';
import { Column } from 'react-table';

export function getTableRows(data: DataFrame): TableRow[] {
  const tableData = [];

  for (let i = 0; i < data.length; i++) {
    const row: { [key: string]: string | number } = {};
    for (let j = 0; j < data.fields.length; j++) {
      const prop = data.fields[j].name;
      row[prop] = data.fields[j].values.get(i);
    }
    tableData.push(row);
  }

  return tableData;
}

export function getTextAlign(field: Field): TextAlignProperty {
  if (field.config.custom) {
    const custom = field.config.custom as TableFieldOptions;

    switch (custom.align) {
      case 'right':
        return 'right';
      case 'left':
        return 'left';
      case 'center':
        return 'center';
    }
  }

  if (field.type === FieldType.number) {
    return 'right';
  }

  return 'left';
}

export function getColumns(data: DataFrame, availableWidth: number): Column[] {
  const columns: Column[] = [];
  let fieldCountWithoutWidth = data.fields.length;

  for (const field of data.fields) {
    const fieldTableOptions = (field.config.custom || {}) as TableFieldOptions;
    if (fieldTableOptions.width) {
      availableWidth -= fieldTableOptions.width;
      fieldCountWithoutWidth -= 1;
    }

    columns.push({
      Header: field.name,
      accessor: field.name,
      width: fieldTableOptions.width,
    });
  }

  // divide up the rest of the space
  const sharedWidth = availableWidth / fieldCountWithoutWidth;
  for (const column of columns) {
    if (!column.width) {
      column.width = sharedWidth;
    }
  }

  return columns;
}
