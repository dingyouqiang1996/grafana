import * as React from 'react';

import { getCellLinks } from '../../utils';
import { DataLinksContextMenu } from '../DataLinks/DataLinksContextMenu';

import { TableCellProps } from './types';

const DATALINKS_HEIGHT_OFFSET = 10;

export const ImageCell = (props: TableCellProps) => {
  const { field, cell, tableStyles, row, cellProps } = props;

  const displayValue = field.display!(cell.value);

  const hasLinks = Boolean(getCellLinks(field, row)?.length);

  return (
    <div {...cellProps} className={tableStyles.cellContainer}>
      {!hasLinks && (
        <img
          style={{ height: tableStyles.cellHeight - DATALINKS_HEIGHT_OFFSET, width: 'auto' }}
          src={displayValue.text}
          className={tableStyles.imageCell}
          alt=""
        />
      )}
      {hasLinks && (
        <DataLinksContextMenu
          style={{ height: tableStyles.cellHeight - DATALINKS_HEIGHT_OFFSET, width: 'auto' }}
          links={() => getCellLinks(field, row) || []}
        >
          {(api) => {
            const img = (
              <img
                style={{ height: tableStyles.cellHeight - DATALINKS_HEIGHT_OFFSET, width: 'auto' }}
                src={displayValue.text}
                className={tableStyles.imageCell}
                alt=""
              />
            );
            if (api.openMenu) {
              return (
                <div
                  onClick={api.openMenu}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' && api.openMenu) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
                      api.openMenu(e as any);
                    }
                  }}
                >
                  {img}
                </div>
              );
            } else {
              return img;
            }
          }}
        </DataLinksContextMenu>
      )}
    </div>
  );
};
