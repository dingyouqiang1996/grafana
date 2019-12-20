﻿import { ThunkAction } from 'redux-thunk';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { StoreState, ApiKey } from 'app/types';

export enum ActionTypes {
  LoadApiKeys = 'LOAD_API_KEYS',
  SetApiKeysSearchQuery = 'SET_API_KEYS_SEARCH_QUERY',
}

export interface LoadApiKeysAction {
  type: ActionTypes.LoadApiKeys;
  payload: ApiKey[];
}

export interface SetSearchQueryAction {
  type: ActionTypes.SetApiKeysSearchQuery;
  payload: string;
}

export type Action = LoadApiKeysAction | SetSearchQueryAction;

type ThunkResult<R> = ThunkAction<R, StoreState, undefined, Action>;

const apiKeysLoaded = (apiKeys: ApiKey[]): LoadApiKeysAction => ({
  type: ActionTypes.LoadApiKeys,
  payload: apiKeys,
});

export function addApiKey(
  apiKey: ApiKey,
  openModal: (key: string) => void,
  includeExpired: boolean
): ThunkResult<void> {
  return async dispatch => {
    const result = await getBackendSrv().post('/api/auth/keys', apiKey);
    dispatch(setSearchQuery(''));
    dispatch(loadApiKeys(includeExpired));
    openModal(result.key);
  };
}

export function loadApiKeys(includeExpired: boolean): ThunkResult<void> {
  return async dispatch => {
    const response = await getBackendSrv().get('/api/auth/keys?includeExpired=' + includeExpired);
    dispatch(apiKeysLoaded(response));
  };
}

export function deleteApiKey(id: number, includeExpired: boolean): ThunkResult<void> {
  return async dispatch => {
    getBackendSrv()
      .delete('/api/auth/keys/' + id)
      .then(dispatch(loadApiKeys(includeExpired)));
  };
}

export const setSearchQuery = (searchQuery: string): SetSearchQueryAction => ({
  type: ActionTypes.SetApiKeysSearchQuery,
  payload: searchQuery,
});
