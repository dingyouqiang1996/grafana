---
aliases:
  - ../dashboard-public/ # /docs/grafana/latest/dashboards/dashboard-public/
labels:
  products:
    - cloud
    - enterprise
    - oss
title: Externally shared dashboards
menuTitle: Shared dashboards
description: Make your Grafana dashboards externally shared and share them with anyone
weight: 8
refs:
  dashboard-sharing:
    - pattern: /docs/grafana/
      destination: /docs/grafana/<GRAFANA_VERSION>/dashboards/share-dashboards-panels/
    - pattern: /docs/grafana-cloud/
      destination: /docs/grafana-cloud/visualizations/dashboards/share-dashboards-panels/
  custom-branding:
    - pattern: /docs/grafana/
      destination: /docs/grafana/<GRAFANA_VERSION>/setup-grafana/configure-grafana/configure-custom-branding/
    - pattern: /docs/grafana-cloud/
      destination: /docs/grafana/<GRAFANA_VERSION>/setup-grafana/configure-grafana/configure-custom-branding/
  dashboard-insights-documentation:
    - pattern: /docs/grafana/
      destination: /docs/grafana/<GRAFANA_VERSION>/dashboards/assess-dashboard-usage/#dashboard-insights
    - pattern: /docs/grafana-cloud/
      destination: /docs/grafana-cloud/visualizations/dashboards/assess-dashboard-usage/
  caching:
    - pattern: /docs/grafana/
      destination: /docs/grafana/<GRAFANA_VERSION>/administration/data-source-management/#query-and-resource-caching
    - pattern: /docs/grafana-cloud/
      destination: /docs/grafana/<GRAFANA_VERSION>/administration/data-source-management/#query-and-resource-caching
  grafana-enterprise:
    - pattern: /docs/grafana/
      destination: /docs/grafana/<GRAFANA_VERSION>/introduction/grafana-enterprise/
    - pattern: /docs/grafana-cloud/
      destination: /docs/grafana/<GRAFANA_VERSION>/introduction/grafana-enterprise/
---

# Externally shared dashboards

<!-- Update aliases -->

{{< admonition type="warning" >}}
Sharing your dashboard externally could result in a large number of queries to the data sources used by your dashboard.
This can be mitigated by using the Enterprise [caching](ref:caching) and/or rate limiting features.
{{< /admonition >}}

Externally shared dashboards allow you to share your Grafana dashboard with anyone. This is useful when you want to make your dashboard available to the world without requiring access to your Grafana organization.

## Shared dashboards list

You can see a list of all your externally shared dashboards in one place by navigating to **Dashboards > Shared dashboards**. For each dashboard in the list, the page displays:

- a link to view the externally shared version of the dashboard
- a link to the shared dashboard configuration
- options to pause or revoke access to the external dashboard

You can also click the name of the dashboard to navigate to the dashboard internally.

## Security implications of sharing your dashboard externally

- Anyone with the URL can access the dashboard.
- Externally shared dashboards are read-only.
- Arbitrary queries **cannot** be run against your data sources through externally shared dashboards. Externally shared dashboards can only execute the
  queries stored on the original dashboard.

### Share externally to anyone with a link

To share your dashboard so that anyone with the link can access it, follow these steps.

1. Click **Dashboards** in the main menu.
1. Click the dashboard you want to share.
1. Click the **Share** drop-down in the top-right corner and select **Share externally**.
1. In the **Link access** drop-down, select **Anyone with the link**.
1. Click the checkbox confirming that you understand the entire dashboard will be public.
1. Click **Accept**.
1. (Optional) Set the following options:
   - **Enable time range** - Allow people accessing the link to change the time range. This configuration screen shows the default time range of the dashboard.
   - **Display annotations** - Allow people accessing the link to view the dashboard annotations.
1. Now anyone with the link can access the dashboard until you pause or revoke access to it.
1. Click the **X** at the top-right corner to close the share drawer.

Once you've shared a dashboard externally, a **Public** label is displayed in the header of the dashboard.

#### Update access to an external dashboard link

