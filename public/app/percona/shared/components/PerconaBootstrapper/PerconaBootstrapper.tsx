import { logger } from '@percona/platform-core';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { contextSrv } from 'app/core/services/context_srv';
import { SettingsService } from 'app/percona/settings/Settings.service';
import {
  setSettings,
  setSettingsLoading,
  setAuthorized,
  fetchServerInfoAction,
  fetchServerSaasHostAction,
  setIsPlatformUser,
} from 'app/percona/shared/core/reducers';

import { UserService } from '../../services/user/User.service';

// This component is only responsible for populating the store with Percona's settings initially
export const PerconaBootstrapper = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getSettings = async () => {
      try {
        dispatch(setSettingsLoading(true));
        const settings = await SettingsService.getSettings(undefined, true);
        dispatch(setSettings(settings));
        dispatch(setAuthorized(true));
      } catch (e) {
        if (e.response?.status === 401) {
          setAuthorized(false);
        }
        dispatch(setSettingsLoading(false));
      }
    };

    const getUserStatus = async () => {
      try {
        const isPlatformUser = await UserService.getUserStatus(undefined, true);
        dispatch(setIsPlatformUser(isPlatformUser));
      } catch (e) {
        logger.error(e);
      }
    };

    const bootstrap = async () => {
      await getSettings();
      await getUserStatus();
      await dispatch(fetchServerInfoAction());
      await dispatch(fetchServerSaasHostAction());
    };

    if (contextSrv.user.isSignedIn) {
      bootstrap();
    }
  }, [dispatch]);

  return <></>;
};
