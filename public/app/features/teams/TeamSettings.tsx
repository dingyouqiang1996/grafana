import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup } from '@grafana/ui';
import { TeamRolePicker } from 'app/core/components/RolePicker/TeamRolePicker';
import { fetchRoleOptions, updateTeamRoles } from 'app/core/components/RolePicker/api';
import { SharedPreferences } from 'app/core/components/SharedPreferences/SharedPreferences';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction, Role, Team } from 'app/types';

import { updateTeam } from './state/actions';

const mapDispatchToProps = {
  updateTeam,
};

const connector = connect(null, mapDispatchToProps);

interface OwnProps {
  team: Team;
}
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const TeamSettings: FC<Props> = ({ team, updateTeam }) => {
  const canWriteTeamSettings = contextSrv.hasPermissionInMetadata(AccessControlAction.ActionTeamsWrite, team);
  const currentOrgId = contextSrv.user.orgId;

  const [roleOptions, setRoleOptions] = useState<Role[]>([]);
  const [pendingRoles, setPendingRoles] = useState<Role[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        if (contextSrv.hasPermission(AccessControlAction.ActionRolesList)) {
          let options = await fetchRoleOptions(currentOrgId);
          setRoleOptions(options);
        }
      } catch (e) {
        console.error('Error loading options', e);
      }
    }
    if (contextSrv.licensedAccessControlEnabled()) {
      fetchOptions();
    }
  }, [currentOrgId]);

  return (
    <VerticalGroup>
      <FieldSet label="Team details">
        <Form
          defaultValues={{ ...team }}
          onSubmit={(formTeam: Team) => {
            if (contextSrv.licensedAccessControlEnabled()) {
              updateTeamRoles(pendingRoles, team.id);
            }
            updateTeam(formTeam.name, formTeam.email);
          }}
          disabled={!canWriteTeamSettings}
        >
          {({ register, errors }) => (
            <>
              <Field
                label="Name"
                disabled={!canWriteTeamSettings}
                required
                invalid={!!errors.name}
                error="Name is required"
              >
                <Input {...register('name', { required: true })} id="name-input" />
              </Field>

              {contextSrv.licensedAccessControlEnabled() && (
                <Field label="Role">
                  <TeamRolePicker
                    teamId={team.id}
                    roleOptions={roleOptions}
                    disabled={false}
                    apply={true}
                    onApplyRoles={setPendingRoles}
                    pendingRoles={pendingRoles}
                  />
                </Field>
              )}

              <Field
                label="Email"
                description="This is optional and is primarily used to set the team profile avatar (via gravatar service)."
                disabled={!canWriteTeamSettings}
              >
                <Input {...register('email')} placeholder="team@email.com" type="email" id="email-input" />
              </Field>
              <Button type="submit" disabled={!canWriteTeamSettings}>
                Update
              </Button>
            </>
          )}
        </Form>
      </FieldSet>
      <SharedPreferences resourceUri={`teams/${team.id}`} disabled={!canWriteTeamSettings} />
    </VerticalGroup>
  );
};

export default connector(TeamSettings);
