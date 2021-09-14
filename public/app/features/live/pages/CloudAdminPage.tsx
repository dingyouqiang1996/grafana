import React, { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';
import { useStyles } from '@grafana/ui';
import Page from 'app/core/components/Page/Page';
import { useNavModel } from 'app/core/hooks/useNavModel';
import { css } from '@emotion/css';
import { GrafanaTheme } from '@grafana/data';
import { GrafanaCloudBackend } from './types';

export default function CloudAdminPage() {
  const navModel = useNavModel('live-cloud');
  const [cloud, setCloud] = useState<GrafanaCloudBackend[]>([]);
  const styles = useStyles(getStyles);

  useEffect(() => {
    getBackendSrv()
      .get(`api/live/remote-write-backends`)
      .then((data) => {
        setCloud(data.remoteWriteBackends);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <Page navModel={navModel}>
      <Page.Contents>
        {!cloud && <>Loading cloud definitions</>}
        {cloud &&
          cloud.map((v) => {
            return (
              <div key={v.uid}>
                <h2>{v.uid}</h2>
                <pre className={styles.row}>{JSON.stringify(v.settings, null, 2)}</pre>
              </div>
            );
          })}
      </Page.Contents>
    </Page>
  );
}

const getStyles = (theme: GrafanaTheme) => {
  return {
    row: css`
      cursor: pointer;
    `,
  };
};
