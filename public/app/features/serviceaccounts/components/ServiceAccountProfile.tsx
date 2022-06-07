import { css } from '@emotion/css';
import React from 'react';

import { dateTimeFormat, GrafanaTheme2, OrgRole, TimeZone } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import { AccessControlAction, Role, ServiceAccountDTO } from 'app/types';

import { ServiceAccountProfileRow } from './ServiceAccountProfileRow';
import { ServiceAccountRoleRow } from './ServiceAccountRoleRow';

interface Props {
  serviceAccount: ServiceAccountDTO;
  timeZone: TimeZone;
  roleOptions: Role[];
  builtInRoles: Record<string, Role[]>;
  onChange: (serviceAccount: ServiceAccountDTO) => void;
}

export function ServiceAccountProfile({
  serviceAccount,
  timeZone,
  roleOptions,
  builtInRoles,
  onChange,
}: Props): JSX.Element {
  const styles = useStyles2(getStyles);
  const ableToWrite = contextSrv.hasPermission(AccessControlAction.ServiceAccountsWrite);

  const onRoleChange = (role: OrgRole) => {
    onChange({ ...serviceAccount, role: role });
  };

  const onNameChange = (newValue: string) => {
    onChange({ ...serviceAccount, name: newValue });
  };

  return (
    <div className={styles.section}>
      <h4>Information</h4>
      <table className="filter-table">
        <tbody>
          <ServiceAccountProfileRow
            label="Name"
            value={serviceAccount.name}
            onChange={onNameChange}
            disabled={!ableToWrite || serviceAccount.isDisabled}
          />
          <ServiceAccountProfileRow label="ID" value={serviceAccount.login} disabled={serviceAccount.isDisabled} />
          <ServiceAccountRoleRow
            label="Roles"
            serviceAccount={serviceAccount}
            onRoleChange={onRoleChange}
            builtInRoles={builtInRoles}
            roleOptions={roleOptions}
          />
          <ServiceAccountProfileRow
            label="Creation date"
            value={dateTimeFormat(serviceAccount.createdAt, { timeZone })}
            disabled={serviceAccount.isDisabled}
          />
        </tbody>
      </table>
    </div>
  );
}

export const getStyles = (theme: GrafanaTheme2) => ({
  section: css`
    margin-bottom: ${theme.spacing(4)};
  `,
});
