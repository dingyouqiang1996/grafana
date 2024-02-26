import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { TestProvider } from 'test/helpers/TestProvider';

import { DataSourceRef } from '@grafana/schema';
import { AlertQuery } from 'app/types/unified-alerting-dto';

import { GrafanaRuleQueryViewer } from './GrafanaRuleQueryViewer';
import { mockCombinedRule } from './mocks';

describe('GrafanaRuleQueryViewer', () => {
  it('renders without crashing', async () => {
    const rule = mockCombinedRule();

    const getDataSourceQuery = (refId: string) => {
      const query: AlertQuery = {
        refId: refId,
        datasourceUid: 'abc123',
        queryType: '',
        relativeTimeRange: {
          from: 600,
          to: 0,
        },
        model: {
          refId: 'A',
        },
      };
      return query;
    };
    const queries = [
      getDataSourceQuery('A'),
      getDataSourceQuery('B'),
      getDataSourceQuery('C'),
      getDataSourceQuery('D'),
      getDataSourceQuery('E'),
    ];

    const getExpression = (refId: string, dsRef: DataSourceRef) => {
      const expr = {
        refId: refId,
        datasourceUid: '__expr__',
        queryType: '',
        model: {
          refId: refId,
          type: 'classic_conditions',
          datasource: dsRef,
          conditions: [
            {
              type: 'query',
              evaluator: {
                params: [3],
                type: 'gt',
              },
              operator: {
                type: 'and',
              },
              query: {
                params: ['A'],
              },
              reducer: {
                params: [],
                type: 'last',
              },
            },
          ],
        },
      };
      return expr;
    };

    const expressions = [
      getExpression('A', { type: '' }),
      getExpression('B', { type: '' }),
      getExpression('C', { type: '' }),
      getExpression('D', { type: '' }),
    ];
    const { getByTestId } = render(
      <GrafanaRuleQueryViewer queries={[...queries, ...expressions]} condition="A" rule={rule} />,
      { wrapper: TestProvider }
    );

    await waitFor(() => {
      expect(getByTestId('queries-container')).toHaveStyle('flex-wrap: wrap');
      expect(getByTestId('expressions-container')).toHaveStyle('flex-wrap: wrap');
    });
  });
});
