import React from 'react';
import { hot } from 'react-hot-loader';
import Select from 'react-select';

import kbn from 'app/core/utils/kbn';
import colors from 'app/core/utils/colors';
import TimeSeries from 'app/core/time_series2';
import { decodePathComponent } from 'app/core/utils/location_util';
import { parse as parseDate } from 'app/core/utils/datemath';

import ElapsedTime from './ElapsedTime';
import QueryRows from './QueryRows';
import Graph from './Graph';
import Table from './Table';
import TimePicker, { DEFAULT_RANGE } from './TimePicker';
import { ensureQueries, generateQueryKey, hasQuery } from './utils/query';

function makeTimeSeriesList(dataList, options) {
  return dataList.map((seriesData, index) => {
    const datapoints = seriesData.datapoints || [];
    const alias = seriesData.target;
    const colorIndex = index % colors.length;
    const color = colors[colorIndex];

    const series = new TimeSeries({
      datapoints,
      alias,
      color,
      unit: seriesData.unit,
    });

    return series;
  });
}

function parseInitialState(initial: string | undefined) {
  if (initial) {
    try {
      const parsed = JSON.parse(decodePathComponent(initial));
      return {
        datasource: parsed.datasource,
        queries: parsed.queries.map(q => q.query),
        range: parsed.range,
      };
    } catch (e) {
      console.error(e);
    }
  }
  return { datasource: null, queries: [], range: DEFAULT_RANGE };
}

interface IExploreState {
  datasource: any;
  datasourceError: any;
  datasourceLoading: boolean | null;
  datasourceMissing: boolean;
  graphResult: any;
  initialDatasource?: string;
  latency: number;
  loading: any;
  queries: any;
  queryError: any;
  range: any;
  requestOptions: any;
  showingGraph: boolean;
  showingTable: boolean;
  tableResult: any;
}

export class Explore extends React.Component<any, IExploreState> {
  el: any;

  constructor(props) {
    super(props);
    const { datasource, queries, range } = parseInitialState(props.routeParams.state);
    this.state = {
      datasource: null,
      datasourceError: null,
      datasourceLoading: null,
      datasourceMissing: false,
      graphResult: null,
      initialDatasource: datasource,
      latency: 0,
      loading: false,
      queries: ensureQueries(queries),
      queryError: null,
      range: range || { ...DEFAULT_RANGE },
      requestOptions: null,
      showingGraph: true,
      showingTable: true,
      tableResult: null,
      ...props.initialState,
    };
  }

  async componentDidMount() {
    const { datasourceSrv } = this.props;
    const { initialDatasource } = this.state;
    if (!datasourceSrv) {
      throw new Error('No datasource service passed as props.');
    }
    const datasources = datasourceSrv.getExploreSources();
    if (datasources.length > 0) {
      this.setState({ datasourceLoading: true });
      // Priority: datasource in url, default datasource, first explore datasource
      let datasource;
      if (initialDatasource) {
        datasource = await datasourceSrv.get(initialDatasource);
      } else {
        datasource = await datasourceSrv.get();
      }
      if (!datasource.meta.explore) {
        datasource = await datasourceSrv.get(datasources[0].name);
      }
      this.setDatasource(datasource);
    } else {
      this.setState({ datasourceMissing: true });
    }
  }

  componentDidCatch(error) {
    this.setState({ datasourceError: error });
    console.error(error);
  }

  async setDatasource(datasource) {
    try {
      const testResult = await datasource.testDatasource();
      if (testResult.status === 'success') {
        this.setState({ datasource, datasourceError: null, datasourceLoading: false }, () => this.handleSubmit());
      } else {
        this.setState({ datasource: datasource, datasourceError: testResult.message, datasourceLoading: false });
      }
    } catch (error) {
      const message = (error && error.statusText) || error;
      this.setState({ datasource: datasource, datasourceError: message, datasourceLoading: false });
    }
  }

  getRef = el => {
    this.el = el;
  };

  handleAddQueryRow = index => {
    const { queries } = this.state;
    const nextQueries = [
      ...queries.slice(0, index + 1),
      { query: '', key: generateQueryKey() },
      ...queries.slice(index + 1),
    ];
    this.setState({ queries: nextQueries });
  };

