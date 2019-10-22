import _ from 'lodash';
import { assignModelProperties } from 'app/core/utils/model_utils';

/*
 * This regex matches 3 types of variable reference with an optional format specifier
 * \$(\w+)                          $var1
 * \[\[([\s\S]+?)(?::(\w+))?\]\]    [[var2]] or [[var2:fmt2]]
 * \${(\w+)(?::(\w+))?}             ${var3} or ${var3:fmt3}
 */
export const variableRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::(\w+))?}/g;

// Helper function since lastIndex is not reset
export const variableRegexExec = (variableString: string) => {
  variableRegex.lastIndex = 0;
  return variableRegex.exec(variableString);
};

export const SEARCH_FILTER_VARIABLE = '$__searchFilter';
export const containsSearchFilter = (query: string): boolean =>
  query ? query.indexOf(SEARCH_FILTER_VARIABLE) !== -1 : false;

export interface InterpolateSearchFilterOptions {
  query: string;
  options: any;
  wildcardChar: string;
  quoteLiteral: boolean;
}

export const interpolateSearchFilter = (args: InterpolateSearchFilterOptions): string => {
  const { query, wildcardChar, quoteLiteral } = args;
  let { options } = args;

  if (!containsSearchFilter(query)) {
    return query;
  }

  options = options || {};

  const filter = options.searchFilter ? `${options.searchFilter}${wildcardChar}` : `${wildcardChar}`;
  const replaceValue = quoteLiteral ? `'${filter}'` : filter;

  return query.replace(SEARCH_FILTER_VARIABLE, replaceValue);
};

export interface Variable {
  setValue(option: any): any;
  updateOptions(searchFilter?: string): any;
  dependsOn(variable: any): any;
  setValueFromUrl(urlValue: any): any;
  getValueForUrl(): any;
  getSaveModel(): any;
}

export type CtorType = new (...args: any[]) => {};

export interface VariableTypes {
  [key: string]: {
    name: string;
    ctor: CtorType;
    description: string;
    supportsMulti?: boolean;
  };
}

export let variableTypes: VariableTypes = {};
export { assignModelProperties };

export function containsVariable(...args: any[]) {
  const variableName = args[args.length - 1];
  args[0] = _.isString(args[0]) ? args[0] : Object['values'](args[0]).join(' ');
  const variableString = args.slice(0, -1).join(' ');
  const matches = variableString.match(variableRegex);
  const isMatchingVariable =
    matches !== null
      ? matches.find(match => {
          const varMatch = variableRegexExec(match);
          return varMatch !== null && varMatch.indexOf(variableName) > -1;
        })
      : false;

  return !!isMatchingVariable;
}
