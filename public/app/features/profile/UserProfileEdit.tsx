import React from 'react';
import { useAsync } from 'react-use';
import { connect, ConnectedProps } from 'react-redux';
import { hot } from 'react-hot-loader';
import { NavModel } from '@grafana/data';
import { VerticalGroup } from '@grafana/ui';

import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';
import Page from 'app/core/components/Page/Page';
import { changeUserOrg, initUserProfilePage, revokeUserSession, updateUserProfile } from './state/actions';
import UserProfileEditForm from './UserProfileEditForm';
import SharedPreferences from 'app/core/components/SharedPreferences/SharedPreferences';
import { UserTeams } from './UserTeams';
import UserOrganizations from './UserOrganizations';
import UserSessions from './UserSessions';

export interface OwnProps {
  navModel: NavModel;
}

function mapStateToProps(state: StoreState) {
  const userState = state.user;
  const {
    user,
    teams,
    orgs,
    sessions,
    teamsAreLoading,
    orgsAreLoading,
    userIsLoading,
    sessionsAreLoading,
    isUpdating,
  } = userState;
  return {
    navModel: getNavModel(state.navIndex, 'profile-settings'),
    orgsAreLoading,
    sessionsAreLoading,
    teamsAreLoading,
    userIsLoading,
    orgs,
    sessions,
    teams,
    isUpdating,
    user,
  };
}

const mapDispatchToProps = {
  initUserProfilePage,
  revokeUserSession,
  changeUserOrg,
  updateUserProfile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

export function UserProfileEdit({
  navModel,
  orgsAreLoading,
  sessionsAreLoading,
  teamsAreLoading,
  userIsLoading,
  initUserProfilePage,
  orgs,
  sessions,
  teams,
  isUpdating,
  user,
  revokeUserSession,
  changeUserOrg,
  updateUserProfile,
}: Props) {
  useAsync(async () => {
    await initUserProfilePage();
  }, []);

  return (
    <Page navModel={navModel}>
      <Page.Contents isLoading={userIsLoading || !Boolean(user)}>
        <VerticalGroup spacing="md">
          <UserProfileEditForm updateProfile={updateUserProfile} isSavingUser={isUpdating} user={user!} />
          <SharedPreferences resourceUri="user" />
          <UserTeams isLoading={teamsAreLoading} teams={teams} />
          <UserOrganizations isLoading={orgsAreLoading} setUserOrg={changeUserOrg} orgs={orgs} user={user!} />
          <UserSessions isLoading={sessionsAreLoading} revokeUserSession={revokeUserSession} sessions={sessions} />
        </VerticalGroup>
      </Page.Contents>
    </Page>
  );
}

export default hot(module)(connector(UserProfileEdit));
