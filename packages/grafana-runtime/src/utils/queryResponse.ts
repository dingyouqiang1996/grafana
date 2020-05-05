import {
  DataQueryResponse,
  arrowTableToDataFrame,
  base64StringToArrowTable,
  KeyValue,
  LoadingState,
  DataQueryError,
} from '@grafana/data';

interface DataResponse {
  error?: string;
  refId?: string;
  dataframes?: string[];
  // series: null,
  // tables: null,
}

/**
 * Parse the results from `/api/ds/query
 */
export function toDataQueryResponse(res: any): DataQueryResponse {
  const rsp: DataQueryResponse = { data: [], state: LoadingState.Done };
  if (res.data?.results) {
    const results: KeyValue = res.data.results;
    for (const refId of Object.keys(results)) {
      const dr = results[refId] as DataResponse;
      if (dr) {
        if (dr.error) {
          if (!rsp.error) {
            rsp.error = {
              refId,
              message: dr.error,
            };
            rsp.state = LoadingState.Error;
          }
        }

        if (dr.dataframes) {
          for (const b64 of dr.dataframes) {
            const t = base64StringToArrowTable(b64);
            const f = arrowTableToDataFrame(t);
            if (!f.refId) {
              f.refId = refId;
            }
            rsp.data.push(f);
          }
        }
      }
    }
  }

  // When it is not an OK response, make sure the error gets added
  if (res.status && res.status !== 200) {
    if (rsp.state !== LoadingState.Error) {
      rsp.state = LoadingState.Error;
    }
    if (!rsp.error) {
      rsp.error = toDataQueryError(res);
    }
  }

  return rsp;
}

/**
 * Convert an object into a DataQueryError -- if this is an HTTP response,
 * it will put the correct values in the error filds
 */
export function toDataQueryError(err: any): DataQueryError {
  const error = (err || {}) as DataQueryError;

  if (!error.message) {
    if (typeof err === 'string' || err instanceof String) {
      return { message: err } as DataQueryError;
    }

    let message = 'Query error';
    if (error.message) {
      message = error.message;
    } else if (error.data && error.data.message) {
      message = error.data.message;
    } else if (error.data && error.data.error) {
      message = error.data.error;
    } else if (error.status) {
      message = `Query error: ${error.status} ${error.statusText}`;
    }
    error.message = message;
  }

  return error;
}
