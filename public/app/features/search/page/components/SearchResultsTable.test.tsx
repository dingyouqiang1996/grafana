import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';

import { ArrayVector, DataFrame, DataFrameView, FieldType } from '@grafana/data';

import { DashboardQueryResult, getGrafanaSearcher, QueryResponse } from '../../service';
import { DashboardSearchItemType } from '../../types';

import { SearchResultsTable } from './SearchResultsTable';

describe('SearchResultsTable', () => {
  let grafanaSearcherSpy: jest.SpyInstance;
  const mockOnTagSelected = jest.fn();
  const mockClearSelection = jest.fn();
  const mockSelectionToggle = jest.fn();
  const mockSelection = jest.fn();
  const mockKeyboardEvents = new Subject<React.KeyboardEvent>();

  describe('when there is data', () => {
    const searchData: DataFrame = {
      fields: [
        { name: 'kind', type: FieldType.string, config: {}, values: new ArrayVector([DashboardSearchItemType.DashDB]) },
        { name: 'name', type: FieldType.string, config: {}, values: new ArrayVector(['My dashboard 1']) },
        { name: 'uid', type: FieldType.string, config: {}, values: new ArrayVector(['my-dashboard-1']) },
        { name: 'url', type: FieldType.string, config: {}, values: new ArrayVector(['/my-dashboard-1']) },
        { name: 'tags', type: FieldType.other, config: {}, values: new ArrayVector([['foo', 'bar']]) },
        { name: 'location', type: FieldType.string, config: {}, values: new ArrayVector(['/my-dashboard-1']) },
      ],
      length: 1,
    };

    const mockSearchResult: QueryResponse = {
      isItemLoaded: jest.fn(),
      loadMoreItems: jest.fn(),
      totalRows: searchData.length,
      view: new DataFrameView<DashboardQueryResult>(searchData),
    };

    beforeAll(() => {
      grafanaSearcherSpy = jest.spyOn(getGrafanaSearcher(), 'search').mockResolvedValue(mockSearchResult);
    });

    it('shows the table with the correct accessible label', () => {
      render(
        <SearchResultsTable
          keyboardEvents={mockKeyboardEvents}
          response={mockSearchResult}
          onTagSelected={mockOnTagSelected}
          clearSelection={mockClearSelection}
          height={1000}
          width={1000}
        />
      );
      expect(screen.getByRole('table', { name: 'Search results table' })).toBeInTheDocument();
    });

    it('has the correct row headers', async () => {
      render(
        <SearchResultsTable
          keyboardEvents={mockKeyboardEvents}
          response={mockSearchResult}
          onTagSelected={mockOnTagSelected}
          clearSelection={mockClearSelection}
          height={1000}
          width={1000}
        />
      );
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Tags' })).toBeInTheDocument();
    });

    it('displays the data correctly in the table', () => {
      render(
        <SearchResultsTable
          keyboardEvents={mockKeyboardEvents}
          response={mockSearchResult}
          onTagSelected={mockOnTagSelected}
          clearSelection={mockClearSelection}
          height={1000}
          width={1000}
        />
      );
      const rows = screen.getAllByRole('row');
      console.log(screen.debug());
      expect(rows).toHaveLength(2);
      expect(within(rows[1]).getByText('My dashboard 1')).toBeInTheDocument();
      expect(within(rows[1]).getByText('foo')).toBeInTheDocument();
      expect(within(rows[1]).getByText('bar')).toBeInTheDocument();
    });
  });

  describe('when there is no data', () => {
    const emptySearchData: DataFrame = {
      fields: [
        { name: 'kind', type: FieldType.string, config: {}, values: new ArrayVector([]) },
        { name: 'name', type: FieldType.string, config: {}, values: new ArrayVector([]) },
        { name: 'uid', type: FieldType.string, config: {}, values: new ArrayVector([]) },
        { name: 'url', type: FieldType.string, config: {}, values: new ArrayVector([]) },
        { name: 'tags', type: FieldType.other, config: {}, values: new ArrayVector([]) },
        { name: 'location', type: FieldType.string, config: {}, values: new ArrayVector([]) },
      ],
      length: 0,
    };

    const mockEmptySearchResult: QueryResponse = {
      isItemLoaded: jest.fn(),
      loadMoreItems: jest.fn(),
      totalRows: emptySearchData.length,
      view: new DataFrameView<DashboardQueryResult>(emptySearchData),
    };

    beforeAll(() => {
      grafanaSearcherSpy = jest.spyOn(getGrafanaSearcher(), 'search').mockResolvedValue(mockEmptySearchResult);
    });

    it('shows a "No data" message', () => {
      render(
        <SearchResultsTable
          keyboardEvents={mockKeyboardEvents}
          response={mockEmptySearchResult}
          onTagSelected={mockOnTagSelected}
          clearSelection={mockClearSelection}
          height={1000}
          width={1000}
        />
      );
      expect(screen.queryByRole('table', { name: 'Search results table' })).not.toBeInTheDocument();
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });
});
