import { chain } from 'lodash';

import { stringToJsRegex } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';

import { ThunkResult } from '../../../types';
import { getDatasourceSrv } from '../../plugins/datasource_srv';
import { changeVariableEditorExtended } from '../editor/reducer';
import { validateVariableSelectionState } from '../state/actions';
import { toKeyedAction } from '../state/keyedVariablesReducer';
import { getVariable } from '../state/selectors';
import { KeyedVariableIdentifier } from '../state/types';
import { DataSourceVariableModel } from '../types';
import { toVariablePayload } from '../utils';

import { createDataSourceOptions } from './reducer';

export interface DataSourceVariableActionDependencies {
  getDatasourceSrv: typeof getDatasourceSrv;
}

export const updateDataSourceVariableOptions =
  (
    identifier: KeyedVariableIdentifier,
    triggerVariableIdentifier: KeyedVariableIdentifier | null,
    dependencies: DataSourceVariableActionDependencies = { getDatasourceSrv: getDatasourceSrv }
  ): ThunkResult<void> =>
  async (dispatch, getState) => {
    const { rootStateKey } = identifier;
    const sources = dependencies.getDatasourceSrv().getList({ metrics: true, variables: false });
    const variableInState = getVariable<DataSourceVariableModel>(identifier, getState());
    let regex;

    if (variableInState.regex) {
      regex = getTemplateSrv().replace(variableInState.regex, undefined, 'regex');
      regex = stringToJsRegex(regex);
    }

    dispatch(toKeyedAction(rootStateKey, createDataSourceOptions(toVariablePayload(identifier, { sources, regex }))));
    await dispatch(validateVariableSelectionState(identifier, triggerVariableIdentifier));
  };

export const initDataSourceVariableEditor =
  (
    key: string,
    dependencies: DataSourceVariableActionDependencies = { getDatasourceSrv: getDatasourceSrv }
  ): ThunkResult<void> =>
  (dispatch) => {
    const dataSources = dependencies.getDatasourceSrv().getList({ metrics: true, variables: true });
    const dataSourceTypes = chain(dataSources)
      .uniqBy('meta.id')
      .map((ds: any) => {
        return { text: ds.meta.name, value: ds.meta.id };
      })
      .value();

    dataSourceTypes.unshift({ text: '', value: '' });

    dispatch(toKeyedAction(key, changeVariableEditorExtended({ dataSourceTypes })));
  };
