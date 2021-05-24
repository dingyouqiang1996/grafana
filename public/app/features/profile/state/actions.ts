import { config } from '@grafana/runtime';

import { ChangePasswordFields, ProfileUpdateFields } from '../types';
import { ThunkResult, UserOrg } from '../../../types';
import {
  initLoadOrgs,
  initLoadSessions,
  initLoadTeams,
  initLoadUser,
  orgsLoaded,
  sessionsLoaded,
  setUpdating,
  teamsLoaded,
  userLoaded,
  userSessionRevoked,
} from './reducers';
import { api } from '../api';

export function changePassword(payload: ChangePasswordFields): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(setUpdating({ updating: true }));
    await api.changePassword(payload);
    dispatch(setUpdating({ updating: false }));
  };
}

export function loadUser(): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(initLoadUser());
    const user = await api.loadUser();
    dispatch(userLoaded({ user }));
  };
}

export function loadTeams(): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(initLoadTeams());
    const teams = await api.loadTeams();
    dispatch(teamsLoaded({ teams }));
  };
}

export function loadOrgs(): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(initLoadOrgs());
    const orgs = await api.loadOrgs();
    dispatch(orgsLoaded({ orgs }));
  };
}

export function loadSessions(): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(initLoadSessions());
    const sessions = await api.loadSessions();
    dispatch(sessionsLoaded({ sessions }));
  };
}

export function revokeUserSession(tokenId: number): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(setUpdating({ updating: true }));
    await api.revokeUserSession(tokenId);
    dispatch(userSessionRevoked({ tokenId }));
  };
}

export function changeUserOrg(org: UserOrg): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(setUpdating({ updating: true }));
    await api.setUserOrg(org);
    window.location.href = config.appSubUrl + '/profile';
  };
}

export function updateUserProfile(payload: ProfileUpdateFields): ThunkResult<void> {
  return async function (dispatch) {
    dispatch(setUpdating({ updating: true }));
    await api.updateUserProfile(payload);
    await dispatch(loadUser());
    dispatch(setUpdating({ updating: false }));
  };
}
