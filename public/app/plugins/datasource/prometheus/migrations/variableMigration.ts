import { PromVariableQuery, PromVariableQueryType as QueryType } from '../types';

const labelNamesRegex = /^label_names\(\)\s*$/;
const labelValuesRegex = /^label_values\((?:(.+),\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\)\s*$/;
const metricNamesRegex = /^metrics\((.+)\)\s*$/;
const queryResultRegex = /^query_result\((.+)\)\s*$/;

export function migrateVariableQueryToEditor(rawQuery: string | PromVariableQuery): PromVariableQuery {
  // If not string, we assume PromVariableQuery
  if (typeof rawQuery !== 'string') {
    return rawQuery;
  }

  const queryBase = {
    refId: 'PrometheusDatasource-VariableQuery',
    exprType: QueryType.LabelNames,
  };

  const labelNames = rawQuery.match(labelNamesRegex);
  if (labelNames) {
    return {
      ...queryBase,
      exprType: QueryType.LabelNames,
    };
  }

  const labelValues = rawQuery.match(labelValuesRegex);

  if (labelValues) {
    const label = labelValues[2];
    const metric = labelValues[1];
    if (metric) {
      return {
        ...queryBase,
        exprType: QueryType.LabelValues,
        label,
        metric,
      };
    } else {
      return {
        ...queryBase,
        exprType: QueryType.LabelValues,
        label,
      };
    }
  }

  const metricNames = rawQuery.match(metricNamesRegex);
  if (metricNames) {
    return {
      ...queryBase,
      exprType: QueryType.MetricNames,
      metric: metricNames[1],
    };
  }

  const queryResult = rawQuery.match(queryResultRegex);
  if (queryResult) {
    return {
      ...queryBase,
      exprType: QueryType.VarQueryResult,
      varQuery: queryResult[1],
    };
  }

  // seriesQuery does not have a function and no regex above
  if (!labelNames && !labelValues && !metricNames && !queryResult) {
    return {
      ...queryBase,
      exprType: QueryType.SeriesQuery,
      seriesQuery: rawQuery,
    };
  }

  return queryBase;
}

// migrate it back to a string with the correct varialbes in place
export function migrateVariableEditorBackToVariableSupport(QueryVariable: PromVariableQuery): string {
  switch (QueryVariable.exprType) {
    case QueryType.LabelNames:
      return 'label_names()';
    case QueryType.LabelValues:
      if (QueryVariable.metric) {
        return `label_values(${QueryVariable.metric},${QueryVariable.label})`;
      } else {
        return `label_values(${QueryVariable.label})`;
      }
    case QueryType.MetricNames:
      return `metrics(${QueryVariable.metric})`;
    case QueryType.VarQueryResult:
      const varQuery = removeLineBreaks(QueryVariable.varQuery);
      return `query_result(${varQuery})`;
    case QueryType.SeriesQuery:
      return '' + QueryVariable.seriesQuery;
  }

  return '';
}

// allow line breaks in query result textarea
function removeLineBreaks(input?: string) {
  return input ? input.replace(/[\r\n]+/gm, '') : '';
}
