import React, { FC, useState, useEffect, memo } from 'react';
import { MapDispatchToProps, MapStateToProps } from 'react-redux';
import { appEvents } from 'app/core/core';
import { getLocationQuery } from 'app/core/selectors/location';
import { updateLocation } from 'app/core/reducers/location';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { CoreEvents, StoreState } from 'app/types';
import { OpenSearchParams } from '../types';
import { DashboardSearch } from './DashboardSearch';

interface OwnProps {
  search?: any;
  queryText?: string;
  filter?: string;
}

interface DispatchProps {
  updateLocation: typeof updateLocation;
}

export type Props = OwnProps & DispatchProps;

export const SearchWrapper: FC<Props> = memo(({ search, updateLocation }) => {
  const [payload, setPayload] = useState({});
  const isOpen = search === 'open';

  const closeSearch = () => {
    if (search === 'open') {
      updateLocation({
        query: {
          search: null,
        },
        partial: true,
      });
    }
  };

  useEffect(() => {
    const openSearch = (payload: OpenSearchParams) => {
      if (search !== 'open') {
        setPayload(payload);
        updateLocation({
          query: { search: 'open' },
          partial: true,
        });
      }
    };

    const closeOnItemClick = (payload: any) => {
      // Detect if the event was emitted by clicking on search item
      if (payload?.target === 'search-item' && isOpen) {
        closeSearch();
      }
    };

    appEvents.on(CoreEvents.showDashSearch, openSearch);
    appEvents.on(CoreEvents.hideDashSearch, closeOnItemClick);

    return () => {
      appEvents.off(CoreEvents.showDashSearch, openSearch);
      appEvents.off(CoreEvents.hideDashSearch, closeOnItemClick);
    };
  }, [search]);

  return isOpen ? <DashboardSearch onCloseSearch={closeSearch} payload={payload} /> : null;
});

const mapStateToProps: MapStateToProps<{}, OwnProps, StoreState> = (state: StoreState) => {
  return { search: getLocationQuery(state.location).search };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  updateLocation,
};

export default connectWithStore(SearchWrapper, mapStateToProps, mapDispatchToProps);
