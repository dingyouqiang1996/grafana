import React, { useCallback } from 'react';

import { SelectableValue } from '@grafana/data';
import PageActionBar from 'app/core/components/PageActionBar/PageActionBar';
import { StoreState, useSelector, useDispatch } from 'app/types';

import { getDataSourcesSearchQuery, getDataSourcesSort, setDataSourcesSearchQuery, setIsSortAscending } from '../state';

const ascendingSortValue = 'alpha-asc';
const descendingSortValue = 'alpha-desc';

const sortOptions = [
  { label: 'Sort by A–Z', value: ascendingSortValue },
  { label: 'Sort by Z–A', value: descendingSortValue },
];

export function DataSourcesListHeader() {
  const dispatch = useDispatch();
  const setSearchQuery = useCallback((q: string) => dispatch(setDataSourcesSearchQuery(q)), [dispatch]);
  const searchQuery = useSelector(({ dataSources }: StoreState) => getDataSourcesSearchQuery(dataSources));

  const setSort = useCallback(
    (sort: SelectableValue) => dispatch(setIsSortAscending(sort.value === ascendingSortValue)),
    [dispatch]
  );
  const isSortAscending = useSelector(({ dataSources }: StoreState) => getDataSourcesSort(dataSources));

  const sortPicker = {
    onChange: setSort,
    value: isSortAscending ? ascendingSortValue : descendingSortValue,
    getSortOptions: () => Promise.resolve(sortOptions),
  };

  return (
    <PageActionBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} key="action-bar" sortPicker={sortPicker} />
  );
}
