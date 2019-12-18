import React, { PureComponent } from 'react';
import store from '../../store';

export interface Props<T> {
  key: string;
  defaultValue?: T;
  children: (value: T, onSaveToStore: (value: T) => void) => React.ReactNode;
}

interface State<T> {
  value: T;
}

export class LocalStorageValueProvider<T> extends PureComponent<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    const { key, defaultValue } = props;

    this.state = {
      value: store.getObject(key, defaultValue),
    };
  }

  onSaveToStore = (value: T) => {
    const { key } = this.props;
    store.setObject(key, value);
    this.setState({ value });
  };

  render() {
    const { children } = this.props;
    const { value } = this.state;

    return <>{children(value, this.onSaveToStore)}</>;
  }
}
