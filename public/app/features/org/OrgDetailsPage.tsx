import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { NavModel } from '@grafana/data';

import Page from 'app/core/components/Page/Page';
import OrgProfile from './OrgProfile';
import SharedPreferences from 'app/core/components/SharedPreferences/SharedPreferences';
import { loadOrganization, updateOrganization } from './state/actions';
import { AccessControlAction, Organization, StoreState } from 'app/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { setOrganizationName } from './state/reducers';
import { VerticalGroup } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

export interface Props {
  navModel: NavModel;
  organization: Organization;
  loadOrganization: typeof loadOrganization;
  setOrganizationName: typeof setOrganizationName;
  updateOrganization: typeof updateOrganization;
}

export class OrgDetailsPage extends PureComponent<Props> {
  async componentDidMount() {
    await this.props.loadOrganization();
  }

  onUpdateOrganization = (orgName: string) => {
    this.props.setOrganizationName(orgName);
    this.props.updateOrganization();
  };

  render() {
    const { navModel, organization } = this.props;
    const isLoading = Object.keys(organization).length === 0;
    const canReadwOrg = contextSrv.hasPermission(AccessControlAction.OrgsRead);
    const canReadPreferences = contextSrv.hasPermission(AccessControlAction.OrgsPreferencesRead);
    const canWritePreferences = contextSrv.hasPermission(AccessControlAction.OrgsPreferencesWrite);

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={isLoading}>
          {!isLoading && (
            <VerticalGroup spacing="lg">
              {canReadwOrg && <OrgProfile onSubmit={this.onUpdateOrganization} orgName={organization.name} />}
              {canReadPreferences && <SharedPreferences resourceUri="org" disabled={!canWritePreferences} />}
            </VerticalGroup>
          )}
        </Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'org-settings'),
    organization: state.organization.organization,
  };
}

const mapDispatchToProps = {
  loadOrganization,
  setOrganizationName,
  updateOrganization,
};

export default connect(mapStateToProps, mapDispatchToProps)(OrgDetailsPage);
