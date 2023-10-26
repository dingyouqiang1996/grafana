import { css } from '@emotion/css';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import {
  DataFrame,
  ExploreLogsPanelState,
  GrafanaTheme2,
  Labels,
  LogsSortOrder,
  SplitOpen,
  TimeRange,
} from '@grafana/data/src';
import { reportInteraction } from '@grafana/runtime/src';
import { Themeable2 } from '@grafana/ui/src';

import { parseLogsFrame } from '../../logs/logsFrame';

import { LogsColumnSearch } from './LogsColumnSearch';
import { LogsTable } from './LogsTable';
import { LogsTableMultiSelect } from './LogsTableMultiSelect';
import { fuzzySearch } from './utils/uFuzzy';

interface Props extends Themeable2 {
  logsFrames: DataFrame[];
  width: number;
  timeZone: string;
  splitOpen: SplitOpen;
  range: TimeRange;
  logsSortOrder: LogsSortOrder;
  panelState: ExploreLogsPanelState | undefined;
  updatePanelState: (panelState: Partial<ExploreLogsPanelState>) => void;
  onClickFilterLabel?: (key: string, value: string, refId?: string) => void;
  onClickFilterOutLabel?: (key: string, value: string, refId?: string) => void;
}

export type fieldNameMeta = { percentOfLinesWithLabel: number; active: boolean | undefined };
type fieldName = string;
type fieldNameMetaStore = Record<fieldName, fieldNameMeta>;

