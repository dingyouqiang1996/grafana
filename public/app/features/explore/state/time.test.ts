import { dateTime, LoadingState } from '@grafana/data';

import { makeExplorePaneState, makeInitialUpdateState } from './utils';
import { ExploreId, ExploreItemState } from 'app/types/explore';
import { reducerTester } from 'test/core/redux/reducerTester';
import { changeRangeAction, changeRefreshIntervalAction, timeReducer } from './time';

describe('Explore item reducer', () => {
  describe('changing refresh intervals', () => {
    it("should result in 'streaming' state, when live-tailing is active", () => {
      const initialState = makeExplorePaneState();
      const expectedState = {
        ...makeExplorePaneState(),
        refreshInterval: 'LIVE',
        isLive: true,
        loading: true,
        logsResult: {
          hasUniqueLabels: false,
          rows: [] as any[],
        },
        queryResponse: {
          ...makeExplorePaneState().queryResponse,
          state: LoadingState.Streaming,
        },
      };
      reducerTester<ExploreItemState>()
        .givenReducer(timeReducer, initialState)
        .whenActionIsDispatched(changeRefreshIntervalAction({ exploreId: ExploreId.left, refreshInterval: 'LIVE' }))
        .thenStateShouldEqual(expectedState);
    });

    it("should result in 'done' state, when live-tailing is stopped", () => {
      const initialState = makeExplorePaneState();
      const expectedState = {
        ...makeExplorePaneState(),
        refreshInterval: '',
        logsResult: {
          hasUniqueLabels: false,
          rows: [] as any[],
        },
        queryResponse: {
          ...makeExplorePaneState().queryResponse,
          state: LoadingState.Done,
        },
      };
      reducerTester<ExploreItemState>()
        .givenReducer(timeReducer, initialState)
        .whenActionIsDispatched(changeRefreshIntervalAction({ exploreId: ExploreId.left, refreshInterval: '' }))
        .thenStateShouldEqual(expectedState);
    });
  });

  describe('changing range', () => {
    describe('when changeRangeAction is dispatched', () => {
      it('then it should set correct state', () => {
        reducerTester<ExploreItemState>()
          .givenReducer(timeReducer, ({
            update: { ...makeInitialUpdateState(), range: true },
            range: null,
            absoluteRange: null,
          } as unknown) as ExploreItemState)
          .whenActionIsDispatched(
            changeRangeAction({
              exploreId: ExploreId.left,
              absoluteRange: { from: 1546297200000, to: 1546383600000 },
              range: { from: dateTime('2019-01-01'), to: dateTime('2019-01-02'), raw: { from: 'now-1d', to: 'now' } },
            })
          )
          .thenStateShouldEqual(({
            update: { ...makeInitialUpdateState(), range: false },
            absoluteRange: { from: 1546297200000, to: 1546383600000 },
            range: { from: dateTime('2019-01-01'), to: dateTime('2019-01-02'), raw: { from: 'now-1d', to: 'now' } },
          } as unknown) as ExploreItemState);
      });
    });
  });
});
