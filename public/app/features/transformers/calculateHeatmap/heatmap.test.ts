import { FieldType } from '@grafana/data';
import { toDataFrame } from '@grafana/data/src/dataframe/processDataFrame';

import { bucketsToScanlines, calculateHeatmapFromData } from './heatmap';
import { HeatmapCalculationOptions } from './models.gen';

describe('Heatmap transformer', () => {
  it('calculate heatmap from input data', async () => {
    const options: HeatmapCalculationOptions = {
      //
    };

    const data = toDataFrame({
      fields: [
        { name: 'time', type: FieldType.time, values: [1, 2, 3, 4] },
        { name: 'temp', type: FieldType.number, config: { unit: 'm2' }, values: [1.1, 2.2, 3.3, 4.4] },
      ],
    });

    const heatmap = calculateHeatmapFromData([data], options);
    expect(heatmap.fields.map((f) => ({ name: f.name, type: f.type, config: f.config }))).toMatchInlineSnapshot(`
      Array [
        Object {
          "config": Object {},
          "name": "xMin",
          "type": "time",
        },
        Object {
          "config": Object {
            "unit": "m2",
          },
          "name": "yMin",
          "type": "number",
        },
        Object {
          "config": Object {
            "unit": "short",
          },
          "name": "count",
          "type": "number",
        },
      ]
    `);
  });

  it('convert heatmap buckets to scanlines', async () => {
    const data = toDataFrame({
      fields: [
        { name: 'time', type: FieldType.time, values: [1, 2, 3] },
        { name: 'A', type: FieldType.number, config: { unit: 'm2' }, values: [1.1, 1.2, 1.3] },
        { name: 'B', type: FieldType.number, config: { unit: 'm2' }, values: [2.1, 2.2, 2.3] },
        { name: 'C', type: FieldType.number, config: { unit: 'm2' }, values: [3.1, 3.2, 3.3] },
      ],
    });

    const heatmap = bucketsToScanlines(data);
    expect(heatmap.fields.map((f) => ({ name: f.name, type: f.type, config: f.config }))).toMatchInlineSnapshot(`
      Array [
        Object {
          "config": Object {},
          "name": "xMax",
          "type": "time",
        },
        Object {
          "config": Object {
            "unit": "m2",
          },
          "name": "y",
          "type": "number",
        },
        Object {
          "config": Object {
            "unit": "short",
          },
          "name": "count",
          "type": "number",
        },
      ]
    `);
    expect(heatmap.meta).toMatchInlineSnapshot(`
      Object {
        "custom": Object {
          "matchByLabel": undefined,
          "yAxisNames": Array [
            "A",
            "B",
            "C",
          ],
          "yLabelValues": undefined,
        },
        "type": "heatmap-scanlines",
      }
    `);
    expect(heatmap.fields[1].values.toArray()).toMatchInlineSnapshot(`
      Array [
        0,
        1,
        2,
        0,
        1,
        2,
        0,
        1,
        2,
      ]
    `);
  });
});
