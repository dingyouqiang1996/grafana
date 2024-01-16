import React, { FormEvent, PureComponent } from 'react';
import { MapDispatchToProps, MapStateToProps } from 'react-redux';

import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { CustomVariableForm } from 'app/features/dashboard-scene/settings/variables/components/CustomVariableForm';
import { StoreState } from 'app/types';

import { OnPropChangeArguments, VariableEditorProps } from '../editor/types';
import { changeVariableMultiValue } from '../state/actions';
import { CustomVariableModel, VariableWithMultiSupport } from '../types';

interface OwnProps extends VariableEditorProps<CustomVariableModel> {}

interface ConnectedProps {}

interface DispatchProps {
  changeVariableMultiValue: typeof changeVariableMultiValue;
}

export type Props = OwnProps & ConnectedProps & DispatchProps;

class CustomVariableEditorUnconnected extends PureComponent<Props> {
  onChange = (event: FormEvent<HTMLTextAreaElement>) => {
    this.props.onPropChange({
      propName: 'query',
      propValue: event.currentTarget.value,
    });
  };

  onSelectionOptionsChange = async ({ propName, propValue }: OnPropChangeArguments<VariableWithMultiSupport>) => {
    this.props.onPropChange({ propName, propValue, updateOptions: true });
  };

  onBlur = (event: FormEvent<HTMLTextAreaElement>) => {
    this.props.onPropChange({
      propName: 'query',
      propValue: event.currentTarget.value,
      updateOptions: true,
    });
  };

  render() {
    return (
      <CustomVariableForm
        query={this.props.variable.query}
        multi={this.props.variable.multi}
        allValue={this.props.variable.allValue}
        includeAll={this.props.variable.includeAll}
        onQueryChange={this.onChange}
        onMultiChange={(event) =>
          this.onSelectionOptionsChange({ propName: 'multi', propValue: event.currentTarget.checked })
        }
        onIncludeAllChange={(event) =>
          this.onSelectionOptionsChange({ propName: 'includeAll', propValue: event.currentTarget.checked })
        }
        onAllValueChange={(event) =>
          this.onSelectionOptionsChange({ propName: 'allValue', propValue: event.currentTarget.value })
        }
        onQueryBlur={this.onBlur}
      />
    );
  }
}

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state, ownProps) => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  changeVariableMultiValue,
};

export const CustomVariableEditor = connectWithStore(
  CustomVariableEditorUnconnected,
  mapStateToProps,
  mapDispatchToProps
);
