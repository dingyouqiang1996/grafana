import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

import { DataFrame, Field, IconName } from '@grafana/data';

export { Options as NodeGraphOptions, ArcOption } from './panelcfg.gen';

export type NodeDatum = SimulationNodeDatum & {
  id: string;
  title: string;
  subTitle: string;
  dataFrameRowIndex: number;
  incoming: number;
  mainStat?: Field;
  secondaryStat?: Field;
  arcSections: Field[];
  color?: Field;
  icon?: IconName;
  nodeRadius?: Field;
  highlighted: boolean;
};

export type NodeDatumFromEdge = NodeDatum & { mainStatNumeric?: number; secondaryStatNumeric?: number };

// This is the data we have before the graph is laid out with source and target being string IDs.
type LinkDatum = SimulationLinkDatum<NodeDatum> & {
  source: string;
  target: string;
};

// This is some additional data we expect with the edges.
export type EdgeDatum = LinkDatum & {
  id: string;
  mainStat: string;
  secondaryStat: string;
  dataFrameRowIndex: number;
  sourceNodeRadius: number;
  targetNodeRadius: number;
  highlighted: boolean;
};

// After layout is run D3 will change the string IDs for actual references to the nodes.
export type EdgeDatumLayout = EdgeDatum & {
  source: NodeDatum;
  target: NodeDatum;
};

export type NodesMarker = {
  node: NodeDatum;
  count: number;
};

export type GraphFrame = {
  nodes: DataFrame[];
  edges: DataFrame[];
};
