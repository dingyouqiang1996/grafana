import DataEditor, {
  GridCell,
  Item,
  GridColumn,
  EditableGridCell,
  GridSelection,
  CellClickedEventArgs,
  Rectangle,
  HeaderClickedEventArgs,
} from '@glideapps/glide-data-grid';
import React, { useEffect, useReducer } from 'react';

import { ArrayVector, Field, PanelProps, FieldType, DataFrame } from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { usePanelContext, useTheme2 } from '@grafana/ui';

import '@glideapps/glide-data-grid/dist/index.css';

import { AddColumn } from './components/AddColumn';
import { DatagridContextMenu } from './components/DatagridContextMenu';
import { RenameColumnCell } from './components/RenameColumnCell';
import { isDatagridEditEnabled } from './featureFlagUtils';
import { PanelOptions } from './panelcfg.gen';
import { DatagridActionType, datagridReducer, initialState } from './state';
import {
  clearCellsFromRangeSelection,
  deleteRows,
  EMPTY_CELL,
  getGridCellKind,
  getGridTheme,
  RIGHT_ELEMENT_PROPS,
  TRAILING_ROW_OPTIONS,
  getStyles,
  ROW_MARKER_BOTH,
  ROW_MARKER_NUMBER,
  hasGridSelection,
} from './utils';

export interface DataGridProps extends PanelProps<PanelOptions> {}

