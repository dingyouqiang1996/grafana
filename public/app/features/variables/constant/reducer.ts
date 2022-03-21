import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ConstantVariableModel, initialVariableModelState, VariableHide, VariableOption } from '../types';
import { initialVariablesState, VariablePayload, VariablesState } from '../state/types';
import { getInstanceState } from '../state/selectors';

export const initialConstantVariableModelState: ConstantVariableModel = {
  ...initialVariableModelState,
  type: 'constant',
  hide: VariableHide.hideVariable,
  query: '',
  current: {} as VariableOption,
  options: [],
};

export const constantVariableSlice = createSlice({
  name: 'templating/constant',
  initialState: initialVariablesState,
  reducers: {
    createConstantOptionsFromQuery: (state: VariablesState, action: PayloadAction<VariablePayload>) => {
      const instanceState = getInstanceState<ConstantVariableModel>(state, action.payload.id);
      instanceState.options = [
        { text: instanceState.query.trim(), value: instanceState.query.trim(), selected: false },
      ];
    },
  },
});

export const constantVariableReducer = constantVariableSlice.reducer;

export const { createConstantOptionsFromQuery } = constantVariableSlice.actions;
