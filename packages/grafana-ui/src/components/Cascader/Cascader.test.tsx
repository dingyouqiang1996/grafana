import React from 'react';
import { Cascader } from './Cascader';
import { shallow } from 'enzyme';

const options = [
  {
    label: 'First',
    value: '1',
    items: [
      {
        label: 'Second',
        value: '2',
      },
      {
        label: 'Third',
        value: '3',
      },
      {
        label: 'Fourth',
        value: '4',
      },
    ],
  },
  {
    label: 'FirstFirst',
    value: '5',
  },
];

const flatOptions = [
  {
    label: 'First / Second',
    value: ['1', '2'],
  },
  {
    label: 'First / Third',
    value: ['1', '3'],
  },
  {
    label: 'First / Fourth',
    value: ['1', '4'],
  },
  {
    label: 'FirstFirst',
    value: ['5'],
  },
];

describe('Cascader', () => {
  let cascader: any;
  beforeEach(() => {
    cascader = shallow(<Cascader options={options} onSelect={() => {}} />);
  });

  it('Should convert options to searchable strings', () => {
    expect(cascader.state('searchableOptions')).toEqual(flatOptions);
  });
});
