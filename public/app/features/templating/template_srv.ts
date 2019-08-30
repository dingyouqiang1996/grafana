import kbn from 'app/core/utils/kbn';
import _ from 'lodash';
import { variableRegex } from 'app/features/templating/variable';
import { ScopedVars } from '@grafana/ui';
import { TimeRange } from '@grafana/data';

function luceneEscape(value: string) {
  return value.replace(/([\!\*\+\-\=<>\s\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g, '\\$1');
}

export interface TargetToken {
  value: any | any[];
  format?: string | Function;
  variable?: any;
}

export class TemplateSrv {
  variables: any[];

  private regex = variableRegex;
  private index: any = {};
  private grafanaVariables: any = {};
  private builtIns: any = {};
  private timeRange: TimeRange = null;

  constructor() {
    this.builtIns['__interval'] = { text: '1s', value: '1s' };
    this.builtIns['__interval_ms'] = { text: '100', value: '100' };
    this.variables = [];
  }

  init(variables: any, timeRange?: TimeRange) {
    this.variables = variables;
    this.timeRange = timeRange;
    this.updateIndex();
  }

  getBuiltInIntervalValue() {
    return this.builtIns.__interval.value;
  }

  updateIndex() {
    const existsOrEmpty = (value: any) => value || value === '';

    this.index = this.variables.reduce((acc, currentValue) => {
      if (currentValue.current && (currentValue.current.isNone || existsOrEmpty(currentValue.current.value))) {
        acc[currentValue.name] = currentValue;
      }
      return acc;
    }, {});

    if (this.timeRange) {
      const from = this.timeRange.from.valueOf().toString();
      const to = this.timeRange.to.valueOf().toString();

      this.index = {
        ...this.index,
        ['__from']: {
          current: { value: from, text: from },
        },
        ['__to']: {
          current: { value: to, text: to },
        },
      };
    }
  }

  updateTimeRange(timeRange: TimeRange) {
    this.timeRange = timeRange;
    this.updateIndex();
  }

  variableInitialized(variable: any) {
    this.index[variable.name] = variable;
  }

  getAdhocFilters(datasourceName: string) {
    let filters: any = [];

    if (this.variables) {
      for (let i = 0; i < this.variables.length; i++) {
        const variable = this.variables[i];
        if (variable.type !== 'adhoc') {
          continue;
        }

        // null is the "default" datasource
        if (variable.datasource === null || variable.datasource === datasourceName) {
          filters = filters.concat(variable.filters);
        } else if (variable.datasource.indexOf('$') === 0) {
          if (this.replace(variable.datasource) === datasourceName) {
            filters = filters.concat(variable.filters);
          }
        }
      }
    }

    return filters;
  }

  luceneFormat(value: any) {
    if (typeof value === 'string') {
      return luceneEscape(value);
    }
    if (value instanceof Array && value.length === 0) {
      return '__empty__';
    }
    const quotedValues = _.map(value, val => {
      return '"' + luceneEscape(val) + '"';
    });
    return '(' + quotedValues.join(' OR ') + ')';
  }

  // encode string according to RFC 3986; in contrast to encodeURIComponent()
  // also the sub-delims "!", "'", "(", ")" and "*" are encoded;
  // unicode handling uses UTF-8 as in ECMA-262.
  encodeURIComponentStrict(str: string) {
    return encodeURIComponent(str).replace(/[!'()*]/g, c => {
      return (
        '%' +
        c
          .charCodeAt(0)
          .toString(16)
          .toUpperCase()
      );
    });
  }

  formatValue(value: any, format: any, variable: any) {
    // for some scopedVars there is no variable
    variable = variable || {};

    if (typeof format === 'function') {
      return format(value, variable, this.formatValue);
    }

    switch (format) {
      case 'regex': {
        if (typeof value === 'string') {
          return kbn.regexEscape(value);
        }

        const escapedValues = _.map(value, kbn.regexEscape);
        if (escapedValues.length === 1) {
          return escapedValues[0];
        }
        return '(' + escapedValues.join('|') + ')';
      }
      case 'lucene': {
        return this.luceneFormat(value);
      }
      case 'pipe': {
        if (typeof value === 'string') {
          return value;
        }
        return value.join('|');
      }
      case 'distributed': {
        if (typeof value === 'string') {
          return value;
        }
        return this.distributeVariable(value, variable.name);
      }
      case 'csv': {
        if (_.isArray(value)) {
          return value.join(',');
        }
        return value;
      }
      case 'json': {
        return JSON.stringify(value);
      }
      case 'percentencode': {
        // like glob, but url escaped
        if (_.isArray(value)) {
          return this.encodeURIComponentStrict('{' + value.join(',') + '}');
        }
        return this.encodeURIComponentStrict(value);
      }
      default: {
        if (_.isArray(value) && value.length > 1) {
          return '{' + value.join(',') + '}';
        }
        return value;
      }
    }
  }

  setGrafanaVariable(name: string, value: any) {
    this.grafanaVariables[name] = value;
  }

  getVariableName(expression: string) {
    this.regex.lastIndex = 0;
    const match = this.regex.exec(expression);
    if (!match) {
      return null;
    }
    const variableName = match.slice(1).find(match => match !== undefined);
    return variableName;
  }

  variableExists(expression: string) {
    const name = this.getVariableName(expression);
    return name && this.index[name] !== void 0;
  }

  highlightVariablesAsHtml(str: string) {
    if (!str || !_.isString(str)) {
      return str;
    }

    str = _.escape(str);
    this.regex.lastIndex = 0;
    return str.replace(this.regex, (match, var1, var2, fmt2, var3) => {
      if (this.index[var1 || var2 || var3] || this.builtIns[var1 || var2 || var3]) {
        return '<span class="template-variable">' + match + '</span>';
      }
      return match;
    });
  }

  getAllValue(variable: any) {
    if (variable.allValue) {
      return variable.allValue;
    }
    const values = [];
    for (let i = 1; i < variable.options.length; i++) {
      values.push(variable.options[i].value);
    }
    return values;
  }

  replace(target: string, scopedVars?: ScopedVars, format?: string | Function): any {
    if (!target) {
      return target;
    }
    return this.replaceWithoutFormatting(target, scopedVars, format)
      .map(t => this.formatValue(t.value, t.format, t.variable))
      .join('');
  }

  replaceWithoutFormatting(target: string, scopedVars?: ScopedVars, format?: string | Function): TargetToken[] {
    this.regex.lastIndex = 0;
    let lastIndex = 0;
    let tokens: TargetToken[] = [];
    let regexExec = this.regex.exec(target);
    while (regexExec !== null) {
      if (regexExec.index > lastIndex) {
        tokens.push({ value: target.substring(lastIndex, regexExec.index) });
      }
      tokens = tokens.concat(this.replaceVariable(regexExec, scopedVars, format));
      lastIndex = this.regex.lastIndex;
      regexExec = this.regex.exec(target);
    }
    if (target.length > lastIndex) {
      tokens.push({ value: target.substring(lastIndex, target.length) });
    }
    return tokens;
  }

  private replaceVariable(regexExec: any, scopedVars?: ScopedVars, format?: string | Function): TargetToken[] {
    let variable, fmt, systemValue, value, match, var1, var2, fmt2, var3, fmt3;
    [match, var1, var2, fmt2, var3, fmt3] = regexExec;
    variable = this.index[var1 || var2 || var3];
    fmt = fmt2 || fmt3 || format;
    if (scopedVars) {
      value = scopedVars[var1 || var2 || var3];
      if (value) {
        return [{ value: value.value, format: fmt, variable: variable }];
      }
    }

    if (!variable) {
      return [{ value: match }];
    }

    systemValue = this.grafanaVariables[variable.current.value];
    if (systemValue) {
      return [{ value: systemValue, format: fmt, variable: variable }];
    }

    value = variable.current.value;
    if (this.isAllValue(value)) {
      value = this.getAllValue(variable);
      // skip formatting of custom all values
      if (variable.allValue) {
        return this.replaceWithoutFormatting(value);
      }
    }
    return [{ value: value, format: fmt, variable: variable }];
  }

  isAllValue(value: any) {
    return value === '$__all' || (Array.isArray(value) && value[0] === '$__all');
  }

  replaceWithText(target: string, scopedVars: ScopedVars) {
    if (!target) {
      return target;
    }

    let variable;
    this.regex.lastIndex = 0;

    return target.replace(this.regex, (match: any, var1: any, var2: any, fmt2: any, var3: any) => {
      if (scopedVars) {
        const option = scopedVars[var1 || var2 || var3];
        if (option) {
          return option.text;
        }
      }

      variable = this.index[var1 || var2 || var3];
      if (!variable) {
        return match;
      }

      const value = this.grafanaVariables[variable.current.value];

      return typeof value === 'string' ? value : variable.current.text;
    });
  }

  fillVariableValuesForUrl(params: any, scopedVars?: ScopedVars) {
    _.each(this.variables, variable => {
      if (scopedVars && scopedVars[variable.name] !== void 0) {
        if (scopedVars[variable.name].skipUrlSync) {
          return;
        }
        params['var-' + variable.name] = scopedVars[variable.name].value;
      } else {
        if (variable.skipUrlSync) {
          return;
        }
        params['var-' + variable.name] = variable.getValueForUrl();
      }
    });
  }

  distributeVariable(value: any, variable: any) {
    value = _.map(value, (val: any, index: number) => {
      if (index !== 0) {
        return variable + '=' + val;
      } else {
        return val;
      }
    });
    return value.join(',');
  }
}

export default new TemplateSrv();