  handleChangeDatasource = async option => {
    this.setState({
      datasource: null,
      datasourceError: null,
      datasourceLoading: true,
      graphResult: null,
      tableResult: null,
    });
    const datasource = await this.props.datasourceSrv.get(option.value);
    this.setDatasource(datasource);
  };

  handleChangeQuery = (value, index) => {
    const { queries } = this.state;
    const prevQuery = queries[index];
    const edited = prevQuery.query !== value;
    const nextQuery = {
      ...queries[index],
      edited,
      query: value,
    };
    const nextQueries = [...queries];
    nextQueries[index] = nextQuery;
    this.setState({ queries: nextQueries });
  };

  handleChangeTime = nextRange => {
    const range = {
      from: nextRange.from,
      to: nextRange.to,
    };
    this.setState({ range }, () => this.handleSubmit());
  };

  handleClickCloseSplit = () => {
    const { onChangeSplit } = this.props;
    if (onChangeSplit) {
      onChangeSplit(false);
    }
  };

  handleClickGraphButton = () => {
    this.setState(state => ({ showingGraph: !state.showingGraph }));
  };

  handleClickSplit = () => {
    const { onChangeSplit } = this.props;
    if (onChangeSplit) {
      onChangeSplit(true, this.state);
    }
  };

  handleClickTableButton = () => {
    this.setState(state => ({ showingTable: !state.showingTable }));
  };

  handleRemoveQueryRow = index => {
    const { queries } = this.state;
    if (queries.length <= 1) {
      return;
    }
    const nextQueries = [...queries.slice(0, index), ...queries.slice(index + 1)];
    this.setState({ queries: nextQueries }, () => this.handleSubmit());
  };

  handleSubmit = () => {
    const { showingGraph, showingTable } = this.state;
    if (showingTable) {
      this.runTableQuery();
    }
    if (showingGraph) {
      this.runGraphQuery();
    }
  };

  onClickTableCell = (columnKey: string, rowValue: string) => {
    const { datasource, queries } = this.state;
    if (datasource && datasource.modifyQuery) {
      const nextQueries = queries.map(q => ({
        ...q,
        edited: false,
        query: datasource.modifyQuery(q.query, { addFilter: { key: columnKey, value: rowValue } }),
      }));
      this.setState({ queries: nextQueries }, () => this.handleSubmit());
    }
  };

  buildQueryOptions(targetOptions: { format: string; instant: boolean }) {
    const { datasource, queries, range } = this.state;
    const resolution = this.el.offsetWidth;
    const absoluteRange = {
      from: parseDate(range.from, false),
      to: parseDate(range.to, true),
    };
    const { interval } = kbn.calculateInterval(absoluteRange, resolution, datasource.interval);
    const targets = queries.map(q => ({
      ...targetOptions,
      expr: q.query,
    }));
    return {
      interval,
      range,
      targets,
    };
  }

  async runGraphQuery() {
    const { datasource, queries } = this.state;
    if (!hasQuery(queries)) {
      return;
    }
    this.setState({ latency: 0, loading: true, graphResult: null, queryError: null });
    const now = Date.now();
    const options = this.buildQueryOptions({ format: 'time_series', instant: false });
    try {
      const res = await datasource.query(options);
      const result = makeTimeSeriesList(res.data, options);
      const latency = Date.now() - now;
      this.setState({ latency, loading: false, graphResult: result, requestOptions: options });
    } catch (response) {
      console.error(response);
      const queryError = response.data ? response.data.error : response;
      this.setState({ loading: false, queryError });
    }
  }

  async runTableQuery() {
    const { datasource, queries } = this.state;
    if (!hasQuery(queries)) {
      return;
    }
    this.setState({ latency: 0, loading: true, queryError: null, tableResult: null });
    const now = Date.now();
    const options = this.buildQueryOptions({
      format: 'table',
      instant: true,
    });
    try {
      const res = await datasource.query(options);
      const tableModel = res.data[0];
      const latency = Date.now() - now;
      this.setState({ latency, loading: false, tableResult: tableModel, requestOptions: options });
    } catch (response) {
      console.error(response);
      const queryError = response.data ? response.data.error : response;
      this.setState({ loading: false, queryError });
    }
  }

