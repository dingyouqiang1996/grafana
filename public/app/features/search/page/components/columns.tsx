import { cx } from '@emotion/css';
import React from 'react';
import SVG from 'react-inlinesvg';

import { Field, FieldType, formattedValueToString, getDisplayProcessor, getFieldDisplayName } from '@grafana/data';
import { config, getDataSourceSrv } from '@grafana/runtime';
import { Checkbox, Icon, IconButton, IconName, TagList } from '@grafana/ui';
import { PluginIconName } from 'app/features/plugins/admin/types';

import { QueryResponse, SearchResultMeta } from '../../service';
import { SelectionChecker, SelectionToggle } from '../selection';

import { TableColumn } from './SearchResultsTable';

const TYPE_COLUMN_WIDTH = 175;
const DATASOURCE_COLUMN_WIDTH = 200;

export const generateColumns = (
  response: QueryResponse,
  availableWidth: number,
  selection: SelectionChecker | undefined,
  selectionToggle: SelectionToggle | undefined,
  clearSelection: () => void,
  styles: { [key: string]: string },
  onTagSelected: (tag: string) => void,
  onDatasourceChange?: (datasource?: string) => void,
  showingEverything?: boolean
): TableColumn[] => {
  const columns: TableColumn[] = [];
  const access = response.view.fields;
  const uidField = access.uid;
  const kindField = access.kind;
  let sortFieldWith = 0;
  const sortField = (access as any)[response.view.dataFrame.meta?.custom?.sortBy] as Field;
  if (sortField) {
    sortFieldWith = 175;
    if (sortField.type === FieldType.time) {
      sortFieldWith += 25;
    }
    availableWidth -= sortFieldWith; // pre-allocate the space for the last column
  }

  let width = 50;
  if (selection && selectionToggle) {
    width = 30;
    columns.push({
      id: `column-checkbox`,
      width,
      Header: () => {
        if (selection('*', '*')) {
          return (
            <div className={styles.checkboxHeader}>
              <IconButton name={'check-square' as any} onClick={clearSelection} />
            </div>
          );
        }
        return (
          <div className={styles.checkboxHeader}>
            <Checkbox
              checked={false}
              onChange={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const { view } = response;
                const count = Math.min(view.length, 50);
                for (let i = 0; i < count; i++) {
                  const item = view.get(i);
                  if (item.uid && item.kind) {
                    if (!selection(item.kind, item.uid)) {
                      selectionToggle(item.kind, item.uid);
                    }
                  }
                }
              }}
            />
          </div>
        );
      },
      Cell: (p) => {
        const uid = uidField.values.get(p.row.index);
        const kind = kindField ? kindField.values.get(p.row.index) : 'dashboard'; // HACK for now
        const selected = selection(kind, uid);
        const hasUID = uid != null; // Panels don't have UID! Likely should not be shown on pages with manage options
        return (
          <div {...p.cellProps}>
            <div className={styles.checkbox}>
              <Checkbox
                disabled={!hasUID}
                value={selected && hasUID}
                onChange={(e) => {
                  selectionToggle(kind, uid);
                }}
              />
            </div>
          </div>
        );
      },
      field: uidField,
    });
    availableWidth -= width;
  }

  // Name column
  width = Math.max(availableWidth * 0.2, 300);
  columns.push({
    Cell: (p) => {
      let classNames = cx(styles.nameCellStyle);
      let name = access.name.values.get(p.row.index);
      if (!name?.length) {
        name = 'Missing title'; // normal for panels
        classNames += ' ' + styles.missingTitleText;
      }
      return (
        <a {...p.cellProps} href={p.userProps.href} className={classNames} title={name}>
          {name}
        </a>
      );
    },
    id: `column-name`,
    field: access.name!,
    Header: () => {
      return <div className={styles.headerNameStyle}>Name</div>;
    },
    width,
  });
  availableWidth -= width;

  width = TYPE_COLUMN_WIDTH;
  columns.push(makeTypeColumn(access.kind, access.panel_type, width, styles));
  availableWidth -= width;

  // Show datasources if we have any
  if (access.ds_uid && onDatasourceChange) {
    width = Math.min(availableWidth / 2.5, DATASOURCE_COLUMN_WIDTH);
    columns.push(
      makeDataSourceColumn(
        access.ds_uid,
        width,
        styles.typeIcon,
        styles.datasourceItem,
        styles.invalidDatasourceItem,
        onDatasourceChange
      )
    );
    availableWidth -= width;
  }

  const showTags = !showingEverything || hasValue(response.view.fields.tags);
  const meta = response.view.dataFrame.meta?.custom as SearchResultMeta;
  if (meta?.locationInfo && availableWidth > 0) {
    width = showTags ? Math.max(availableWidth / 1.75, 300) : availableWidth;
    availableWidth -= width;
    columns.push({
      Cell: (p) => {
        const parts = (access.location?.values.get(p.row.index) ?? '').split('/');
        return (
          <div {...p.cellProps} className={cx(styles.locationCellStyle)}>
            {parts.map((p) => {
              const info = meta.locationInfo[p];
              return info ? (
                <a key={p} href={info.url} className={styles.locationItem}>
                  <Icon name={getIconForKind(info.kind)} /> {info.name}
                </a>
              ) : (
                <span key={p}>{p}</span>
              );
            })}
          </div>
        );
      },
      id: `column-location`,
      field: access.location ?? access.url,
      Header: 'Location',
      width,
    });
  }

  if (availableWidth > 0 && showTags) {
    columns.push(makeTagsColumn(access.tags, availableWidth, styles.tagList, onTagSelected));
  }

  if (sortField && sortFieldWith) {
    const disp = sortField.display ?? getDisplayProcessor({ field: sortField, theme: config.theme2 });
    columns.push({
      Header: () => <div className={styles.sortedHeader}>{getFieldDisplayName(sortField)}</div>,
      Cell: (p) => {
        return (
          <div {...p.cellProps} className={styles.sortedItems}>
            {formattedValueToString(disp(sortField.values.get(p.row.index)))}
          </div>
        );
      },
      id: `column-sort-field`,
      field: sortField,
      width: sortFieldWith,
    });
  }

  return columns;
};

