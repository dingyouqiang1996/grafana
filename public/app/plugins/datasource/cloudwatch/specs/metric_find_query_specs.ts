import {describe, beforeEach, it, sinon, expect, angularMocks} from 'test/lib/common';
import moment from 'moment';
import helpers from 'test/specs/helpers';
import {CloudWatchDatasource} from '../datasource';
import CloudWatchMetricFindQuery from '../metric_find_query';

describe('CloudWatchMetricFindQuery', function() {

  var ctx = new helpers.ServiceTestContext();
  var instanceSettings = {
    jsonData: {defaultRegion: 'us-east-1', access: 'proxy'},
  };

  beforeEach(angularMocks.module('grafana.core'));
  beforeEach(angularMocks.module('grafana.services'));
  beforeEach(angularMocks.module('grafana.controllers'));
  beforeEach(ctx.providePhase(['templateSrv', 'backendSrv']));

  beforeEach(angularMocks.inject(function($q, $rootScope, $httpBackend, $injector) {
    ctx.$q = $q;
    ctx.$httpBackend =  $httpBackend;
    ctx.$rootScope = $rootScope;
    ctx.ds = $injector.instantiate(CloudWatchDatasource, {instanceSettings: instanceSettings});
    $httpBackend.when('GET', /\.html$/).respond('');
  }));

  function describeMetricFindQuery(query, func) {
    describe('metricFindQuery ' + query, () => {
      let scenario: any = {};
      scenario.setup = setupCallback => {
        beforeEach(() => {
          setupCallback();
          ctx.backendSrv.datasourceRequest = args => {
            scenario.request = args;
            return ctx.$q.when({data: scenario.requestResponse });
          };
          ctx.ds.metricFindQuery(query).then(args => {
            scenario.result = args;
          });
          ctx.$rootScope.$apply();
        });
      };

      func(scenario);
    });
  }

  describeMetricFindQuery('regions()', scenario => {
    scenario.setup(() => {
      scenario.requestResponse = [{text: 'us-east-1'}];
    });

    it('should call __GetRegions and return result', () => {
      expect(scenario.result[0].text).to.contain('us-east-1');
      expect(scenario.request.data.action).to.be('__GetRegions');
    });
  });

  describeMetricFindQuery('namespaces()', scenario => {
    scenario.setup(() => {
      scenario.requestResponse = [{text: 'AWS/EC2'}];
    });

    it('should call __GetNamespaces and return result', () => {
      expect(scenario.result[0].text).to.contain('AWS/EC2');
      expect(scenario.request.data.action).to.be('__GetNamespaces');
    });
  });

  describeMetricFindQuery('metrics(AWS/EC2)', scenario => {
    scenario.setup(() => {
      scenario.requestResponse = [{text: 'CPUUtilization'}];
    });

    it('should call __GetMetrics and return result', () => {
      expect(scenario.result[0].text).to.be('CPUUtilization');
      expect(scenario.request.data.action).to.be('__GetMetrics');
    });
  });

  describeMetricFindQuery('dimension_keys(AWS/EC2)', scenario => {
    scenario.setup(() => {
      scenario.requestResponse = [{text: 'InstanceId'}];
    });

    it('should call __GetDimensions and return result', () => {
      expect(scenario.result[0].text).to.be('InstanceId');
      expect(scenario.request.data.action).to.be('__GetDimensions');
    });
  });

  describeMetricFindQuery('dimension_values(us-east-1,AWS/EC2,CPUUtilization,InstanceId)', scenario => {
    scenario.setup(() => {
      scenario.requestResponse = {
        Metrics: [
          {
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [
              {
                Name: 'InstanceId',
                Value: 'i-12345678'
              }
            ]
          }
        ]
      };
    });

    it('should call __ListMetrics and return result', () => {
      expect(scenario.result[0].text).to.be('i-12345678');
      expect(scenario.request.data.action).to.be('ListMetrics');
    });
  });

  describeMetricFindQuery('elb_instance_ids(us-east-1,loadBalancerName)', scenario => {
    scenario.setup(() => {
      scenario.requestResponse = {
        InstanceStates: [
          {
            InstanceId: 'i-12345678',
            ReasonCode: 'N/A',
            State: 'InService',
            Description: 'N/A'
          }
        ]
      };
    });

    it('should call ElbDescribeInstanceHealth and return result', () => {
      expect(scenario.result[0].text).to.be('i-12345678');
      expect(scenario.request.data.action).to.be('ElbDescribeInstanceHealth');
    });
  });
});