  request = url => {
    const { datasource } = this.state;
    return datasource.metadataRequest(url);
  };

  render() {
    const { datasourceSrv, position, split } = this.props;
    const {
      datasource,
      datasourceError,
      datasourceLoading,
      datasourceMissing,
      graphResult,
      latency,
      loading,
      queries,
      queryError,
      range,
      requestOptions,
      showingGraph,
      showingTable,
      tableResult,
    } = this.state;
    const showingBoth = showingGraph && showingTable;
    const graphHeight = showingBoth ? '200px' : '400px';
    const graphButtonActive = showingBoth || showingGraph ? 'active' : '';
    const tableButtonActive = showingBoth || showingTable ? 'active' : '';
    const exploreClass = split ? 'explore explore-split' : 'explore';
    const datasources = datasourceSrv.getExploreSources().map(ds => ({
      value: ds.name,
      label: ds.name,
    }));
    const selectedDatasource = datasource ? datasource.name : undefined;

    return (
      <div className={exploreClass} ref={this.getRef}>
        <div className="navbar">
          {position === 'left' ? (
            <div>
              <a className="navbar-page-btn">
                <i className="fa fa-rocket" />
                Explore
              </a>
            </div>
          ) : (
            <div className="navbar-buttons explore-first-button">
              <button className="btn navbar-button" onClick={this.handleClickCloseSplit}>
                Close Split
              </button>
            </div>
          )}
          {!datasourceMissing ? (
            <div className="navbar-buttons">
              <Select
                className="datasource-picker"
                clearable={false}
                onChange={this.handleChangeDatasource}
                options={datasources}
                placeholder="Loading datasources..."
                value={selectedDatasource}
              />
            </div>
          ) : null}
          <div className="navbar__spacer" />
          {position === 'left' && !split ? (
            <div className="navbar-buttons">
              <button className="btn navbar-button" onClick={this.handleClickSplit}>
                Split
              </button>
            </div>
          ) : null}
          <div className="navbar-buttons">
            <button className={`btn navbar-button ${graphButtonActive}`} onClick={this.handleClickGraphButton}>
              Graph
            </button>
            <button className={`btn navbar-button ${tableButtonActive}`} onClick={this.handleClickTableButton}>
              Table
            </button>
          </div>
          <TimePicker range={range} onChangeTime={this.handleChangeTime} />
          <div className="navbar-buttons relative">
            <button className="btn navbar-button--primary" onClick={this.handleSubmit}>
              Run Query <i className="fa fa-level-down run-icon" />
            </button>
            {loading || latency ? <ElapsedTime time={latency} className="text-info" /> : null}
          </div>
        </div>

        {datasourceLoading ? <div className="explore-container">Loading datasource...</div> : null}

        {datasourceMissing ? (
          <div className="explore-container">Please add a datasource that supports Explore (e.g., Prometheus).</div>
        ) : null}

        {datasourceError ? (
          <div className="explore-container">Error connecting to datasource. [{datasourceError}]</div>
        ) : null}

        {datasource && !datasourceError ? (
          <div className="explore-container">
            <QueryRows
              queries={queries}
              request={this.request}
              onAddQueryRow={this.handleAddQueryRow}
              onChangeQuery={this.handleChangeQuery}
              onExecuteQuery={this.handleSubmit}
              onRemoveQueryRow={this.handleRemoveQueryRow}
            />
            {queryError ? <div className="text-warning m-a-2">{queryError}</div> : null}
            <main className="m-t-2">
              {showingGraph ? (
                <Graph
                  data={graphResult}
                  id={`explore-graph-${position}`}
                  options={requestOptions}
                  height={graphHeight}
                  split={split}
                />
              ) : null}
              {showingTable ? <Table data={tableResult} onClickCell={this.onClickTableCell} className="m-t-3" /> : null}
            </main>
          </div>
        ) : null}
      </div>
    );
  }
}

export default hot(module)(Explore);
