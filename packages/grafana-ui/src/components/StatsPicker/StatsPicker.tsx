import React, { PureComponent } from 'react';

import isArray from 'lodash/isArray';
import difference from 'lodash/difference';

import { Select } from '../index';

import { statsCalculators } from '../../utils/statsCalculator';
import { SelectOptionItem } from '../Select/Select';

interface Props {
  placeholder?: string;
  onChange: (stats: string[]) => void;
  stats: string[];
  width?: number;
  allowMultiple?: boolean;
  defaultStat?: string;
}

export class StatsPicker extends PureComponent<Props> {
  static defaultProps = {
    width: 12,
    allowMultiple: false,
  };

  componentDidMount() {
    this.checkInput();
  }

  componentDidUpdate(prevProps: Props) {
    this.checkInput();
  }

  checkInput = () => {
    const { stats, allowMultiple, defaultStat, onChange } = this.props;

    const current = statsCalculators.list(stats);
    if (current.length !== stats.length) {
      const found = current.map(v => v.id);
      const notFound = difference(stats, found);
      console.warn('Unknown stats', notFound, stats);
      onChange(current.map(stat => stat.id));
    }

    // Make sure there is only one
    if (!allowMultiple && stats.length > 1) {
      console.warn('Removing extra stat', stats);
      onChange([stats[0]]);
    }

    // Set the reducer from callback
    if (defaultStat && stats.length < 1) {
      onChange([defaultStat]);
    }
  };

  onSelectionChange = (item: SelectOptionItem<string>) => {
    const { onChange } = this.props;
    if (isArray(item)) {
      onChange(item.map(v => v.value));
    } else {
      onChange(item.value ? [item.value] : []);
    }
  };

  render() {
    const { width, stats, allowMultiple, defaultStat, placeholder } = this.props;

    const select = statsCalculators.selectOptions(stats);
    console.log('GET STATs', select);

    return (
      <Select
        width={width}
        value={select.current}
        isClearable={!defaultStat}
        isMulti={allowMultiple}
        isSearchable={true}
        options={select.options}
        placeholder={placeholder}
        onChange={this.onSelectionChange}
      />
    );
  }
}
