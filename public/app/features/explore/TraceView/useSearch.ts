import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { filterSpansNewTraceViewHeader, TraceSpan } from './components';

export interface SearchProps {
  serviceName?: string;
  serviceNameOperator: string;
  spanName?: string;
  spanNameOperator: string;
  from?: string;
  fromOperator: string;
  to?: string;
  toOperator: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  key?: string;
  operator: string;
  value?: string;
}

export const randomId = () => uuidv4().slice(0, 12);

export const defaultTagFilter = {
  id: randomId(),
  operator: '=',
};

export const defaultFilters = {
  spanNameOperator: '=',
  serviceNameOperator: '=',
  fromOperator: '>',
  toOperator: '<',
  tags: [defaultTagFilter],
};

/**
 * Controls the state of search input that highlights spans if they match the search string.
 * @param spans
 */
export function useSearchNewTraceViewHeader(spans?: TraceSpan[]) {
  const [newTraceViewHeaderSearch, setNewTraceViewHeaderSearch] = useState<SearchProps>(defaultFilters);
  const spanFilterMatches: Set<string> | undefined = useMemo(() => {
    return spans && filterSpansNewTraceViewHeader(newTraceViewHeaderSearch, spans);
  }, [newTraceViewHeaderSearch, spans]);

  return { newTraceViewHeaderSearch, setNewTraceViewHeaderSearch, spanFilterMatches };
}
