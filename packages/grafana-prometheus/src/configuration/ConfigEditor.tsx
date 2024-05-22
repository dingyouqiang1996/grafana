// Core Grafana history https://github.com/grafana/grafana/blob/v11.0.0-preview/public/app/plugins/datasource/prometheus/configuration/ConfigEditor.tsx
import { css } from '@emotion/css';
import React from 'react';

import { DataSourcePluginOptionsEditorProps, GrafanaTheme2 } from '@grafana/data';
import { ConfigSection, DataSourceDescription, AdvancedHttpSettings } from '@grafana/experimental';
import { config } from '@grafana/runtime';
import { Alert, FieldValidationMessage, useTheme2 } from '@grafana/ui';

import { PromOptions } from '../types';

import { AlertingSettingsOverhaul } from './AlertingSettingsOverhaul';
import { DataSourceHttpSettingsOverhaul } from './DataSourceHttpSettingsOverhaul';
import { PromSettings } from './PromSettings';

export const PROM_CONFIG_LABEL_WIDTH = 30;

export type PrometheusConfigProps = DataSourcePluginOptionsEditorProps<PromOptions>;

export const ConfigEditor = (props: PrometheusConfigProps) => {
  const { options, onOptionsChange } = props;
  const theme = useTheme2();
  const styles = overhaulStyles(theme);

  return (
    <>
      {options.access === 'direct' && (
        <Alert title="Error" severity="error">
          Browser access mode in the Prometheus data source is no longer available. Switch to server access mode.
        </Alert>
      )}
      <DataSourceDescription
        dataSourceName="Prometheus"
        docsLink="https://grafana.com/docs/grafana/latest/datasources/prometheus/configure-prometheus-data-source/"
      />
      <hr className={`${styles.hrTopSpace} ${styles.hrBottomSpace}`} />
      <DataSourceHttpSettingsOverhaul
        options={options}
        onOptionsChange={onOptionsChange}
        secureSocksDSProxyEnabled={config.secureSocksDSProxyEnabled}
      />
      <hr />
      <ConfigSection
        className={styles.advancedSettings}
        title="Advanced settings"
        description="Additional settings are optional settings that can be configured for more control over your data source."
      >
        <AdvancedHttpSettings
          className={styles.advancedHTTPSettingsMargin}
          config={options}
          onChange={onOptionsChange}
        />
        <AlertingSettingsOverhaul<PromOptions> options={options} onOptionsChange={onOptionsChange} />
        <PromSettings options={options} onOptionsChange={onOptionsChange} />
      </ConfigSection>
    </>
  );
};

/**
 * Use this to return a url in a tooltip in a field. Don't forget to make the field interactive to be able to click on the tooltip
 * @param url
 * @returns
 */
export function docsTip(url?: string) {
  const docsUrl = 'https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source';

  return (
    <a href={url ? url : docsUrl} target="_blank" rel="noopener noreferrer">
      Visit docs for more details here.
    </a>
  );
}

export const validateInput = (
  input: string,
  pattern: string | RegExp,
  errorMessage?: string
): boolean | JSX.Element => {
  const defaultErrorMessage = 'Value is not valid';
  if (input && !input.match(pattern)) {
    return <FieldValidationMessage>{errorMessage ? errorMessage : defaultErrorMessage}</FieldValidationMessage>;
  } else {
    return true;
  }
};

export function overhaulStyles(theme: GrafanaTheme2) {
  return {
    additionalSettings: css({
      marginBottom: '25px',
    }),
    secondaryGrey: css({
      color: theme.colors.secondary.text,
      opacity: '65%',
    }),
    inlineError: css({
      margin: '0px 0px 4px 245px',
    }),
    switchField: css({
      alignItems: 'center',
    }),
    sectionHeaderPadding: css({
      paddingTop: '32px',
    }),
    sectionBottomPadding: css({
      paddingBottom: '28px',
    }),
    subsectionText: css({
      fontSize: '12px',
    }),
    hrBottomSpace: css({
      marginBottom: '56px',
    }),
    hrTopSpace: css({
      marginTop: '50px',
    }),
    textUnderline: css({
      textDecoration: 'underline',
    }),
    versionMargin: css({
      marginBottom: '12px',
    }),
    advancedHTTPSettingsMargin: css({
      margin: '24px 0 8px 0',
    }),
    advancedSettings: css({
      paddingTop: '32px',
    }),
    alertingTop: css({
      marginTop: '40px !important',
    }),
    overhaulPageHeading: css({
      fontWeight: 400,
    }),
    container: css({
      maxwidth: 578,
    }),
  };
}
