// Libraries
import React, { PureComponent } from 'react';
import config from 'app/core/config';
import classNames from 'classnames';

// Utils & Services
import { getAngularLoader, AngularComponent } from 'app/core/services/AngularLoader';
import { importPanelPlugin } from 'app/features/plugins/plugin_loader';

// Components
import { AddPanelWidget } from '../components/AddPanelWidget';
import { getPanelPluginNotFound } from './PanelPluginNotFound';
import { DashboardRow } from '../components/DashboardRow';
import { PanelChrome } from './PanelChrome';
import { PanelEditor } from '../panel_editor/PanelEditor';
import { PanelResizer } from './PanelResizer';

// Types
import { PanelModel, DashboardModel } from '../state';
import { loadPanelRef, copyReference } from '../state/PanelReference';
import { PanelPluginMeta } from 'app/types';
import { AngularPanelPlugin, PanelPlugin } from '@grafana/ui/src/types/panel';
import { AutoSizer } from 'react-virtualized';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  isEditing: boolean;
  isFullscreen: boolean;
}

export interface State {
  plugin: PanelPluginMeta;
  angularPanel: AngularComponent;
}

export class DashboardPanel extends PureComponent<Props, State> {
  element: HTMLElement;
  specialPanels: any = {};

  constructor(props: Props) {
    super(props);

    this.state = {
      plugin: null,
      angularPanel: null,
    };

    this.specialPanels['row'] = this.renderRow.bind(this);
    this.specialPanels['add-panel'] = this.renderAddPanel.bind(this);
  }

  isSpecial(pluginId: string) {
    return this.specialPanels[pluginId];
  }

  renderRow() {
    return <DashboardRow panel={this.props.panel} dashboard={this.props.dashboard} />;
  }

  renderAddPanel() {
    return <AddPanelWidget panel={this.props.panel} dashboard={this.props.dashboard} />;
  }

  onPluginTypeChanged = (plugin: PanelPluginMeta) => {
    this.loadPlugin(plugin.id);
  };

  async loadPlugin(pluginId: string) {
    if (this.isSpecial(pluginId)) {
      return;
    }

    const { panel } = this.props;

    if (panel.reference) {
      // TODO -- error handling!!!!
      const ref = await loadPanelRef(panel.reference);
      if (ref.error) {
        console.error('TODO? Show an error for missing reference', ref);
        const plugin = getPanelPluginNotFound('XXX: ' + ref.error);
        this.setState({ plugin, angularPanel: null });
        return;
      }

      // Check if the panel type is changing
      const before = panel.type;
      copyReference(panel, ref.panel);
      if (before !== panel.type) {
        console.log('Change plugin type to match reference!', before, '>>', panel.type);
        if (this.state.angularPanel != null) {
          panel.destroy();
          this.cleanUpAngularPanel();
        }
      }

      // Load the new panel type
      pluginId = panel.type;
      console.log('Load Panel from:', ref);
    }

    // handle plugin loading & changing of plugin type
    if (!this.state.plugin || this.state.plugin.id !== pluginId) {
      let plugin = config.panels[pluginId] || getPanelPluginNotFound(pluginId);

      // unmount angular panel
      this.cleanUpAngularPanel();

      // load the actual plugin code
      plugin = await this.importPanelPluginModule(plugin);

      if (panel.type !== pluginId) {
        panel.changePlugin(plugin);
      } else {
        panel.pluginLoaded(plugin);
      }

      this.setState({ plugin, angularPanel: null });
    }
  }

  async importPanelPluginModule(plugin: PanelPluginMeta): Promise<PanelPluginMeta> {
    if (plugin.hasBeenImported) {
      return plugin;
    }

    try {
      const importedPlugin = await importPanelPlugin(plugin.module);
      if (importedPlugin instanceof AngularPanelPlugin) {
        plugin.angularPlugin = importedPlugin as AngularPanelPlugin;
      } else if (importedPlugin instanceof PanelPlugin) {
        plugin.vizPlugin = importedPlugin as PanelPlugin;
      }
    } catch (e) {
      plugin = getPanelPluginNotFound(plugin.id);
      console.log('Failed to import plugin module', e);
    }

    plugin.hasBeenImported = true;
    return plugin;
  }

  componentDidMount() {
    this.loadPlugin(this.props.panel.type);
  }

  componentDidUpdate() {
    if (!this.element || this.state.angularPanel) {
      return;
    }

    const loader = getAngularLoader();
    const template = '<plugin-component type="panel" class="panel-height-helper"></plugin-component>';
    const scopeProps = { panel: this.props.panel, dashboard: this.props.dashboard };
    const angularPanel = loader.load(this.element, scopeProps, template);

    this.setState({ angularPanel });
  }

  cleanUpAngularPanel() {
    if (this.state.angularPanel) {
      this.state.angularPanel.destroy();
      this.element = null;
    }
  }

  componentWillUnmount() {
    this.cleanUpAngularPanel();
  }

  onMouseEnter = () => {
    this.props.dashboard.setPanelFocus(this.props.panel.id);
  };

  onMouseLeave = () => {
    this.props.dashboard.setPanelFocus(0);
  };

  renderReactPanel() {
    const { dashboard, panel, isFullscreen } = this.props;
    const { plugin } = this.state;

    return (
      <AutoSizer>
        {({ width, height }) => {
          if (width === 0) {
            return null;
          }
          return (
            <PanelChrome
              plugin={plugin}
              panel={panel}
              dashboard={dashboard}
              isFullscreen={isFullscreen}
              width={width}
              height={height}
            />
          );
        }}
      </AutoSizer>
    );
  }

  renderAngularPanel() {
    return <div ref={element => (this.element = element)} className="panel-height-helper" />;
  }

  render() {
    const { panel, dashboard, isFullscreen, isEditing } = this.props;
    const { plugin, angularPanel } = this.state;

    if (this.isSpecial(panel.type)) {
      return this.specialPanels[panel.type]();
    }

    // if we have not loaded plugin exports yet, wait
    if (!plugin || !plugin.hasBeenImported) {
      return null;
    }

    const containerClass = classNames({ 'panel-editor-container': isEditing, 'panel-height-helper': !isEditing });
    const panelWrapperClass = classNames({
      'panel-wrapper': true,
      'panel-wrapper--edit': isEditing,
      'panel-wrapper--view': isFullscreen && !isEditing,
    });

    return (
      <div className={containerClass}>
        <PanelResizer
          isEditing={isEditing}
          panel={panel}
          render={styles => (
            <div
              className={panelWrapperClass}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              style={styles}
            >
              {plugin.vizPlugin && this.renderReactPanel()}
              {plugin.angularPlugin && this.renderAngularPanel()}
            </div>
          )}
        />
        {panel.isEditing && (
          <PanelEditor
            panel={panel}
            plugin={plugin}
            dashboard={dashboard}
            angularPanel={angularPanel}
            onTypeChanged={this.onPluginTypeChanged}
          />
        )}
      </div>
    );
  }
}
