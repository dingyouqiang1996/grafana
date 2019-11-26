import React, { PureComponent } from 'react';
import { DataSourceSettings, SelectableValue } from '@grafana/data';
import { Button, FormLabel, Select } from '@grafana/ui';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { GraphiteOptions, GraphiteType } from '../types';

const graphiteVersions = [
  { label: '0.9.x', value: '0.9' },
  { label: '1.0.x', value: '1.0' },
  { label: '1.1.x', value: '1.1' },
];

const graphiteTypes = Object.keys(GraphiteType).map((key: string) => ({
  label: key,
  value: (GraphiteType as any)[key],
}));

interface Props {
  value: DataSourceSettings<GraphiteOptions>;
  onChange: (value: DataSourceSettings<GraphiteOptions>) => void;
}

interface State {
  showMetricTankHelp: boolean;
  graphiteVersion: string;
}

export class GraphiteDetails extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showMetricTankHelp: false,
      graphiteVersion: '',
    };
  }

  componentDidMount() {
    const { value } = this.props;
    if (!value.id) {
      this.setState({ graphiteVersion: '' });
    }

    getDatasourceSrv()
      .loadDatasource(value.name)
      .then((dataSource: any) => {
        return dataSource.getVersion();
      })
      .then((version: any) => {
        if (!version) {
          return;
        }
        this.setState({ graphiteVersion: version });
      });
  }

  onChangeHandler = (key: keyof GraphiteOptions) => (newValue: SelectableValue) => {
    const { value, onChange } = this.props;
    onChange({
      ...value,
      jsonData: {
        ...value.jsonData,
        [key]: newValue.value,
      },
    });
  };

  render() {
    const { value } = this.props;
    const { graphiteVersion, showMetricTankHelp } = this.state;

    const versions = graphiteVersion
      ? [...graphiteVersions, { value: graphiteVersion, label: graphiteVersion }]
      : graphiteVersions;

    return (
      <>
        <h3 className="page-heading">Graphite details</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <FormLabel tooltip="This option controls what functions are available in the Graphite query editor.">
              Version
            </FormLabel>
            <Select
              value={versions.find(version =>
                !value.jsonData.graphiteVersion
                  ? version.value === '0.9'
                  : version.value === value.jsonData.graphiteVersion
              )}
              options={versions}
              width={8}
              onChange={this.onChangeHandler('graphiteVersion')}
            />
          </div>
          <div className="gf-form-inline">
            <FormLabel>Type</FormLabel>
            <Select
              options={graphiteTypes}
              value={graphiteTypes.find(type => type.value === value.jsonData.graphiteType)}
              width={8}
              onChange={this.onChangeHandler('graphiteType')}
            />

            <Button
              style={{ marginLeft: '8px', marginTop: '5px' }}
              variant="secondary"
              size="sm"
              onClick={() =>
                this.setState((prevState: State) => ({ showMetricTankHelp: !prevState.showMetricTankHelp }))
              }
            >
              Help <i className={showMetricTankHelp ? 'fa fa-caret-down' : 'fa fa-caret-right'} />
            </Button>
          </div>
          {showMetricTankHelp && (
            <div className="grafana-info-box m-t-2">
              <div className="alert-body">
                <p>
                  There are different types of Graphite compatible backends. Here you can specify the type you are
                  using. If you are using{' '}
                  <a href="https://github.com/grafana/metrictank" className="pointer" target="_blank">
                    Metrictank
                  </a>{' '}
                  then select that here. This will enable Metrictank specific features like query processing meta data.
                  Metrictank is a multi-tenant timeseries engine for Graphite and friends.
                </p>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
