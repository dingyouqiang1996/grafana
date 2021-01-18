import { Field, FieldColorModeId, FieldType } from '../types';
import { getTestTheme } from '../utils/testdata/testTheme';
import { ArrayVector } from '../vector/ArrayVector';
import { fieldColorModeRegistry, FieldValueColorCalculator, getFieldSeriesColor } from './fieldColor';

function getTestField(mode: string): Field {
  return {
    name: 'name',
    type: FieldType.number,
    values: new ArrayVector(),
    config: {
      color: {
        mode: mode,
      } as any,
    },
    state: {},
  };
}

interface GetCalcOptions {
  mode: string;
  seriesIndex?: number;
}

function getCalculator(options: GetCalcOptions): FieldValueColorCalculator {
  const field = getTestField(options.mode);
  const mode = fieldColorModeRegistry.get(options.mode);
  field.state!.seriesIndex = options.seriesIndex;
  return mode.getCalculator(field, getTestTheme());
}

describe('fieldColorModeRegistry', () => {
  it('Schemes should interpolate', () => {
    const calcFn = getCalculator({ mode: 'continuous-GrYlRd' });
    expect(calcFn(70, 0.5, undefined)).toEqual('rgb(226, 192, 61)');
  });

  it('Palette classic with series index 0', () => {
    const calcFn = getCalculator({ mode: FieldColorModeId.PaletteClassic, seriesIndex: 0 });
    expect(calcFn(70, 0, undefined)).toEqual('#7EB26D');
  });

  it('Palette classic with series index 1', () => {
    const calcFn = getCalculator({ mode: FieldColorModeId.PaletteClassic, seriesIndex: 1 });
    expect(calcFn(70, 0, undefined)).toEqual('#EAB839');
  });

  it('When color.seriesBy is set to last use that instead of v', () => {
    const field = getTestField('continuous-GrYlRd');

    field.config.color!.seriesBy = 'last';
    // min = -10, max -10, last: 5
    // last percent 75%
    field.values = new ArrayVector([0, -10, 5, 10, 2, 5]);

    const color = getFieldSeriesColor(field, getTestTheme());
    const calcFn = getCalculator({ mode: 'continuous-GrYlRd' });

    expect(color.color).toEqual(calcFn(4, 0.75));
  });
});

describe('getFieldSeriesColor', () => {
  const field = getTestField('continuous-GrYlRd');
  field.values = new ArrayVector([0, -10, 5, 10, 2, 5]);

  it('When color.seriesBy is last use that to calc series color', () => {
    field.config.color!.seriesBy = 'last';
    const color = getFieldSeriesColor(field, getTestTheme());
    const calcFn = getCalculator({ mode: 'continuous-GrYlRd' });

    expect(color.color).toEqual(calcFn(4, 0.75));
  });

  it('When color.seriesBy is max use that to calc series color', () => {
    field.config.color!.seriesBy = 'max';
    const color = getFieldSeriesColor(field, getTestTheme());
    const calcFn = getCalculator({ mode: 'continuous-GrYlRd' });

    expect(color.color).toEqual(calcFn(10, 1));
  });

  it('When color.seriesBy is min use that to calc series color', () => {
    field.config.color!.seriesBy = 'min';
    const color = getFieldSeriesColor(field, getTestTheme());
    const calcFn = getCalculator({ mode: 'continuous-GrYlRd' });

    expect(color.color).toEqual(calcFn(-10, 0));
  });
});
