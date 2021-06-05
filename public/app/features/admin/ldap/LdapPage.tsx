import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { NavModel } from '@grafana/data';
import { Alert, Button, LegacyForms } from '@grafana/ui';
const { FormField } = LegacyForms;
import { getNavModel } from 'app/core/selectors/navModel';
import config from 'app/core/config';
import Page from 'app/core/components/Page/Page';
import { LdapConnectionStatus } from './LdapConnectionStatus';
import { LdapSyncInfo } from './LdapSyncInfo';
import { LdapUserInfo } from './LdapUserInfo';
import {
  AppNotificationSeverity,
  LdapError,
  LdapUser,
  StoreState,
  SyncInfo,
  LdapConnectionInfo,
  AccessControlAction,
  Dethunked,
} from 'app/types';
import {
  loadLdapState,
  loadLdapSyncStatus,
  loadUserMapping,
  clearUserError,
  clearUserMappingInfo,
} from '../state/actions';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { contextSrv } from 'app/core/core';

interface Props extends GrafanaRouteComponentProps<{}, { username: string }> {
  navModel: NavModel;
  ldapConnectionInfo: LdapConnectionInfo;
  ldapUser?: LdapUser;
  ldapSyncInfo?: SyncInfo;
  ldapError?: LdapError;
  userError?: LdapError;

  loadLdapState: Dethunked<typeof loadLdapState>;
  loadLdapSyncStatus: Dethunked<typeof loadLdapSyncStatus>;
  loadUserMapping: Dethunked<typeof loadUserMapping>;
  clearUserError: Dethunked<typeof clearUserError>;
  clearUserMappingInfo: Dethunked<typeof clearUserMappingInfo>;
}

interface State {
  isLoading: boolean;
}

export class LdapPage extends PureComponent<Props, State> {
  state = {
    isLoading: true,
  };

  async componentDidMount() {
    const { clearUserMappingInfo, queryParams } = this.props;
    await clearUserMappingInfo();
    await this.fetchLDAPStatus();

    if (queryParams.username) {
      await this.fetchUserMapping(queryParams.username);
    }

    this.setState({ isLoading: false });
  }

  async fetchLDAPStatus() {
    const { loadLdapState, loadLdapSyncStatus } = this.props;
    return Promise.all([loadLdapState(), loadLdapSyncStatus()]);
  }

  async fetchUserMapping(username: string) {
    const { loadUserMapping } = this.props;
    return await loadUserMapping(username);
  }

  search = (event: any) => {
    event.preventDefault();
    const username = event.target.elements['username'].value;
    if (username) {
      this.fetchUserMapping(username);
    }
  };

  onClearUserError = () => {
    this.props.clearUserError();
  };

  render() {
    const { ldapUser, userError, ldapError, ldapSyncInfo, ldapConnectionInfo, navModel, queryParams } = this.props;
    const { isLoading } = this.state;
    const canReadLDAPUser = contextSrv.hasPermission(AccessControlAction.LDAPUsersRead);

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={isLoading}>
          <>
            {ldapError && ldapError.title && (
              <div className="gf-form-group">
                <Alert title={ldapError.title} severity={AppNotificationSeverity.Error}>
                  {ldapError.body}
                </Alert>
              </div>
            )}

            <LdapConnectionStatus ldapConnectionInfo={ldapConnectionInfo} />

            {config.licenseInfo.hasLicense && ldapSyncInfo && <LdapSyncInfo ldapSyncInfo={ldapSyncInfo} />}

            {canReadLDAPUser && (
              <>
                <h3 className="page-heading">Test user mapping</h3>
                <div className="gf-form-group">
                  <form onSubmit={this.search} className="gf-form-inline">
                    <FormField
                      label="Username"
                      labelWidth={8}
                      inputWidth={30}
                      type="text"
                      id="username"
                      name="username"
                      defaultValue={queryParams.username}
                    />
                    <Button type="submit">Run</Button>
                  </form>
                </div>
                {userError && userError.title && (
                  <div className="gf-form-group">
                    <Alert
                      title={userError.title}
                      severity={AppNotificationSeverity.Error}
                      onRemove={this.onClearUserError}
                    >
                      {userError.body}
                    </Alert>
                  </div>
                )}
                {ldapUser && <LdapUserInfo ldapUser={ldapUser} showAttributeMapping={true} />}
              </>
            )}
          </>
        </Page.Contents>
      </Page>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  navModel: getNavModel(state.navIndex, 'ldap'),
  ldapConnectionInfo: state.ldap.connectionInfo,
  ldapUser: state.ldap.user,
  ldapSyncInfo: state.ldap.syncInfo,
  userError: state.ldap.userError,
  ldapError: state.ldap.ldapError,
});

const mapDispatchToProps = {
  loadLdapState,
  loadLdapSyncStatus,
  loadUserMapping,
  clearUserError,
  clearUserMappingInfo,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(LdapPage));
