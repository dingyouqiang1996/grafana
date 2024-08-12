import { clamp } from 'lodash';

import { config } from '@grafana/runtime';
import {
  SceneGridItemLike,
  SceneGridItemStateLike,
  SceneGridLayout,
  SceneObjectBase,
  SceneObjectState,
  VariableDependencyConfig,
  sceneGraph,
} from '@grafana/scenes';
import { GRID_COLUMN_COUNT } from 'app/core/constants';

import { DashboardGridItem } from './DashboardGridItem';
import { DashboardScene } from './DashboardScene';

export class PanelSearchBehavior extends SceneObjectBase<SceneObjectState> {
  private savedPositions: SceneGridItemStateLike[] | undefined;
  private savedChildren: SceneGridItemLike[] | undefined;

  protected _variableDependency = new VariableDependencyConfig(this, {
    variableNames: ['systemPanelFilterVar', 'systemDynamicRowSizeVar'],
    onReferencedVariableValueChanged: this.onReferencedVariableValueChanged.bind(this),
  });

  constructor() {
    super({});

    this.addActivationHandler(this.onReferencedVariableValueChanged.bind(this));
  }

  private onReferencedVariableValueChanged() {
    if (!config.featureToggles.panelFilterVariable) {
      return;
    }

    if (!(this.parent instanceof DashboardScene)) {
      console.error('Parent is not a DashboardScene');
      return;
    }

    const sceneGridLayout = this.parent.state.body;
    if (!(sceneGridLayout instanceof SceneGridLayout)) {
      console.error('Scene body is not SceneGridLayout');
      return;
    }

    const systemPanelFilter = sceneGraph.lookupVariable('systemPanelFilterVar', this);
    const systemDynamicRowSize = sceneGraph.lookupVariable('systemDynamicRowSizeVar', this);
    const panelFilterValue = systemPanelFilter?.getValue()?.toString();
    const rowSizeVal = systemDynamicRowSize?.getValue()?.valueOf();
    const rowSizeParsed = typeof rowSizeVal === 'string' ? Number.parseInt(rowSizeVal, 10) : rowSizeVal;

    if ((panelFilterValue && panelFilterValue !== '') || (rowSizeParsed && Number.isInteger(rowSizeParsed))) {
      if (!this.savedChildren) {
        this.savedChildren = sceneGridLayout.state.children;
      }

      if (!this.savedPositions) {
        this.savedPositions = sceneGridLayout.state.children.map(({ state }) => ({
          x: state.x,
          y: state.y,
          width: state.width,
          height: state.height,
          isDraggable: state.isDraggable,
          isResizable: state.isResizable,
        }));
      }

      const panelFilterInterpolated = sceneGraph.interpolate(this, panelFilterValue).toLowerCase();
      const filteredChildren = sceneGridLayout.state.children.filter(
        (gridItem) =>
          gridItem instanceof DashboardGridItem &&
          'title' in gridItem.state.body.state &&
          gridItem.state.body.state.title.toLowerCase().includes(panelFilterInterpolated)
      );

      // this._skipOnLayoutChange = true;
      const rowSize = clamp(
        typeof rowSizeParsed === 'number' && Number.isInteger(rowSizeParsed) ? rowSizeParsed : 2,
        1,
        filteredChildren.length
      );
      const panelWidth = GRID_COLUMN_COUNT / rowSize;
      const panelHeight = 5;
      filteredChildren.forEach((child, i) => {
        child.setState({
          x: (i % rowSize) * panelWidth,
          y: Math.floor(i / rowSize) * panelHeight,
          width: panelWidth,
          height: panelHeight,
          isResizable: false,
          isDraggable: false,
        });
      });
      sceneGridLayout.setState({ children: filteredChildren });
    } else if ((!panelFilterValue || panelFilterValue === '') && (!rowSizeVal || rowSizeVal === '')) {
      // Restore saved layout
      if (this.savedChildren && this.savedPositions) {
        this.savedChildren.forEach((child, i) => {
          child.setState({ ...this.savedPositions![i] });
        });
        sceneGridLayout.setState({
          children: this.savedChildren,
        });
        this.savedPositions = undefined;
        this.savedChildren = undefined;
      }
    }
  }
}
