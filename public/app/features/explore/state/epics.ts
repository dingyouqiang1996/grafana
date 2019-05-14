import { Epic } from 'redux-observable';
import { webSocket } from 'rxjs/webSocket';
import { map, takeUntil, mergeMap, tap, filter } from 'rxjs/operators';

import { StoreState, ExploreId } from 'app/types';
import { ActionOf, ActionCreator, actionCreatorFactory } from '../../../core/redux/actionCreatorFactory';
import { config } from '../../../core/config';
import { updateDatasourceInstanceAction, resetExploreAction, changeRefreshIntervalAction } from './actionTypes';
import { EMPTY } from 'rxjs';
import { isLive } from '@grafana/ui/src/components/RefreshPicker/RefreshPicker';

const convertToWebSocketUrl = (url: string) => {
  const protocol = window.location.protocol === 'https' ? 'wss://' : 'ws://';
  let backend = `${protocol}${window.location.host}${config.appSubUrl}`;
  if (backend.endsWith('/')) {
    backend = backend.slice(0, backend.length - 1);
  }
  return `${backend}${url}`;
};

export interface StartSubscriptionsPayload {
  exploreId: ExploreId;
  dataReceivedActionCreator: ActionCreator<SubscriptionDataReceivedPayload>;
  stopsActionCreator: ActionCreator<StopSubscriptionPayload>;
}

export const startSubscriptionsAction = actionCreatorFactory<StartSubscriptionsPayload>(
  'explore/START_SUBSCRIPTIONS'
).create();

export interface StartSubscriptionPayload {
  url: string;
  refId: string;
  exploreId: ExploreId;
  dataReceivedActionCreator: ActionCreator<SubscriptionDataReceivedPayload>;
  stopsActionCreator: ActionCreator<StopSubscriptionPayload>;
}

export const startSubscriptionAction = actionCreatorFactory<StartSubscriptionPayload>(
  'explore/START_SUBSCRIPTION'
).create();

export interface StopSubscriptionPayload {
  refId: string;
  exploreId: ExploreId;
}

export const stopSubscriptionAction = actionCreatorFactory<StopSubscriptionPayload>(
  'explore/STOP_SUBSCRIPTION'
).create();

export interface PauseSubscriptionPayload extends StopSubscriptionPayload {}
export interface PlaySubscriptionPayload extends StopSubscriptionPayload {}

export interface SubscriptionDataReceivedPayload {
  data: any;
  exploreId: ExploreId;
}

export const subscriptionDataReceivedAction = actionCreatorFactory<SubscriptionDataReceivedPayload>(
  'explore/SUBSCRIPTION_DATA_RECEIVED'
).create();

export const startSubscriptionsEpic: Epic<ActionOf<any>, ActionOf<any>, StoreState> = (action$, state$) => {
  return action$.ofType(startSubscriptionsAction.type).pipe(
    mergeMap((action: ActionOf<StartSubscriptionsPayload>) => {
      const { exploreId, dataReceivedActionCreator, stopsActionCreator } = action.payload;
      const { datasourceInstance, queries, refreshInterval } = state$.value.explore[exploreId];

      if (!datasourceInstance || !datasourceInstance.convertToStreamTargets) {
        return EMPTY; //do nothing if datasource does not support streaming
      }

      if (!refreshInterval || !isLive(refreshInterval)) {
        return EMPTY; //do nothing if refresh interval is not 'LIVE'
      }

      const request: any = { targets: queries };
      return datasourceInstance.convertToStreamTargets(request).map(target =>
        startSubscriptionAction({
          url: convertToWebSocketUrl(target.url),
          refId: target.refId,
          exploreId,
          dataReceivedActionCreator,
          stopsActionCreator,
        })
      );
    })
  );
};

export const startSubscriptionEpic: Epic<ActionOf<any>, ActionOf<any>, StoreState> = action$ => {
  return action$.ofType(startSubscriptionAction.type).pipe(
    mergeMap((action: ActionOf<StartSubscriptionPayload>) => {
      const { url, exploreId, refId, dataReceivedActionCreator, stopsActionCreator } = action.payload;
      return webSocket(url).pipe(
        takeUntil(
          action$
            .ofType(
              startSubscriptionAction.type,
              stopsActionCreator.type,
              resetExploreAction.type,
              updateDatasourceInstanceAction.type,
              changeRefreshIntervalAction.type
            )
            .pipe(
              filter(action => {
                if (action.type === resetExploreAction.type || action.type === updateDatasourceInstanceAction.type) {
                  return true; // stops all subscriptions if user navigates away from explore or changes data source
                }

                if (action.type === changeRefreshIntervalAction.type) {
                  return !isLive(action.payload.refreshInterval); // stops all subscriptions if user changes refresh interval away from 'Live'
                }

                return action.payload.exploreId === exploreId && action.payload.refId === refId;
              }),
              tap(value => console.log('Stopping subscription', value))
            )
        ),
        map(data => {
          return dataReceivedActionCreator({ data, exploreId });
        })
      );
    })
  );
};