function getIconForKind(v: string): IconName {
  if (v === 'dashboard') {
    return 'apps';
  }
  if (v === 'folder') {
    return 'folder';
  }
  return 'question-circle';
}

function hasValue(f: Field): boolean {
  for (let i = 0; i < f.values.length; i++) {
    if (f.values.get(i) != null) {
      return true;
    }
  }
  return false;
}

function makeDataSourceColumn(
  field: Field<string[]>,
  width: number,
  iconClass: string,
  datasourceItemClass: string,
  invalidDatasourceItemClass: string,
  onDatasourceChange: (datasource?: string) => void
): TableColumn {
  const srv = getDataSourceSrv();
  return {
    id: `column-datasource`,
    field,
    Header: 'Data source',
    Cell: (p) => {
      const dslist = field.values.get(p.row.index);
      if (!dslist?.length) {
        return null;
      }
      return (
        <div {...p.cellProps} className={cx(datasourceItemClass)}>
          {dslist.map((v, i) => {
            const settings = srv.getInstanceSettings(v);
            const icon = settings?.meta?.info?.logos?.small;
            if (icon) {
              return (
                <span
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDatasourceChange(settings.uid);
                  }}
                >
                  <img src={icon} width={14} height={14} title={settings.type} className={iconClass} />
                  {settings.name}
                </span>
              );
            }
            return (
              <span className={invalidDatasourceItemClass} key={i}>
                {v}
              </span>
            );
          })}
        </div>
      );
    },
    width,
  };
}

function makeTypeColumn(
  kindField: Field<string>,
  typeField: Field<string>,
  width: number,
  styles: Record<string, string>
): TableColumn {
  return {
    id: `column-type`,
    field: kindField ?? typeField,
    Header: 'Type',
    Cell: (p) => {
      const i = p.row.index;
      const kind = kindField?.values.get(i) ?? 'dashboard';
      let icon = 'public/img/icons/unicons/apps.svg';
      let txt = 'Dashboard';
      if (kind) {
        txt = kind;
        switch (txt) {
          case 'dashboard':
            txt = 'Dashboard';
            break;

          case 'folder':
            icon = 'public/img/icons/unicons/folder.svg';
            txt = 'Folder';
            break;

          case 'panel':
            icon = `public/img/icons/unicons/${PluginIconName.panel}.svg`;
            const type = typeField.values.get(i);
            if (type) {
              txt = type;
              const info = config.panels[txt];
              if (info?.name) {
                txt = info.name;
              } else {
                switch (type) {
                  case 'row':
                    txt = 'Row';
                    icon = `public/img/icons/unicons/bars.svg`;
                    break;
                  case 'singlestat': // auto-migration
                    txt = 'Singlestat';
                    break;
                  default:
                    icon = `public/img/icons/unicons/question.svg`; // plugin not found
                }
              }
            }
            break;
        }
      }
      return (
        <div {...p.cellProps} className={styles.typeText}>
          <SVG src={icon} width={14} height={14} title={txt} className={styles.typeIcon} />
          {txt}
        </div>
      );
    },
    width,
  };
}

function makeTagsColumn(
  field: Field<string[]>,
  width: number,
  tagListClass: string,
  onTagSelected: (tag: string) => void
): TableColumn {
  return {
    Cell: (p) => {
      const tags = field.values.get(p.row.index);
      return tags ? (
        <div {...p.cellProps}>
          <TagList className={tagListClass} tags={tags} onClick={onTagSelected} />
        </div>
      ) : null;
    },
    id: `column-tags`,
    field: field,
    Header: 'Tags',
    width,
  };
}
