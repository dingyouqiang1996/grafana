import React, { FC, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaThemeV2 } from '@grafana/data';
import { Button, useStyles2 } from '@grafana/ui';
import { AmRouteReceiver, FormAmRoute } from '../../types/amroutes';
import { emptyRoute } from '../../utils/amroutes';
import { EmptyArea } from '../EmptyArea';
import { AmRoutesTable } from './AmRoutesTable';

export interface AmSpecificRoutingProps {
  onChange: (routes: FormAmRoute) => void;
  onRootRouteEdit: () => void;
  receivers: AmRouteReceiver[];
  routes: FormAmRoute;
}

export const AmSpecificRouting: FC<AmSpecificRoutingProps> = ({ onChange, onRootRouteEdit, receivers, routes }) => {
  const [actualRoutes, setActualRoutes] = useState(routes.routes);
  const [isAddMode, setIsAddMode] = useState(false);

  const styles = useStyles2(getStyles);

  const addNewRoute = () => {
    setIsAddMode(true);
    setActualRoutes((actualRoutes) => [...actualRoutes, emptyRoute]);
  };

  return (
    <div className={styles.container}>
      <h5>Specific routing</h5>
      <p>Send specific alerts to chosen contact points, based on matching criteria</p>
      {!routes.receiver ? (
        <EmptyArea
          buttonIcon="rocket"
          buttonLabel="Set a default contact point"
          onButtonClick={onRootRouteEdit}
          text="You haven't set a default contact point for the root route yet."
        />
      ) : actualRoutes.length > 0 ? (
        <>
          {!isAddMode && (
            <Button className={styles.addMatcherBtn} icon="plus" onClick={addNewRoute} type="button">
              New policy
            </Button>
          )}
          <AmRoutesTable
            isAddMode={isAddMode}
            onChange={(newRoutes) => {
              onChange({
                ...routes,
                routes: newRoutes,
              });

              if (isAddMode) {
                setIsAddMode(false);
              }
            }}
            receivers={receivers}
            routes={actualRoutes}
          />
        </>
      ) : (
        <EmptyArea
          buttonIcon="plus"
          buttonLabel="New specific policy"
          onButtonClick={addNewRoute}
          text="You haven't created any specific policies yet."
        />
      )}
    </div>
  );
};

const getStyles = (theme: GrafanaThemeV2) => {
  return {
    container: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    addMatcherBtn: css`
      align-self: flex-end;
      margin-bottom: ${theme.spacing(3.5)};
    `,
  };
};
