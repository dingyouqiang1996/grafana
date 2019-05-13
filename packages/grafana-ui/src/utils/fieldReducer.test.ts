import { ReducerID, reduceField, fieldReducers } from './fieldReducer';

import _ from 'lodash';

describe('Stats Calculators', () => {
  const basicTable = {
    fields: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
    rows: [[10, 20, 30], [20, 30, 40]],
  };

  it('should load all standard stats', () => {
    for (const id of Object.keys(ReducerID)) {
      const reducer = fieldReducers.getIfExists(id);
      const found = reducer ? reducer.id : '<NOT FOUND>';
      expect(found).toEqual(id);
    }
  });

  it('should fail to load unknown stats', () => {
    const names = ['not a stat', ReducerID.max, ReducerID.min, 'also not a stat'];
    const stats = fieldReducers.list(names);
    expect(stats.length).toBe(2);

    const found = stats.map(v => v.id);
    const notFound = _.difference(names, found);
    expect(notFound.length).toBe(2);

    expect(notFound[0]).toBe('not a stat');
  });

  it('should calculate basic stats', () => {
    const stats = reduceField({
      series: basicTable,
      fieldIndex: 0,
      reducers: ['first', 'last', 'mean'],
    });

    // First
    expect(stats.first).toEqual(10);

    // Last
    expect(stats.last).toEqual(20);

    // Mean
    expect(stats.mean).toEqual(15);
  });

  it('should support a single stat also', () => {
    const stats = reduceField({
      series: basicTable,
      fieldIndex: 0,
      reducers: ['first'],
    });

    // Should do the simple version that just looks up value
    expect(Object.keys(stats).length).toEqual(1);
    expect(stats.first).toEqual(10);
  });

  it('should get non standard stats', () => {
    const stats = reduceField({
      series: basicTable,
      fieldIndex: 0,
      reducers: [ReducerID.distinctCount, ReducerID.changeCount],
    });

    expect(stats.distinctCount).toEqual(2);
    expect(stats.changeCount).toEqual(1);
  });

  it('should calculate step', () => {
    const stats = reduceField({
      series: { fields: [{ name: 'A' }], rows: [[100], [200], [300], [400]] },
      fieldIndex: 0,
      reducers: [ReducerID.step, ReducerID.delta],
    });

    expect(stats.step).toEqual(100);
    expect(stats.delta).toEqual(300);
  });
});
