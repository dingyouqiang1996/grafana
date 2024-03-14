import { css } from '@emotion/css';
import React from 'react';

import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { config, reportInteraction } from '@grafana/runtime';
import {
  Button,
  FileDropzone,
  HorizontalGroup,
  InlineField,
  InlineFieldRow,
  Modal,
  RadioButtonGroup,
  Themeable2,
  withTheme2,
} from '@grafana/ui';

import { generateId } from './SearchTraceQLEditor/TagsInput';
import TraceQLSearch from './SearchTraceQLEditor/TraceQLSearch';
import { ServiceGraphSection } from './ServiceGraphSection';
import { SearchTableType, TempoQueryType, TraceqlFilter, TraceqlSearchScope } from './dataquery.gen';
import { TempoDatasource } from './datasource';
import { QueryEditor } from './traceql/QueryEditor';
import { TempoQuery } from './types';

interface Props extends QueryEditorProps<TempoDatasource, TempoQuery>, Themeable2 {}
interface State {
  uploadModalOpen: boolean;
}

// This needs to default to traceql for data sources like Splunk, where clicking on a
// data link should open the traceql tab and run a search based on the configured query.
const DEFAULT_QUERY_TYPE: TempoQueryType = 'traceql';

class TempoQueryFieldComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      uploadModalOpen: false,
    };
  }

  // Set the default query type when the component mounts.
  // Also do this if queryType is 'clear' (which is the case when the user changes the query type)
  // otherwise if the user changes the query type and refreshes the page, no query type will be selected
  // which is inconsistent with how the UI was originally when they selected the Tempo data source.
  async componentDidMount() {
    if (!this.props.query.queryType || this.props.query.queryType === 'clear') {
      this.props.onChange({
        ...this.props.query,
        queryType: DEFAULT_QUERY_TYPE,
      });
    }
  }

  onClearResults = () => {
    // Run clear query to clear results
    const { onChange, query, onRunQuery } = this.props;
    onChange({
      ...query,
      queryType: 'clear',
    });
    onRunQuery();
  };

  render() {
    const { query, onChange, datasource, app } = this.props;

    const graphDatasourceUid = datasource.serviceMap?.datasourceUid;

    let queryTypeOptions: Array<SelectableValue<TempoQueryType>> = [
      { value: 'traceqlSearch', label: 'Search' },
      { value: 'traceql', label: 'TraceQL' },
      { value: 'serviceMap', label: 'Service Graph' },
    ];

    // Show the deprecated search option if any of the deprecated search fields are set
    if (
      query.spanName ||
      query.serviceName ||
      query.search ||
      query.maxDuration ||
      query.minDuration ||
      query.queryType === 'nativeSearch'
    ) {
      let filters: TraceqlFilter[] = [];
      if (query.spanName) {
        filters.push({
          id: generateId(),
          scope: TraceqlSearchScope.Span,
          tag: 'name',
          operator: '=',
          value: [query.spanName],
          valueType: 'string',
        });
      }
      if (query.serviceName) {
        filters.push({
          id: generateId(),
          scope: TraceqlSearchScope.Resource,
          tag: 'service.name',
          operator: '=',
          value: [query.serviceName],
          valueType: 'string',
        });
      }
      if (query.minDuration) {
        filters.push({
          id: 'min-duration',
          tag: 'duration',
          operator: '>',
          value: [query.minDuration],
          valueType: 'duration',
        });
      }
      if (query.maxDuration) {
        filters.push({
          id: 'max-duration',
          tag: 'duration',
          operator: '<',
          value: [query.maxDuration],
          valueType: 'duration',
        });
      }
      if (query.search) {
        const tags = query.search.split(' ');
        for (const tag of tags) {
          const [key, value] = tag.split('=');
          if (key && value) {
            filters.push({
              id: generateId(),
              scope: TraceqlSearchScope.Unscoped,
              tag: key,
              operator: '=',
              value: [value.replace(/(^"|"$)/g, '')], // remove quotes at start and end of string
              valueType: 'string',
            });
          }
        }
      }

      const newQuery: TempoQuery = {
        datasource: query.datasource,
        filters,
        groupBy: query.groupBy,
        limit: query.limit,
        query: query.query,
        queryType: 'traceqlSearch',
        refId: query.refId,
        tableType: SearchTableType.Traces,
      };

      onChange(newQuery);
    }

    return (
      <>
        <Modal
          title={'Upload trace'}
          isOpen={this.state.uploadModalOpen}
          onDismiss={() => this.setState({ uploadModalOpen: false })}
        >
          <div className={css({ padding: this.props.theme.spacing(2) })}>
            <FileDropzone
              options={{ multiple: false }}
              onLoad={(result) => {
                if (typeof result !== 'string' && result !== null) {
                  throw Error(`Unexpected result type: ${typeof result}`);
                }
                this.props.datasource.uploadedJson = result;
                onChange({
                  ...query,
                  queryType: 'upload',
                });
                this.setState({ uploadModalOpen: false });
                this.props.onRunQuery();
              }}
            />
          </div>
        </Modal>
        <InlineFieldRow>
          <InlineField label="Query type" grow={true}>
            <HorizontalGroup spacing={'sm'} align={'center'} justify={'space-between'}>
              <RadioButtonGroup<TempoQueryType>
                options={queryTypeOptions}
                value={query.queryType}
                onChange={(v) => {
                  reportInteraction('grafana_traces_query_type_changed', {
                    datasourceType: 'tempo',
                    app: app ?? '',
                    grafana_version: config.buildInfo.version,
                    newQueryType: v,
                    previousQueryType: query.queryType ?? '',
                  });

                  this.onClearResults();
                  onChange({
                    ...query,
                    queryType: v,
                  });
                }}
                size="md"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  this.setState({ uploadModalOpen: true });
                }}
              >
                Import trace
              </Button>
            </HorizontalGroup>
          </InlineField>
        </InlineFieldRow>
        {query.queryType === 'traceqlSearch' && (
          <TraceQLSearch
            datasource={this.props.datasource}
            query={query}
            onChange={onChange}
            onBlur={this.props.onBlur}
            app={app}
            onClearResults={this.onClearResults}
          />
        )}
        {query.queryType === 'serviceMap' && (
          <ServiceGraphSection graphDatasourceUid={graphDatasourceUid} query={query} onChange={onChange} />
        )}
        {query.queryType === 'traceql' && (
          <QueryEditor
            datasource={this.props.datasource}
            query={query}
            onRunQuery={this.props.onRunQuery}
            onChange={onChange}
            app={app}
            onClearResults={this.onClearResults}
          />
        )}
      </>
    );
  }
}

export const TempoQueryField = withTheme2(TempoQueryFieldComponent);