export function DataGridPanel({ options, data, id, fieldConfig, width, height }: DataGridProps) {
  const [state, dispatch] = useReducer(datagridReducer, initialState);
  const { onUpdateData } = usePanelContext();

  const {
    columns,
    contextMenuData,
    renameColumnInputData,
    gridSelection,
    columnFreezeIndex,
    toggleSearch,
    isResizeInProgress,
  } = state;

  const frame = data.series[options.selectedSeries ?? 0];

  const theme = useTheme2();
  const gridTheme = getGridTheme(theme);

  useEffect(() => {
    if (!frame) {
      return;
    }

    dispatch({ type: DatagridActionType.updateColumns, payload: { frame } });
  }, [frame]);

  const getCellContent = ([col, row]: Item): GridCell => {
    const field: Field = frame.fields[col];

    if (!field || row > frame.length) {
      return EMPTY_CELL;
    }

    return getGridCellKind(field, row, hasGridSelection(gridSelection));
  };

  const onCellEdited = async (cell: Item, newValue: EditableGridCell) => {
    const [col, row] = cell;
    const frameCopy = {
      ...frame,
      fields: frame.fields.map((f) => {
        return {
          ...f,
          values: new ArrayVector(f.values),
        };
      }),
    };
    const field: Field = frameCopy.fields[col];

    if (!field) {
      return;
    }

    const values = field.values.toArray();

    values[row] = newValue.data;
    field.values = new ArrayVector(values);

    if (onUpdateData && isDatagridEditEnabled()) {
      onUpdateData([frameCopy]);
    }
  };

  const onColumnInputBlur = (columnName: string) => {
    const len = frame.length ?? 0;
    if (onUpdateData && isDatagridEditEnabled()) {
      onUpdateData([
        {
          ...frame,
          fields: [
            ...frame.fields,
            {
              name: columnName,
              type: FieldType.string,
              config: {},
              values: new Array(len).fill(''),
            },
          ],
        },
      ]);
    }
  };

  const addNewRow = () => {
    const fields = frame.fields.map((f) => {
      const values = f.values.slice(); // copy
      values.push(null);
      return { ...f, values };
    });

    if (onUpdateData) {
      onUpdateData([{ ...frame, fields, length: frame.length + 1 }]);
    }
  };

  const onColumnResize = (column: GridColumn, width: number, columnIndex: number, newSizeWithGrow: number) => {
    dispatch({ type: DatagridActionType.columnResizeStart, payload: { columnIndex, width } });
  };

  //Hack used to allow resizing last column, near add column btn. This is a workaround for a bug in the grid component
  const onColumnResizeEnd = (column: GridColumn, newSize: number, colIndex: number, newSizeWithGrow: number) => {
    dispatch({ type: DatagridActionType.columnResizeEnd });
  };

  const closeContextMenu = () => {
    dispatch({ type: DatagridActionType.closeContextMenu });
  };

  const onDeletePressed = (selection: GridSelection) => {
    if (selection.current && selection.current.range && onUpdateData) {
      onUpdateData([clearCellsFromRangeSelection(frame, selection.current.range)]);
    }

    if (selection.rows && onUpdateData) {
      onUpdateData([deleteRows(frame, selection.rows.toArray())]);
    }

    return false;
  };

  const onCellContextMenu = (cell: Item, event: CellClickedEventArgs) => {
    event.preventDefault();
    dispatch({ type: DatagridActionType.openCellContextMenu, payload: { event, cell } });
  };

  const onHeaderContextMenu = (columnIndex: number, event: HeaderClickedEventArgs) => {
    event.preventDefault();
    dispatch({ type: DatagridActionType.openHeaderContextMenu, payload: { event, columnIndex } });
  };

  const onHeaderMenuClick = (col: number, screenPosition: Rectangle) => {
    dispatch({
      type: DatagridActionType.openHeaderDropdownMenu,
      payload: { screenPosition, columnIndex: col, value: frame.fields[col].name },
    });
  };

  const onColumnMove = (from: number, to: number) => {
    const fields = frame.fields.map((f) => f);
    const field = fields[from];
    fields.splice(from, 1);
    fields.splice(to, 0, field);

    dispatch({ type: DatagridActionType.columnMove, payload: { from, to } });

    if (onUpdateData) {
      onUpdateData([{ ...frame, fields }]);
    }
  };

  const onRowMove = (from: number, to: number) => {
    const fields = frame.fields.map((f) => ({ ...f, values: f.values.slice() }));

    for (const field of fields) {
      const value = field.values[from];
      field.values.splice(from, 1);
      field.values.splice(to, 0, value);
    }

    if (onUpdateData) {
      onUpdateData([{ ...frame, fields }]);
    }
  };

  const onColumnRename = () => {
    dispatch({ type: DatagridActionType.showColumnRenameInput });
  };

  const onRenameInputBlur = (columnName: string, columnIdx: number) => {
    const fields = frame.fields.map((f) => f);
    fields[columnIdx].name = columnName;

    dispatch({ type: DatagridActionType.hideColumnRenameInput });

    if (onUpdateData) {
      onUpdateData([{ ...frame, fields }]);
    }
  };

  const onSearchClose = () => {
    dispatch({ type: DatagridActionType.closeSearch });
  };

  const onGridSelectionChange = (selection: GridSelection) => {
    dispatch({ type: DatagridActionType.multipleCellsSelected, payload: { selection } });
  };

  const onContextMenuSave = (data: DataFrame) => {
    if (onUpdateData) {
      onUpdateData([data]);
    }
  };

  if (!frame) {
    return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data} />;
  }

  if (!document.getElementById('portal')) {
    const portal = document.createElement('div');
    portal.id = 'portal';
    document.body.appendChild(portal);
  }

  const styles = getStyles(theme, isResizeInProgress);

  return (
    <>
      <DataEditor
        className={styles.dataEditor}
        getCellContent={getCellContent}
        columns={columns}
        rows={frame.length}
        width={width}
        height={height}
        initialSize={[width, height]}
        theme={gridTheme}
        smoothScrollX
        smoothScrollY
        overscrollY={50}
        onCellEdited={isDatagridEditEnabled() ? onCellEdited : undefined}
        getCellsForSelection={isDatagridEditEnabled() ? true : undefined}
        showSearch={isDatagridEditEnabled() ? toggleSearch : false}
        onSearchClose={onSearchClose}
        onPaste={isDatagridEditEnabled() ? true : undefined}
        gridSelection={gridSelection}
        onGridSelectionChange={isDatagridEditEnabled() ? onGridSelectionChange : undefined}
        onRowAppended={isDatagridEditEnabled() ? addNewRow : undefined}
        onDelete={isDatagridEditEnabled() ? onDeletePressed : undefined}
        rowMarkers={isDatagridEditEnabled() ? ROW_MARKER_BOTH : ROW_MARKER_NUMBER}
        onColumnResize={onColumnResize}
        onColumnResizeEnd={onColumnResizeEnd}
        onCellContextMenu={isDatagridEditEnabled() ? onCellContextMenu : undefined}
        onHeaderContextMenu={isDatagridEditEnabled() ? onHeaderContextMenu : undefined}
        onHeaderMenuClick={isDatagridEditEnabled() ? onHeaderMenuClick : undefined}
        trailingRowOptions={TRAILING_ROW_OPTIONS}
        rightElement={
          isDatagridEditEnabled() ? (
            <AddColumn onColumnInputBlur={onColumnInputBlur} divStyle={styles.addColumnDiv} />
          ) : null
        }
        rightElementProps={RIGHT_ELEMENT_PROPS}
        freezeColumns={columnFreezeIndex}
        onRowMoved={isDatagridEditEnabled() ? onRowMove : undefined}
        onColumnMoved={isDatagridEditEnabled() ? onColumnMove : undefined}
      />
      {contextMenuData.isContextMenuOpen && (
        <DatagridContextMenu
          menuData={contextMenuData}
          data={frame}
          saveData={onContextMenuSave}
          closeContextMenu={closeContextMenu}
          dispatch={dispatch}
          gridSelection={gridSelection}
          columnFreezeIndex={columnFreezeIndex}
          renameColumnClicked={onColumnRename}
        />
      )}
      {renameColumnInputData.isInputOpen ? (
        <RenameColumnCell
          onColumnInputBlur={onRenameInputBlur}
          renameColumnData={renameColumnInputData}
          classStyle={styles.renameColumnInput}
        />
      ) : null}
    </>
  );
}