export function LogsTableWrap(props: Props) {
  const { logsFrames } = props;
  // Save the normalized cardinality of each label
  const [columnsWithMeta, setColumnsWithMeta] = useState<fieldNameMetaStore | undefined>(undefined);

  // Filtered copy of columnsWithMeta that only includes matching results
  const [filteredColumnsWithMeta, setFilteredColumnsWithMeta] = useState<fieldNameMetaStore | undefined>(undefined);

  const [height, setHeight] = useState<number>(600);

  const dataFrame = logsFrames[0];

  /**
   * when the query results change, we need to update the columnsWithMeta state
   * and reset any local search state
   * @todo refactor
   *
   * This will also find all the unique labels, and calculate how many log lines have each label into the labelCardinality Map
   * Then it normalizes the counts
   *
   */
  useEffect(() => {
    const numberOfLogLines = dataFrame ? dataFrame.length : 0;
    const logsFrame = parseLogsFrame(dataFrame);
    const labels = logsFrame?.getAttributesAsLabels();

    const otherFields = logsFrame ? logsFrame.extraFields.filter((field) => !field?.config?.custom?.hidden) : [];
    if (logsFrame?.severityField) {
      otherFields.push(logsFrame?.severityField);
    }

    // Use a map to dedupe labels and count their occurrences in the logs
    const labelCardinality = new Map<fieldName, fieldNameMeta>();

    // What the label state will look like
    let pendingLabelState: fieldNameMetaStore = {};

    // If we have labels and log lines
    if (labels?.length && numberOfLogLines) {
      // Iterate through all of Labels
      labels.forEach((labels: Labels) => {
        const labelsArray = Object.keys(labels);
        // Iterate through the label values
        labelsArray.forEach((label) => {
          // If it's already in our map, increment the count
          if (labelCardinality.has(label)) {
            const value = labelCardinality.get(label);
            if (value) {
              labelCardinality.set(label, {
                percentOfLinesWithLabel: value.percentOfLinesWithLabel + 1,
                active: value?.active,
              });
            }
            // Otherwise add it
          } else {
            labelCardinality.set(label, { percentOfLinesWithLabel: 1, active: undefined });
          }
        });
      });

      // Converting the map to an object
      pendingLabelState = Object.fromEntries(labelCardinality);

      // Convert count to percent of log lines
      Object.keys(pendingLabelState).forEach((key) => {
        pendingLabelState[key].percentOfLinesWithLabel = normalize(
          pendingLabelState[key].percentOfLinesWithLabel,
          numberOfLogLines
        );
      });
    }

    // Normalize the other fields
    otherFields.forEach((field) => {
      pendingLabelState[field.name] = {
        percentOfLinesWithLabel: normalize(
          field.values.filter((value) => value !== null && value !== undefined).length,
          numberOfLogLines
        ),
        active: pendingLabelState[field.name]?.active,
      };
    });

    setColumnsWithMeta(pendingLabelState);

    // The panel state is updated when the user interacts with the multi-select sidebar
    // This updates the url, which updates the props of this component, we don't want to re-calculate the column state in this case even though it's used by this hook
  }, [dataFrame]);

  // As the number of rows change, so too must the height of the table
  useEffect(() => {
    setHeight(getTableHeight(dataFrame.length, false));
  }, [dataFrame.length]);

  if (!columnsWithMeta) {
    return null;
  }

  function columnFilterEvent(columnName: string) {
    if (columnsWithMeta) {
      const newState = !columnsWithMeta[columnName]?.active;
      const priorActiveCount = Object.keys(columnsWithMeta).filter((column) => columnsWithMeta[column]?.active)?.length;
      const event = {
        columnAction: newState ? 'add' : 'remove',
        columnCount: newState ? priorActiveCount + 1 : priorActiveCount - 1,
      };

      reportInteraction('grafana_explore_logs_table_column_filter_clicked', event);
    }
  }

  function searchFilterEvent(searchResultCount: number) {
    reportInteraction('grafana_explore_logs_table_text_search_result_count', {
      resultCount: searchResultCount,
    });
  }

  // Toggle a column on or off when the user interacts with an element in the multi-select sidebar
  const toggleColumn = (columnName: fieldName) => {
    if (!columnsWithMeta || !(columnName in columnsWithMeta)) {
      console.warn('failed to get column', columnsWithMeta);
      return;
    }

    const pendingLabelState = {
      ...columnsWithMeta,
      [columnName]: { ...columnsWithMeta[columnName], active: !columnsWithMeta[columnName]?.active },
    };

    // Analytics
    columnFilterEvent(columnName);

    // Set local state
    setColumnsWithMeta(pendingLabelState);

    // If user is currently filtering, update filtered state
    if (filteredColumnsWithMeta) {
      const pendingFilteredLabelState = {
        ...filteredColumnsWithMeta,
        [columnName]: { ...filteredColumnsWithMeta[columnName], active: !filteredColumnsWithMeta[columnName]?.active },
      };
      setFilteredColumnsWithMeta(pendingFilteredLabelState);
    }
  };

  // uFuzzy search dispatcher, adds any matches to the local state
  const dispatcher = (data: string[][]) => {
    const matches = data[0];
    let newColumnsWithMeta: fieldNameMetaStore = {};
    let numberOfResults = 0;
    matches.forEach((match) => {
      if (match in columnsWithMeta) {
        newColumnsWithMeta[match] = columnsWithMeta[match];
        numberOfResults++;
      }
    });
    setFilteredColumnsWithMeta(newColumnsWithMeta);
    searchFilterEvent(numberOfResults);
  };

  // uFuzzy search
  const search = (needle: string) => {
    fuzzySearch(Object.keys(columnsWithMeta), needle, dispatcher);
  };

  // Debounce fuzzy search
  const debouncedSearch = debounce(search, 500);

  // onChange handler for search input
  const onSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget?.value;
    if (value) {
      debouncedSearch(value);
    } else {
      // If the search input is empty, reset the local search state.
      setFilteredColumnsWithMeta(undefined);
    }
  };

  const sidebarWidth = 220;
  const totalWidth = props.width;
  const tableWidth = totalWidth - sidebarWidth;
  const styles = getStyles(props.theme, height, sidebarWidth);

  return (
    <div className={styles.wrapper}>
      <section className={styles.sidebar}>
        <LogsColumnSearch onChange={onSearchInputChange} />
        <LogsTableMultiSelect
          toggleColumn={toggleColumn}
          filteredColumnsWithMeta={filteredColumnsWithMeta}
          columnsWithMeta={columnsWithMeta}
        />
      </section>
      <LogsTable
        onClickFilterLabel={props.onClickFilterLabel}
        onClickFilterOutLabel={props.onClickFilterOutLabel}
        logsSortOrder={props.logsSortOrder}
        range={props.range}
        splitOpen={props.splitOpen}
        timeZone={props.timeZone}
        width={tableWidth}
        logsFrames={logsFrames}
        columnsWithMeta={columnsWithMeta}
        height={height}
      />
    </div>
  );
}

const normalize = (value: number, total: number): number => {
  return Math.ceil((100 * value) / total);
};

function getStyles(theme: GrafanaTheme2, height: number, width: number) {
  return {
    wrapper: css({
      display: 'flex',
    }),
    sidebar: css({
      height: height,
      fontSize: theme.typography.pxToRem(11),
      overflowY: 'hidden',
      width: width,
      paddingRight: theme.spacing(1.5),
    }),

    labelCount: css({}),
    checkbox: css({}),
  };
}

/**
 * from public/app/features/explore/Table/TableContainer.tsx
 */
const getTableHeight = (rowCount: number, hasSubFrames: boolean) => {
  if (rowCount === 0) {
    return 200;
  }
  // 600px is pretty small for taller monitors, using the innerHeight minus an arbitrary 500px so the table can be viewed in its entirety without needing to scroll outside the panel to see the top and the bottom
  const max = Math.max(window.innerHeight - 500, 600);
  const min = Math.max(rowCount * 36, hasSubFrames ? 300 : 0) + 40 + 46;
  // tries to estimate table height, with a min of 300 and a max of 600
  // if there are multiple tables, there is no min
  return Math.min(max, min);
};
