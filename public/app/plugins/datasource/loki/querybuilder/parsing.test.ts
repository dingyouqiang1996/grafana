import { buildVisualQueryFromString } from './parsing';
import { LokiVisualQuery } from './types';

describe('buildVisualQueryFromString', () => {
  it('parses simple query with label-values', () => {
    expect(buildVisualQueryFromString('{app="frontend"}')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [],
      })
    );
  });

  it('parses query with multiple label-values pairs', () => {
    expect(buildVisualQueryFromString('{app="frontend", instance!="1"}')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
          {
            op: '!=',
            value: '1',
            label: 'instance',
          },
        ],
        operations: [],
      })
    );
  });

  it('parses query with line filter', () => {
    expect(buildVisualQueryFromString('{app="frontend"} |= "line"')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: '__line_contains', params: ['line'] }],
      })
    );
  });

  it('parses query with matcher label filter', () => {
    expect(buildVisualQueryFromString('{app="frontend"} | bar="baz"')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: '__label_filter', params: ['bar', '=', 'baz'] }],
      })
    );
  });

  it('parses query with number label filter', () => {
    expect(buildVisualQueryFromString('{app="frontend"} | bar >= 8')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: '__label_filter', params: ['bar', '>=', '8'] }],
      })
    );
  });

  it('parses query with no pipe errors filter', () => {
    expect(buildVisualQueryFromString('{app="frontend"} | __error__=""')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: '__label_filter_no_errors', params: [] }],
      })
    );
  });

  it('parses query with with unit label filter', () => {
    expect(buildVisualQueryFromString('{app="frontend"} | bar < 8mb')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: '__label_filter', params: ['bar', '<', '8mb'] }],
      })
    );
  });

  it('parses query with with parser', () => {
    expect(buildVisualQueryFromString('{app="frontend"} | json')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: 'json', params: [] }],
      })
    );
  });

  it('parses metrics query with function', () => {
    expect(buildVisualQueryFromString('rate({app="frontend"} | json [5m])')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [
          { id: 'json', params: [] },
          { id: 'rate', params: ['5m'] },
        ],
      })
    );
  });

  it('parses metrics query with function and aggregation', () => {
    expect(buildVisualQueryFromString('sum(rate({app="frontend"} | json [5m]))')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [
          { id: 'json', params: [] },
          { id: 'rate', params: ['5m'] },
          { id: 'sum', params: [] },
        ],
      })
    );
  });

  it('parses metrics query with function and aggregation and filters', () => {
    expect(buildVisualQueryFromString('sum(rate({app="frontend"} |~ `abc` | json | bar="baz" [5m]))')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [
          { id: '__line_matches_regex', params: ['`abc`'] },
          { id: 'json', params: [] },
          { id: '__label_filter', params: ['bar', '=', 'baz'] },
          { id: 'rate', params: ['5m'] },
          { id: 'sum', params: [] },
        ],
      })
    );
  });

  it('parses template variables in strings', () => {
    expect(buildVisualQueryFromString('{instance="$label_variable"}')).toEqual(
      noErrors({
        labels: [{ label: 'instance', op: '=', value: '$label_variable' }],
        operations: [],
      })
    );
  });

  it('parses metrics query with interval variables', () => {
    expect(buildVisualQueryFromString('rate({app="frontend"} [$__interval])')).toEqual(
      noErrors({
        labels: [
          {
            op: '=',
            value: 'frontend',
            label: 'app',
          },
        ],
        operations: [{ id: 'rate', params: ['$__interval'] }],
      })
    );
  });
});

function noErrors(query: LokiVisualQuery) {
  return {
    errors: [],
    query,
  };
}
