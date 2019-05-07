import { Field } from '../types/data';
import { ColorScheme } from '../types/scale';
import { getFieldDisplayProcessor } from './scale';

describe('scale', () => {
  const field: Field = {
    name: 'test',
    min: 0,
    max: 100,
    scale: {
      scheme: ColorScheme.Blues,
      thresholds: [],
    },
  };

  it('should clamp values within range', () => {
    const processor = getFieldDisplayProcessor(field);

    expect(processor.interpolate(-100).percent).toEqual(0);
    expect(processor.interpolate(120).percent).toEqual(1);
    expect(processor.interpolate(10).percent).toEqual(0.1);
  });
});

describe('Get color from threshold', () => {
  it('should get first threshold color when only one threshold', () => {
    const thresholds = [{ index: 0, value: -Infinity, color: '#7EB26D' }];
    const field = {
      name: 'test',
      scale: {
        thresholds,
      },
    };
    const processor = getFieldDisplayProcessor(field);
    expect(processor.interpolate(49).color).toEqual('#7EB26D');
  });

  it('should get the threshold color if value is same as a threshold', () => {
    const thresholds = [
      { index: 2, value: 75, color: '#6ED0E0' },
      { index: 1, value: 50, color: '#EAB839' },
      { index: 0, value: -Infinity, color: '#7EB26D' },
    ];
    const field = {
      name: 'test',
      scale: {
        thresholds,
      },
    };
    const processor = getFieldDisplayProcessor(field);
    expect(processor.interpolate(50).color).toEqual('#EAB839');
  });

  it('should get the nearest threshold color between thresholds', () => {
    const thresholds = [
      { index: 2, value: 75, color: '#6ED0E0' },
      { index: 1, value: 50, color: '#EAB839' },
      { index: 0, value: -Infinity, color: '#7EB26D' },
    ];
    const field = {
      name: 'test',
      scale: {
        thresholds,
      },
    };
    const processor = getFieldDisplayProcessor(field);
    expect(processor.interpolate(55).color).toEqual('#EAB839');
  });
});
