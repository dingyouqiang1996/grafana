import React, { PureComponent } from 'react';

import { AppEvents, NavModelItem, SelectableValue } from '@grafana/data';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors';
import { Alert, ClipboardButton, Field, FieldSet, Icon, Input, RadioButtonGroup, Switch } from '@grafana/ui';
import config from 'app/core/config';
import { appEvents } from 'app/core/core';

import { ShareModalTabProps } from './types';
import { buildImageUrl, buildShareUrl } from './utils';

const themeOptions: Array<SelectableValue<string>> = [
  { label: 'Current', value: 'current' },
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
];

export interface Props extends ShareModalTabProps {}

export interface State {
  useCurrentTimeRange: boolean;
  useShortUrl: boolean;
  selectedTheme: string;
  shareUrl: string;
  imageUrl: string;
}

export class ShareLink extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      useCurrentTimeRange: true,
      useShortUrl: false,
      selectedTheme: 'current',
      shareUrl: '',
      imageUrl: '',
    };
  }

  componentDidMount() {
    this.buildUrl();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { useCurrentTimeRange, useShortUrl, selectedTheme } = this.state;
    if (
      prevState.useCurrentTimeRange !== useCurrentTimeRange ||
      prevState.selectedTheme !== selectedTheme ||
      prevState.useShortUrl !== useShortUrl
    ) {
      this.buildUrl();
    }
  }

  buildUrl = async () => {
    const { panel, dashboard } = this.props;
    const { useCurrentTimeRange, useShortUrl, selectedTheme } = this.state;

    const shareUrl = await buildShareUrl(useCurrentTimeRange, selectedTheme, panel, useShortUrl);
    const imageUrl = buildImageUrl(useCurrentTimeRange, dashboard.uid, selectedTheme, panel);

    this.setState({ shareUrl, imageUrl });
  };

  onUseCurrentTimeRangeChange = () => {
    this.setState({ useCurrentTimeRange: !this.state.useCurrentTimeRange });
  };

  onUrlShorten = () => {
    this.setState({ useShortUrl: !this.state.useShortUrl });
  };

  onThemeChange = (value: string) => {
    this.setState({ selectedTheme: value });
  };

  onShareUrlCopy = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Content copied to clipboard']);
  };

  getShareUrl = () => {
    return this.state.shareUrl;
  };

  render() {
    const { panel, dashboard } = this.props;
    const isRelativeTime = dashboard ? dashboard.time.to === 'now' : false;
    const { useCurrentTimeRange, useShortUrl, selectedTheme, shareUrl, imageUrl } = this.state;
    const selectors = e2eSelectors.pages.SharePanelModal;
    const isDashboardSaved = Boolean(dashboard.id);
    const isPMM = !!((config.bootData.navTree || []) as NavModelItem[]).find((item) => item.id === 'pmm');
    const differentLocalhostDomains =
      isPMM && config.appUrl.includes('localhost') && !window.location.host.includes('localhost');

    return (
      <>
        <p className="share-modal-info-text">
          Create a direct link to this dashboard or panel, customized with the options below.
        </p>
        <FieldSet>
          <Field
            label="Lock time range"
            description={isRelativeTime ? 'Transforms the current relative time range to an absolute time range' : ''}
          >
            <Switch
              id="share-current-time-range"
              value={useCurrentTimeRange}
              onChange={this.onUseCurrentTimeRangeChange}
            />
          </Field>
          <Field label="Theme">
            <RadioButtonGroup options={themeOptions} value={selectedTheme} onChange={this.onThemeChange} />
          </Field>
          {differentLocalhostDomains && (
            <Alert title="PMM: URL mismatch" severity="warning">
              <p>
                Your domain on Grafana&apos;s .ini file is localhost but you are on a different domain. The short URL
                will point to localhost, which might be wrong.
              </p>
              <p>
                Please change your .ini and restart Grafana if you want the URL shortener to function correctly, or just
                use the full URL.
              </p>
            </Alert>
          )}
          <Field label="Shorten URL" disabled={differentLocalhostDomains}>
            <Switch id="share-shorten-url" value={useShortUrl} onChange={this.onUrlShorten} />
          </Field>

          <Field label="Link URL">
            <Input
              id="link-url-input"
              value={shareUrl}
              readOnly
              addonAfter={
                <ClipboardButton variant="primary" getText={this.getShareUrl} onClipboardCopy={this.onShareUrlCopy}>
                  <Icon name="copy" /> Copy
                </ClipboardButton>
              }
            />
          </Field>
        </FieldSet>

        {panel && config.rendererAvailable && isDashboardSaved && (
          <div className="gf-form">
            <a href={imageUrl} target="_blank" rel="noreferrer" aria-label={selectors.linkToRenderedImage}>
              <Icon name="camera" /> Direct link rendered image
            </a>
          </div>
        )}

        {panel && !config.rendererAvailable && (
          <Alert severity="info" title="Image Renderer plugin not installed">
            <p>
              <>To render a panel image, you must install the </>
              <a
                href="https://www.percona.com/doc/percona-monitoring-and-management/2.x/how-to/render-dashboard-images.html"
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                Image Renderer plugin
              </a>
              . Please contact your PMM administrator to install the plugin.
            </p>
          </Alert>
        )}
      </>
    );
  }
}