You can update the access to externally shared dashboard links by following these steps:

1. Click **Dashboards** in the main menu.
1. Click the dashboard you want to share.
1. Click the **Share** drop-down in the top-right corner and select **Share externally**.
1. Do one of the following:
   - Click **Pause access** so that people can't access the dashboard, but the link is maintained.
   - Click **Resume access** so that people can access the dashboard again.
   - Click **Revoke access** so that people can't access the dashboard unless a new external link is generated. Confirm that you want to revoke the link.
1. Click the **X** at the top-right corner to close the share drawer.

The link no longer works. You must create a new external link, as in [Share externally to anyone with a link](#share-externally-to-anyone-with-a-link).

## Share externally with specific people

{{< admonition type="note" >}}
Available in [Grafana Enterprise](ref:grafana-enterprise) and [Grafana Cloud](/docs/grafana-cloud).
{{< /admonition >}}

To share with specific external users, you can send them a link by email. Use this option when you only want to share your dashboard with specific people instead of anyone who navigates to the link. When you use email sharing, recipients receive a one-time use link that's valid for **one hour**. Once the link is used, the viewer has access to the shared dashboard for **30 days**.

When you share a dashboard with an email link, your organization is billed per user for the duration of the 30-day token, regardless of how many dashboards are shared. Billing stops after 30 days unless you renew the token.

1. Click **Dashboards** in the main menu.
1. Click the dashboard you want to share.
1. Click the **Share** drop-down in the top-right corner and select **Share externally**.
1. In the **Link access** drop-down, select **Only specific people**.
1. Click the checkbox confirming that you understand payment is required to add users.
1. Click **Accept**.
1. In the **Invite** field, enter the email address of the person you want to invite and click **Invite**.

   You can only invite one person at a time.

1. (Optional) Set the following options:
   - **Enable time range** - Allow people accessing the link to change the time range. This configuration screen shows the default time range of the dashboard.
   - **Display annotations** - Allow people accessing the link to view the dashboard annotations.
1. Click **Copy external link**.
1. Send the copied URL to any external user.
1. Click the **X** at the top-right corner to close the share drawer.

### Viewers requesting access

If a viewer without access tries to navigate to the shared dashboard, they'll be asked to request access by providing their email. They'll receive an email with a new one-time use link if the email they provided has already been invited to view the shared dashboard and hasn't been revoked.

### Revoke access for a viewer

You can revoke access to the entire dashboard using the steps in [Update access to an external dashboard link](#update-access-to-an-external-dashboard-link), but you can also revoke access to the dashboard for specific people.

1. Click **Dashboards** in the main menu.
1. Click the dashboard you want to share.
1. Click the **Share** drop-down in the top-right corner and select **Share externally**.
1. Click the menu icon (three dots) next to the email address of the viewer for whom you'd like to revoke access.
1. Click **Revoke access**.

The viewer immediately no longer has access to the dashboard, nor can they use any existing one-time use links they may have.

### Re-invite a viewer

1. Click **Dashboards** in the main menu.
1. Click the dashboard you want to share.
1. Click the **Share** drop-down in the top-right corner and select **Share externally**.
1. Click the menu icon (three dots) next to the email address of the viewer you'd like to invite again.
1. Click **Resend invite**.

The viewer receives an email with a new one-time use link. This invalidates all previously issued links for that viewer.

### View shared dashboard users

To see a list of users who have accessed your externally shared dashboard by way of email sharing, take the following steps:

1. In the main menu, click **Administration**.
1. Select **Users and access** > **Users**.
1. On the **Users** page, click the **Shared dashboard users** tab.

From here, you can see the earliest time a user has been active in a dashboard, when they last accessed a shared dashboard, which dashboards they have access to, and their role. You can also revoke a user's access to all shared dashboards on from this tab.

<!-- maybe an image here? -->

### Access limitations

One-time use links use browser cookies, so when a viewer is granted access through one of these links, they'll only have access on the browser they used to claim the link.

A single viewer can't generate multiple valid one-time use links. When a new one-time use link is issued for a viewer, all previous ones are invalidated.

If a Grafana user has read access to the parent dashboard, they can view the externally shared dashboard without needing to have access granted.

## Assess shared dashboard usage

{{< admonition type="note" >}}
Available in [Grafana Enterprise](ref:grafana-enterprise) and [Grafana Cloud](/docs/grafana-cloud).
{{< /admonition >}}

You can check usage analytics about your externally shared dashboard by clicking the insights icon in the dashboard header:

{{< figure src="/media/docs/grafana/dashboards/screenshot-dashboard-insights-11.2.png" max-width="400px" class="docs-image--no-shadow" alt="Dashboard insights icon" >}}

<!--image to be updated -->

Learn more about the kind of information provided in the [dashboard insights documentation](ref:dashboard-insights-documentation).

## Supported data sources

Externally shared dashboards _should_ work with any data source that has the properties `backend` and `alerting` both set to true in its `plugin.json`. However, this can't always be
guaranteed because plugin developers can override this functionality. The following lists include data sources confirmed to work with externally shared dashboards and data sources that should work, but have not been confirmed as compatible.

### Confirmed:

<table>
  <tr>
    <td>
      <ul>
        <li>ClickHouse</li>
        <li>CloudWatch</li>
        <li>Elasticsearch</li>
        <li>Infinity</li>
        <li>InfluxDB</li>
        <li>Loki</li>
        <li>Microsoft SQL Server</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>MongoDB</li>
        <li>MySQL</li>
        <li>Oracle Database</li>
        <li>PostgreSQL</li>
        <li>Prometheus</li>
        <li>Redis</li>
        <li>SQLite</li>
      </ul>
    </td>
  </tr>
</table>

### Unsupported:

<table>
  <tr>
    <td>
      <ul>
        <li>Graphite</li>
      </ul>
    </td>
  </tr>
</table>

### Unconfirmed:

<table>
  <tr>
    <td>
      <ul>
        <li>Altinity plugin for ClickHouse</li>
        <li>Amazon Athena</li>
        <li>Amazon Redshift</li>
        <li>Amazon Timestream</li>
        <li>Apache Cassandra</li>
        <li>AppDynamics</li>
        <li>Azure Data Explorer Datasource</li>
        <li>Azure Monitor</li>
        <li>CSV</li>
        <li>DB2 Datasource</li>
        <li>Databricks</li>
        <li>Datadog</li>
        <li>Dataset</li>
        <li>Druid</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Dynatrace</li>
        <li>GitHub</li>
        <li>Google BigQuery</li>
        <li>Grafana for YNAB</li>
        <li>Honeycomb</li>
        <li>Jira</li>
        <li>Mock</li>
        <li>Neo4j Datasource</li>
        <li>New Relic</li>
        <li>OPC UA (Unified Architecture)</li>
        <li>Open Distro for Elasticsearch</li>
        <li>OpenSearch</li>
        <li>OpenTSDB</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Orbit</li>
        <li>SAP HANA®</li>
        <li>Salesforce</li>
        <li>Sentry</li>
        <li>ServiceNow</li>
        <li>Snowflake</li>
        <li>Splunk</li>
        <li>Splunk Infrastructure Monitoring</li>
        <li>Sqlyze data source</li>
        <li>TDengine</li>
        <li>Vertica</li>
        <li>Wavefront</li>
        <li>X-Ray</li>
        <li>kdb+</li>
        <li>simple grpc data source</li>
      </ul>
    </td>
  </tr>
</table>

## Limitations

- Panels that use frontend data sources will fail to fetch data.
- Template variables are not supported.
- Exemplars will be omitted from the panel.
- Only annotations that query the `-- Grafana --` data source are supported.
- Organization annotations are not supported.
- Grafana Live and real-time event streams are not supported.
- Library panels are not supported.
- Data sources using Reverse Proxy functionality are not supported.

## Custom branding

If you're a Grafana Enterprise customer, you can use custom branding to change the appearance of an externally shared dashboard footer. For more information, refer to [Custom branding](ref:custom-branding).
