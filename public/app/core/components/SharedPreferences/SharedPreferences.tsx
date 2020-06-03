import React, { PureComponent } from 'react';
import { css } from 'emotion';

import { Select, Field, Form, Tooltip, Icon, Legend, stylesFactory, Label, Button } from '@grafana/ui';
import { getTimeZoneGroups, SelectableValue } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { DashboardSearchHit, DashboardSearchItemType } from 'app/features/search/types';
import { backendSrv } from 'app/core/services/backend_srv';

export interface Props {
  resourceUri: string;
}

export interface State {
  homeDashboardId: number;
  theme: string;
  timezone: string;
  dashboards: DashboardSearchHit[];
}

const themes = [
  { value: '', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

const grafanaTimeZones = [
  { value: '', label: 'Default' },
  { value: 'browser', label: 'Local browser time' },
  { value: 'utc', label: 'UTC' },
];

const timeZones = getTimeZoneGroups().reduce((tzs, group) => {
  const options = group.options.map(tz => ({ value: tz, label: tz }));
  tzs.push.apply(tzs, options);
  return tzs;
}, grafanaTimeZones);

export class SharedPreferences extends PureComponent<Props, State> {
  backendSrv = backendSrv;

  constructor(props: Props) {
    super(props);

    this.state = {
      homeDashboardId: 0,
      theme: '',
      timezone: '',
      dashboards: [],
    };
  }

  async componentDidMount() {
    const prefs = await backendSrv.get(`/api/${this.props.resourceUri}/preferences`);
    const dashboards = await backendSrv.search({ starred: true });
    const defaultDashboardHit: DashboardSearchHit = {
      id: 0,
      title: 'Default',
      tags: [],
      type: '' as DashboardSearchItemType,
      uid: '',
      uri: '',
      url: '',
      folderId: 0,
      folderTitle: '',
      folderUid: '',
      folderUrl: '',
      isStarred: false,
      slug: '',
      items: [],
    };

    if (prefs.homeDashboardId > 0 && !dashboards.find(d => d.id === prefs.homeDashboardId)) {
      const missing = await backendSrv.search({ dashboardIds: [prefs.homeDashboardId] });
      if (missing && missing.length > 0) {
        dashboards.push(missing[0]);
      }
    }

    this.setState({
      homeDashboardId: prefs.homeDashboardId,
      theme: prefs.theme,
      timezone: prefs.timezone,
      dashboards: [defaultDashboardHit, ...dashboards],
    });
  }

  onSubmitForm = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const { homeDashboardId, theme, timezone } = this.state;

    await backendSrv.put(`/api/${this.props.resourceUri}/preferences`, {
      homeDashboardId,
      theme,
      timezone,
    });
    window.location.reload();
  };

  onThemeChanged = (theme: SelectableValue<string>) => {
    if (!theme || typeof theme.value !== 'string') {
      return;
    }
    this.setState({ theme: theme.value });
  };

  onTimeZoneChanged = (timezone: SelectableValue<string>) => {
    if (!timezone || typeof timezone.value !== 'string') {
      return;
    }
    this.setState({ timezone: timezone.value });
  };

  onHomeDashboardChanged = (dashboardId: number) => {
    this.setState({ homeDashboardId: dashboardId });
  };

  getFullDashName = (dashboard: DashboardSearchHit) => {
    if (typeof dashboard.folderTitle === 'undefined' || dashboard.folderTitle === '') {
      return dashboard.title;
    }
    return dashboard.folderTitle + ' / ' + dashboard.title;
  };

  render() {
    const { theme, timezone, homeDashboardId, dashboards } = this.state;
    const styles = getStyles();

    return (
      <div className={styles.wrapper}>
        <Legend>Preferences</Legend>
        <Form onSubmit={this.onSubmitForm}>
          {() => {
            return (
              <>
                <Field label="UI Theme">
                  <Select
                    isSearchable={false}
                    value={themes.find(item => item.value === theme)}
                    options={themes}
                    onChange={this.onThemeChanged}
                  />
                </Field>
                <Field
                  label={
                    <Label>
                      <span className={styles.labelText}>Home Dashboard</span>
                      <Tooltip content="Not finding dashboard you want? Star it first, then it should appear in this select box.">
                        <Icon name="info-circle" />
                      </Tooltip>
                    </Label>
                  }
                >
                  <Select
                    value={dashboards.find(dashboard => dashboard.id === homeDashboardId)}
                    getOptionValue={i => i.id}
                    getOptionLabel={this.getFullDashName}
                    onChange={(dashboard: DashboardSearchHit) => this.onHomeDashboardChanged(dashboard.id)}
                    options={dashboards}
                    placeholder="Choose default dashboard"
                  />
                </Field>
                <Field label="Timezone" aria-label={selectors.components.TimeZonePicker.container}>
                  <Select
                    isSearchable={true}
                    value={timeZones.find(item => item.value === timezone)}
                    onChange={this.onTimeZoneChanged}
                    options={timeZones}
                  />
                </Field>
                <div className="gf-form-button-row">
                  <Button variant="primary">Save</Button>
                </div>
              </>
            );
          }}
        </Form>
      </div>
    );
  }
}

export default SharedPreferences;

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      margin-bottom: 24px;
    `,
    labelText: css`
      margin-right: 6px;
    `,
  };
});
