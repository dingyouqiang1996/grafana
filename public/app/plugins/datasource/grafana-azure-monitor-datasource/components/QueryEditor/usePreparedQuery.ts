import deepEqual from 'fast-deep-equal';
import { defaults } from 'lodash';
import { useEffect, useMemo } from 'react';

import { getTemplateSrv } from '@grafana/runtime';

import { AzureMonitorErrorish, AzureMonitorQuery, AzureQueryType } from '../../types';
import migrateQuery from '../../utils/migrateQuery';

const DEFAULT_QUERY = {
  queryType: AzureQueryType.AzureMonitor,
};

const prepareQuery = (
  query: AzureMonitorQuery,
  setError: (errorSource: string, error: AzureMonitorErrorish) => void
) => {
  // Note: _.defaults does not apply default values deeply.
  const withDefaults = defaults({}, query, DEFAULT_QUERY);
  const migratedQuery = migrateQuery(withDefaults, getTemplateSrv(), setError);

  // If we didn't make any changes to the object, then return the original object to keep the
  // identity the same, and not trigger any other useEffects or anything.
  return deepEqual(migratedQuery, query) ? query : migratedQuery;
};

/**
 * Returns queries with some defaults + migrations, and calls onChange function to notify if it changes
 */
const usePreparedQuery = (
  query: AzureMonitorQuery,
  onChangeQuery: (newQuery: AzureMonitorQuery) => void,
  setError: (errorSource: string, error: AzureMonitorErrorish) => void
) => {
  const preparedQuery = useMemo(() => prepareQuery(query, setError), [query, setError]);

  useEffect(() => {
    if (preparedQuery !== query) {
      onChangeQuery(preparedQuery);
    }
  }, [preparedQuery, query, onChangeQuery]);

  return preparedQuery;
};

export default usePreparedQuery;
