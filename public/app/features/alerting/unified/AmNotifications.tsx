import { AlertmanagerGroup } from 'app/plugins/datasource/alertmanager/types';
import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { AlertingPageWrapper } from './components/AlertingPageWrapper';
import { AlertManagerPicker } from './components/AlertManagerPicker';
import { useAlertManagerSourceName } from './hooks/useAlertManagerSourceName';
import { useUnifiedAlertingSelector } from './hooks/useUnifiedAlertingSelector';
import { fetchAlertGroupsAction } from './state/actions';
import { initialAsyncRequestState } from './utils/redux';

import { AmNotificationsGroup } from './components/amnotifications/AmNotificationsGroup';
import { NOTIFICATIONS_POLL_INTERVAL_MS } from './utils/constants';

const AlertManagerNotifications = () => {
  const [alertManagerSourceName, setAlertManagerSourceName] = useAlertManagerSourceName();
  const dispatch = useDispatch();

  const alertGroups = useUnifiedAlertingSelector((state) => state.amAlertGroups) || initialAsyncRequestState;
  const results: AlertmanagerGroup[] = alertGroups[alertManagerSourceName || '']?.result || [];

  useEffect(() => {
    function fetchNotifications() {
      if (alertManagerSourceName) {
        dispatch(fetchAlertGroupsAction(alertManagerSourceName));
      }
    }
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications, NOTIFICATIONS_POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [dispatch, alertManagerSourceName]);

  return (
    <AlertingPageWrapper pageId="notifications">
      <AlertManagerPicker current={alertManagerSourceName} onChange={setAlertManagerSourceName} />
      {results &&
        results.map((group, index) => {
          return (
            <AmNotificationsGroup
              alertManagerSourceName={alertManagerSourceName || ''}
              key={`${JSON.stringify(group.labels)}-group-${index}`}
              group={group}
            />
          );
        })}
    </AlertingPageWrapper>
  );
};

export default AlertManagerNotifications;
