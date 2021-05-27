import React from 'react';
import { render } from '@testing-library/react';
import { UnconnectedNodeGraphContainer } from './NodeGraphContainer';
import { getDefaultTimeRange, MutableDataFrame } from '@grafana/data';
import { ExploreId } from '../../types';

describe('NodeGraphContainer', () => {
  it('is collapsed if shown with traces', () => {
    const { container } = render(
      <UnconnectedNodeGraphContainer
        dataFrames={[emptyFrame]}
        exploreId={ExploreId.left}
        range={getDefaultTimeRange()}
        splitOpen={(() => {}) as any}
        withTraceView={true}
      />
    );

    // Make sure we only show header in the collapsible
    expect(container.firstChild?.childNodes.length).toBe(1);
  });

  it('shows the graph if not with trace view', () => {
    const { container } = render(
      <UnconnectedNodeGraphContainer
        dataFrames={[nodes]}
        exploreId={ExploreId.left}
        range={getDefaultTimeRange()}
        splitOpen={(() => {}) as any}
      />
    );

    expect(container.firstChild?.childNodes.length).toBe(2);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

const emptyFrame = new MutableDataFrame();

export const nodes = new MutableDataFrame({
  fields: toFields([
    ['id', ['3fa414edcef6ad90']],
    ['title', ['tempo-querier']],
    ['subTitle', ['HTTP GET - api_traces_traceid']],
    ['mainStat', ['1049.14ms (100%)']],
    ['secondaryStat', ['1047.29ms (99.82%)']],
    ['color', [0.9982395121342127]],
  ]),
});

export function toFields(fields: Array<[string, any[]]>) {
  return fields.map(([name, values]) => {
    return { name, values };
  });
}
