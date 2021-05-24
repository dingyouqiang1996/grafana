import { reducerTester } from '../../../../test/core/redux/reducerTester';
import { OrgRole, TeamPermissionLevel, UserState } from '../../../types';
import {
  initialUserState,
  orgsLoaded,
  sessionsLoaded,
  setUpdating,
  teamsLoaded,
  updateTimeZone,
  userLoaded,
  userReducer,
  userSessionRevoked,
} from './reducers';

describe('userReducer', () => {
  describe('when updateTimeZone is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, { ...initialUserState })
        .whenActionIsDispatched(updateTimeZone({ timeZone: 'xyz' }))
        .thenStateShouldEqual({ ...initialUserState, timeZone: 'xyz' });
    });
  });

  describe('when setUpdating is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, { ...initialUserState, updating: false })
        .whenActionIsDispatched(setUpdating({ updating: true }))
        .thenStateShouldEqual({ ...initialUserState, updating: true });
    });
  });

  describe('when userLoaded is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, { ...initialUserState, loadingUser: true })
        .whenActionIsDispatched(
          userLoaded({
            user: {
              id: 2021,
              email: 'test@test.com',
              isDisabled: true,
              login: 'test',
              name: 'Test Account',
              isGrafanaAdmin: false,
            },
          })
        )
        .thenStateShouldEqual({
          ...initialUserState,
          loadingUser: false,
          user: {
            id: 2021,
            email: 'test@test.com',
            isDisabled: true,
            login: 'test',
            name: 'Test Account',
            isGrafanaAdmin: false,
          },
        });
    });
  });

  describe('when teamsLoaded is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, { ...initialUserState, loadingTeams: true })
        .whenActionIsDispatched(
          teamsLoaded({
            teams: [
              {
                id: 1,
                email: 'team@team.com',
                name: 'Team',
                avatarUrl: '/avatar/12345',
                memberCount: 4,
                permission: TeamPermissionLevel.Admin,
              },
            ],
          })
        )
        .thenStateShouldEqual({
          ...initialUserState,
          loadingTeams: false,
          teams: [
            {
              id: 1,
              email: 'team@team.com',
              name: 'Team',
              avatarUrl: '/avatar/12345',
              memberCount: 4,
              permission: TeamPermissionLevel.Admin,
            },
          ],
        });
    });
  });

  describe('when orgsLoaded is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, { ...initialUserState, loadingOrgs: true })
        .whenActionIsDispatched(
          orgsLoaded({
            orgs: [{ orgId: 1, name: 'Main', role: OrgRole.Viewer }],
          })
        )
        .thenStateShouldEqual({
          ...initialUserState,
          loadingOrgs: false,
          orgs: [{ orgId: 1, name: 'Main', role: OrgRole.Viewer }],
        });
    });
  });

  describe('when sessionsLoaded is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, { ...initialUserState, loadingSessions: true })
        .whenActionIsDispatched(
          sessionsLoaded({
            sessions: [
              {
                id: 1,
                browser: 'Chrome',
                browserVersion: '90',
                osVersion: '95',
                clientIp: '192.168.1.1',
                createdAt: '2021-01-01 04:00:00',
                device: 'Computer',
                os: 'Windows',
                isActive: false,
                seenAt: '1996-01-01 04:00:00',
              },
            ],
          })
        )
        .thenStateShouldEqual({
          ...initialUserState,
          loadingSessions: false,
          sessions: [
            {
              id: 1,
              browser: 'Chrome',
              browserVersion: '90',
              osVersion: '95',
              clientIp: '192.168.1.1',
              createdAt: 'December 31, 2020',
              device: 'Computer',
              os: 'Windows',
              isActive: false,
              seenAt: '25 years ago',
            },
          ],
        });
    });
  });

  describe('when userSessionRevoked is dispatched', () => {
    it('then state should be correct', () => {
      reducerTester<UserState>()
        .givenReducer(userReducer, {
          ...initialUserState,
          sessions: [
            {
              id: 1,
              browser: 'Chrome',
              browserVersion: '90',
              osVersion: '95',
              clientIp: '192.168.1.1',
              createdAt: '2021-01-01',
              device: 'Computer',
              os: 'Windows',
              isActive: false,
              seenAt: '1996-01-01',
            },
          ],
        })
        .whenActionIsDispatched(userSessionRevoked({ tokenId: 1 }))
        .thenStateShouldEqual({
          ...initialUserState,
          sessions: [],
        });
    });
  });
});
