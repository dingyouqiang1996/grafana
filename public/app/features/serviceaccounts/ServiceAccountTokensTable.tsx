import React, { FC } from 'react';
import { DeleteButton, Icon, IconName, Tooltip, useTheme2 } from '@grafana/ui';
import { dateTimeFormat, GrafanaTheme2, TimeZone } from '@grafana/data';

import { ApiKey } from '../../types';
import { css } from '@emotion/css';

interface Props {
  apiKeys: ApiKey[];
  timeZone: TimeZone;
  onDelete: (apiKey: ApiKey) => void;
}

export const ServiceAccountTokensTable: FC<Props> = ({ apiKeys, timeZone, onDelete }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  return (
    <>
      <h3 className="page-heading">Tokens</h3>
      <table className="filter-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Expires</th>
            <th style={{ width: '34px' }} />
          </tr>
        </thead>
        {apiKeys.length > 0 ? (
          <tbody>
            {apiKeys.map((key) => {
              const isExpired = Boolean(key.expiration && Date.now() > new Date(key.expiration).getTime());
              return (
                <tr key={key.id} className={styles.tableRow(isExpired)}>
                  <td>{key.name}</td>
                  <td>
                    {formatDate(key.expiration, timeZone)}
                    {isExpired && (
                      <span className={styles.tooltipContainer}>
                        <Tooltip content="This API key has expired.">
                          <Icon name={'exclamation-triangle' as IconName} />
                        </Tooltip>
                      </span>
                    )}
                  </td>
                  <td>
                    <DeleteButton aria-label="Delete API key" size="sm" onConfirm={() => onDelete(key)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        ) : null}
      </table>
    </>
  );
};

function formatDate(expiration: string | undefined, timeZone: TimeZone): string {
  if (!expiration) {
    return 'No expiration date';
  }
  return dateTimeFormat(expiration, { timeZone });
}

const getStyles = (theme: GrafanaTheme2) => ({
  tableRow: (isExpired: boolean) => css`
    color: ${isExpired ? theme.colors.text.secondary : theme.colors.text.primary};
  `,
  tooltipContainer: css`
    margin-left: ${theme.spacing(1)};
  `,
});
