//import { describe, beforeEach, it, expect, angularMocks } from 'test/lib/common';
import config from 'app/core/config';
import 'app/features/plugins/datasource_srv';
import { DatasourceSrv } from 'app/features/plugins/datasource_srv';

describe('datasource_srv', function() {
  let _datasourceSrv = new DatasourceSrv({}, {}, {}, {});
  let metricSources;
  //var templateSrv = {};

  // beforeEach(angularMocks.module('grafana.core'));
  // beforeEach(
  //   angularMocks.module(function($provide) {
  //     $provide.value('templateSrv', templateSrv);
  //   })
  // );
  // beforeEach(angularMocks.module('grafana.services'));
  // beforeEach(
  //   angularMocks.inject(function(datasourceSrv) {
  //     _datasourceSrv = datasourceSrv;
  //   })
  // );

  describe('when loading metric sources', () => {
    let unsortedDatasources = {
      mmm: {
        type: 'test-db',
        meta: { metrics: { m: 1 } },
      },
      '--Grafana--': {
        type: 'grafana',
        meta: { builtIn: true, metrics: { m: 1 }, id: 'grafana' },
      },
      '--Mixed--': {
        type: 'test-db',
        meta: { builtIn: true, metrics: { m: 1 }, id: 'mixed' },
      },
      ZZZ: {
        type: 'test-db',
        meta: { metrics: { m: 1 } },
      },
      aaa: {
        type: 'test-db',
        meta: { metrics: { m: 1 } },
      },
      BBB: {
        type: 'test-db',
        meta: { metrics: { m: 1 } },
      },
    };
    beforeEach(() => {
      config.datasources = unsortedDatasources;
      metricSources = _datasourceSrv.getMetricSources({ skipVariables: true });
    });

    it('should return a list of sources sorted case insensitively with builtin sources last', () => {
      expect(metricSources[0].name).toBe('aaa');
      expect(metricSources[1].name).toBe('BBB');
      expect(metricSources[2].name).toBe('mmm');
      expect(metricSources[3].name).toBe('ZZZ');
      expect(metricSources[4].name).toBe('--Grafana--');
      expect(metricSources[5].name).toBe('--Mixed--');
    });
  });
});
