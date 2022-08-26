import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { getTemplateSrv, TemplateSrv } from 'app/features/templating/template_srv';

import { DruidSettings, DruidQuery } from './types';

const druidVariableRegex = /\"\[\[(\w+)(?::druid:(\w+))?\]\]\"|\"\${(\w+)(?::druid:(\w+))?}\"/g;

interface AdHocFilterItem {
  key?: any;
  operator?: any;
  value?: any
}

export class DruidDataSource extends DataSourceWithBackend<DruidQuery, DruidSettings> {

  constructor(
    instanceSettings: DataSourceInstanceSettings<DruidSettings>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv(),
  ) {
    super(instanceSettings);
  }

  filterQuery(query: DruidQuery) {
    return !query.hide;
  }

  applyTemplateVariables(templatedQuery: DruidQuery) {
    const shouldEnhanceWithAdHocFilters = templatedQuery.datasource && templatedQuery.datasource.type === "grafadruid-druid-datasource";
    let template = JSON.stringify({...templatedQuery, expr: undefined});

    if (shouldEnhanceWithAdHocFilters) {
      template = this.enhanceExprWithAdHocFilters(template);
    }

    template = template.replace(
      druidVariableRegex,
      (match, variable1, format1, variable2, format2) => {
        if (format1 || format2 === 'json') {
          return '${' + (variable1 || variable2) + ':doublequote}';
        }
        return match;
      }
    );

    let expr = templatedQuery.expr;
    if (shouldEnhanceWithAdHocFilters) {
      expr = this.enhanceExprWithAdHocFilters(expr);
    }

    return {...JSON.parse(this.templateSrv.replace(template)), expr};
  }

  enhanceExprWithAdHocFilters(expr: string) {
    const adhocFilters = this.templateSrv.getAdhocFilters(this.name);

    const exprParsed = JSON.parse(expr);

    const filterMap: Record<string, Record<string, AdHocFilterItem[]>> = adhocFilters.reduce((acc: any, filter: AdHocFilterItem) => {
      let operatorKey = filter.operator;

      if (filter.operator === '>' || filter.operator === '<') {
        operatorKey = '><';
      }

      if (!acc[operatorKey]) {
        acc[operatorKey] = {};
      }

      if (!acc[operatorKey][filter.key]) {
        acc[operatorKey][filter.key] = [filter];
      } else {
        acc[operatorKey][filter.key].push(filter);
      }
      return acc;
    }, {} as Record<string, Record<string, AdHocFilterItem[]>>)

    const equalFilterFields = Object.values(filterMap['='] || {}).map(this.getEqualityFilterField);
    const notEqualFilterFields = Object.values(filterMap['!='] || {}).map(this.getEqualityFilterField);
    const boundFilterFields = Object.values(filterMap['><'] || {}).map(this.getBoundFilterField);


    if (exprParsed.builder && exprParsed.builder.filter) {
      if (exprParsed.builder.filter.type === "and") {
        exprParsed.builder.filter.fields = exprParsed.builder.filter.fields
          .concat(equalFilterFields)
          .concat(boundFilterFields);

        if (notEqualFilterFields.length !== 0) {
          exprParsed.builder.filter.fields.push({
            "type": "not",
            "field": {
              "type": "and",
              "fields": notEqualFilterFields
            }
          });
        }
      }
    }

    return JSON.stringify(exprParsed);
  }

  getBoundFilterField = (filters: AdHocFilterItem[]) => {
    if (filters.length === 1) {
      if (Number.isNaN(Number(filters[0].value))) {
        throw Error(`Bound value should be a number. "${filters[0].value}" is not a number`);
      }
      return filters[0].operator === '>' ? this.getBoundFilterObject(filters[0].value, null, filters[0].key) : this.getBoundFilterObject(null, filters[0].value, filters[0].key)
    } else {
      const operatorsMap = filters.reduce((acc, filter) => {
        if (Number.isNaN(Number(filter.value))) {
          throw Error(`Bound value should be a number. "${filter.value}" is not a number`);
        }
        if (!acc[filter.operator]) {
          acc[filter.operator] = [Number(filter.value)];
        } else {
          acc[filter.operator].push(Number(filter.value));
        }

        return acc;
      }, {} as Record<string, number[]>)

      return this.getBoundFilterObject(
        operatorsMap['>'] ? String(Math.max(...operatorsMap['>'])) : null,
        operatorsMap['<'] ? String(Math.min(...operatorsMap['<'])) : null,
        filters[0].key
      )
    }
  }

  getEqualityFilterField = (filters: AdHocFilterItem[]) => {
    if (filters.length === 1) {
      return {
        dimension: filters[0].key,
        type: "selector",
        value: filters[0].value,
      }
    } else {
      return {
        dimension: filters[0].key,
        type: "in",
        values: filters.map(filter => filter.value),
      }
    }
  }

  getBoundFilterObject = (lower: string | null = null, upper: string | null = null, dimension: string) => {
    return {
      type: "bound",
      dimension,
      lower: lower,
      upper: upper,
    };
  }

  async metricFindQuery(query: DruidQuery, options?: any): Promise<MetricFindValue[]> {
    return this.postResource('query-variable', this.applyTemplateVariables(query)).then((response) => {
      return response;
    });
  }

  async getTagKeys(options?: any) {
    const columnNamesSql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS"
    const tagKeysQuery = {
      "builder": {
        "queryType": "sql",
        "query": columnNamesSql,
      },
      "settings": {},
      "expr": "{\"builder\":{\"queryType\":\"sql\",\"query\":\"" + columnNamesSql + "\",\"intervals\":{\"type\":\"intervals\",\"intervals\":[\"${__from:date:iso}/${__to:date:iso}\"]}},\"settings\":{}}"
    }

    return this.postResource('query-variable', this.applyTemplateVariables(tagKeysQuery as any));
  }

  async getTagValues(options: { key?: string } = {}) {
    const columnValuesSql = `SELECT ${options.key} FROM \"telemetry-dcde9fb7-6cec-4a4a-b015-114795a65ed0\" GROUP BY 1`;
    const tagValuesQuery = {
      "builder": {
        "queryType": "sql",
        "query": columnValuesSql,
      },
      "settings": {},
      "expr": "{\"builder\":{\"queryType\":\"sql\",\"query\":\"" + columnValuesSql + "\",\"intervals\":{\"type\":\"intervals\",\"intervals\":[\"${__from:date:iso}/${__to:date:iso}\"]}},\"settings\":{}}"
    }
    return this.postResource('query-variable', this.applyTemplateVariables(tagValuesQuery as any));
  }
}
