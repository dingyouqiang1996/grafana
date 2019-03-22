import React, { PureComponent } from 'react';

import isArray from 'lodash/isArray';
import difference from 'lodash/difference';

import { Select } from '../index';

import { getStatsCalculators, StatCalculatorInfo } from '../../utils/statsCalculator';
import { SelectOptionItem } from '../Select/Select';

interface Props {
  placeholder?: string;
  onChange: (stats: string[]) => void;
  filter?: (stat: StatCalculatorInfo) => boolean;
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

    const current = getStatsCalculators(stats);
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

  onSelectionChange = (item: SelectOptionItem) => {
    const { onChange } = this.props;
    if (isArray(item)) {
      onChange(item.map(v => v.value));
    } else {
      onChange([item.value]);
    }
  };

  // If no filter is defined, get all of them
  allStatsFilter = (v: StatCalculatorInfo) => true;

  render() {
    const { width, stats, allowMultiple, defaultStat, placeholder, filter } = this.props;
    const options = getStatsCalculators()
      .filter(filter || this.allStatsFilter)
      .map(s => {
        return {
          value: s.id,
          label: s.name,
          description: s.description,
        };
      });

    const value: SelectOptionItem[] = options.filter(option => stats.find(stat => option.value === stat));

    return (
      <Select
        width={width}
        value={value}
        isClearable={!defaultStat}
        isMulti={allowMultiple}
        isSearchable={true}
        options={options}
        placeholder={placeholder}
        onChange={this.onSelectionChange}
      />
    );
  }
}
