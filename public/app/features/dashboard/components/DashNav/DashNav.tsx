// Libaries
import React, { PureComponent, FC, ReactNode } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { css } from 'emotion';
// Utils & Services
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { ButtonGroup, Icon, ModalsController, ToolbarButton, PageToolbar } from '@grafana/ui';
import { textUtil } from '@grafana/data';
import { BackButton } from 'app/core/components/BackButton/BackButton';
// State
import { updateLocation } from 'app/core/actions';
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
// Types
import { DashboardModel } from '../../state';
import { CoreEvents, StoreState } from 'app/types';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { SaveDashboardModalProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardModalProxy';

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  $injector: any;
  onAddPanel: () => void;
}

interface DispatchProps {
  updateTimeZoneForSession: typeof updateTimeZoneForSession;
  updateLocation: typeof updateLocation;
}

interface DashNavButtonModel {
  show: (props: Props) => boolean;
  component: FC<Partial<Props>>;
  index?: number | 'end';
}

const customLeftActions: DashNavButtonModel[] = [];
const customRightActions: DashNavButtonModel[] = [];

export function addCustomLeftAction(content: DashNavButtonModel) {
  customLeftActions.push(content);
}

export function addCustomRightAction(content: DashNavButtonModel) {
  customRightActions.push(content);
}

export interface StateProps {
  location: any;
}

type Props = StateProps & OwnProps & DispatchProps;

class DashNav extends PureComponent<Props> {
  playlistSrv: PlaylistSrv;

  constructor(props: Props) {
    super(props);
    this.playlistSrv = this.props.$injector.get('playlistSrv');
  }

  onFolderNameClick = () => {
    this.props.updateLocation({
      query: { search: 'open', folder: 'current' },
      partial: true,
    });
  };

  onClose = () => {
    this.props.updateLocation({
      query: { viewPanel: null },
      partial: true,
    });
  };

  onToggleTVMode = () => {
    appEvents.emit(CoreEvents.toggleKioskMode);
  };

  onOpenSettings = () => {
    this.props.updateLocation({
      query: { editview: 'settings' },
      partial: true,
    });
  };

  onStarDashboard = () => {
    const { dashboard, $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    this.playlistSrv.prev();
  };

  onPlaylistNext = () => {
    this.playlistSrv.next();
  };

  onPlaylistStop = () => {
    this.playlistSrv.stop();
    this.forceUpdate();
  };

  onDashboardNameClick = () => {
    this.props.updateLocation({
      query: { search: 'open' },
      partial: true,
    });
  };

  addCustomContent(actions: DashNavButtonModel[], buttons: ReactNode[]) {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...this.props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  }

  renderLeftActionsButton() {
    const { dashboard } = this.props;
    const { canStar, canShare, isStarred } = dashboard.meta;

    const buttons: ReactNode[] = [];
    if (canStar) {
      buttons.push(
        <DashNavButton
          tooltip="Mark as favorite"
          classSuffix="star"
          icon={isStarred ? 'favorite' : 'star'}
          iconType={isStarred ? 'mono' : 'default'}
          iconSize="lg"
          noBorder={true}
          onClick={this.onStarDashboard}
          key="button-star"
        />
      );
    }

    if (canShare) {
      buttons.push(
        <ModalsController key="button-share">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Share dashboard"
              classSuffix="share"
              icon="share-alt"
              iconSize="lg"
              noBorder={true}
              onClick={() => {
                showModal(ShareModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    this.addCustomContent(customLeftActions, buttons);
    return buttons;
  }

  renderDashboardTitleSearchButton() {
    const { dashboard, isFullscreen } = this.props;

    const folderSymbol = css`
      margin-right: 0 4px;
    `;
    const mainIconClassName = css`
      margin-right: 8px;
      margin-bottom: 3px;
    `;

    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = (dashboard.meta.folderId ?? 0) > 0;

    return (
      <>
        <div>
          <div className="navbar-page-btn">
            {!isFullscreen && <Icon name="apps" size="lg" className={mainIconClassName} />}
            {haveFolder && (
              <>
                <a className="navbar-page-btn__folder" onClick={this.onFolderNameClick}>
                  {folderTitle} <span className={folderSymbol}>/</span>
                </a>
              </>
            )}
            <a onClick={this.onDashboardNameClick}>{dashboard.title}</a>
          </div>
        </div>
        <div className="navbar-buttons navbar-buttons--actions">{this.renderLeftActionsButton()}</div>
        <div className="navbar__spacer" />
      </>
    );
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <BackButton surface="dashboard" onClick={this.onClose} />
      </div>
    );
  }

  renderRightActionsButton() {
    const { dashboard, onAddPanel, location, updateTimeZoneForSession } = this.props;
    const { canEdit, showSettings } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    const buttons: ReactNode[] = [];
    if (canEdit) {
      buttons.push(<ToolbarButton tooltip="Add panel" icon="panel-add" onClick={onAddPanel} key="button-panel-add" />);
      buttons.push(
        <ModalsController key="button-save">
          {({ showModal, hideModal }) => (
            <ToolbarButton
              tooltip="Save dashboard"
              icon="save"
              onClick={() => {
                showModal(SaveDashboardModalProxy, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    if (snapshotUrl) {
      buttons.push(
        <ToolbarButton
          tooltip="Open original dashboard"
          onClick={() => this.gotoSnapshotOrigin(snapshotUrl)}
          icon="link"
          key="button-snapshot"
        />
      );
    }

    if (showSettings) {
      buttons.push(
        <ToolbarButton tooltip="Dashboard settings" icon="cog" onClick={this.onOpenSettings} key="button-settings" />
      );
    }

    this.addCustomContent(customRightActions, buttons);

    if (!dashboard.timepicker.hidden) {
      buttons.push(
        <DashNavTimeControls dashboard={dashboard} location={location} onChangeTimeZone={updateTimeZoneForSession} />
      );
    }

    buttons.push(<ToolbarButton tooltip="Cycle view mode" icon="monitor" onClick={this.onToggleTVMode} />);

    return buttons;
  }

  gotoSnapshotOrigin(snapshotUrl: string) {
    window.location.href = textUtil.sanitizeUrl(snapshotUrl);
  }

  render() {
    const { dashboard, isFullscreen } = this.props;
    const onGoBack = isFullscreen ? this.onClose : undefined;

    return (
      <PageToolbar
        pageIcon="apps"
        title={dashboard.title}
        parent={dashboard.meta.folderTitle}
        onClickTitle={this.onDashboardNameClick}
        onClickParent={this.onFolderNameClick}
        onGoBack={onGoBack}
      >
        {this.playlistSrv.isPlaying && (
          <ButtonGroup>
            <ToolbarButton
              tooltip="Go to previous dashboard"
              icon="step-backward"
              onClick={this.onPlaylistPrev}
              narrow
            />
            <ToolbarButton icon="square-shape" onClick={this.onPlaylistStop}>
              Stop playlist
            </ToolbarButton>
            <ToolbarButton tooltip="Go to next dashboard" icon="forward" onClick={this.onPlaylistNext} narrow />
          </ButtonGroup>
        )}

        {this.renderRightActionsButton()}
      </PageToolbar>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  updateLocation,
  updateTimeZoneForSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashNav);
