
import '../query_ctrl';
import 'app/core/services/segment_srv';
import {describe, beforeEach, it, sinon, expect, angularMocks} from 'test/lib/common';

import gfunc from '../gfunc';
import helpers from 'test/specs/helpers';

describe('GraphiteQueryCtrl', function() {
  var ctx = new helpers.ControllerTestContext();

  beforeEach(angularMocks.module('grafana.core'));
  beforeEach(angularMocks.module('grafana.controllers'));
  beforeEach(angularMocks.module('grafana.services'));

  beforeEach(ctx.providePhase());
  beforeEach(angularMocks.inject(($rootScope, $controller, $q) => {
    ctx.$q = $q;
    ctx.scope = $rootScope.$new();
    ctx.scope.ctrl = {panel: ctx.panel};
    ctx.panelCtrl = ctx.scope.ctrl;
    ctx.controller = $controller('GraphiteQueryCtrl', {$scope: ctx.scope});
  }));

  beforeEach(function() {
    ctx.scope.target = {target: 'aliasByNode(scaleToSeconds(test.prod.*,1),2)'};

    ctx.panelCtrl.datasource = ctx.datasource;
    ctx.panelCtrl.datasource.metricFindQuery = sinon.stub().returns(ctx.$q.when([]));
  });

  describe('init', function() {
    beforeEach(function() {
      ctx.scope.init();
      ctx.scope.$digest();
    });

    it('should validate metric key exists', function() {
      expect(ctx.panelCtrl.datasource.metricFindQuery.getCall(0).args[0]).to.be('test.prod.*');
    });

    it('should delete last segment if no metrics are found', function() {
      expect(ctx.scope.segments[2].value).to.be('select metric');
    });

    it('should parse expression and build function model', function() {
      expect(ctx.scope.functions.length).to.be(2);
    });
  });

  describe('when adding function', function() {
    beforeEach(function() {
      ctx.scope.target.target = 'test.prod.*.count';
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([{expandable: false}]));
      ctx.scope.init();
      ctx.scope.$digest();

      ctx.panelCtrl.refresh = sinon.spy();
      ctx.scope.addFunction(gfunc.getFuncDef('aliasByNode'));
    });

    it('should add function with correct node number', function() {
      expect(ctx.scope.functions[0].params[0]).to.be(2);
    });

    it('should update target', function() {
      expect(ctx.scope.target.target).to.be('aliasByNode(test.prod.*.count, 2)');
    });

    it('should call refresh', function() {
      expect(ctx.panelCtrl.refresh.called).to.be(true);
    });
  });

  describe('when adding function before any metric segment', function() {
    beforeEach(function() {
      ctx.scope.target.target = '';
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([{expandable: true}]));
      ctx.scope.init();
      ctx.scope.$digest();
      ctx.scope.addFunction(gfunc.getFuncDef('asPercent'));
    });

    it('should add function and remove select metric link', function() {
      expect(ctx.scope.segments.length).to.be(0);
    });
  });

  describe('when initalizing target without metric expression and only function', function() {
    beforeEach(function() {
      ctx.scope.target.target = 'asPercent(#A, #B)';
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([]));
      ctx.scope.init();
      ctx.scope.$digest();
    });

    it('should not add select metric segment', function() {
      expect(ctx.scope.segments.length).to.be(0);
    });

    it('should add both series refs as params', function() {
      expect(ctx.scope.functions[0].params.length).to.be(2);
    });

  });

  describe('when initializing a target with single param func using variable', function() {
    beforeEach(function() {
      ctx.scope.target.target = 'movingAverage(prod.count, $var)';
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([]));
      ctx.scope.init();
      ctx.scope.$digest();
    });

    it('should add 2 segments', function() {
      expect(ctx.scope.segments.length).to.be(2);
    });

    it('should add function param', function() {
      expect(ctx.scope.functions[0].params.length).to.be(1);
    });

  });

  describe('when initalizing target without metric expression and function with series-ref', function() {
    beforeEach(function() {
      ctx.scope.target.target = 'asPercent(metric.node.count, #A)';
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([]));
      ctx.scope.init();
      ctx.scope.$digest();
      ctx.scope.$parent = { get_data: sinon.spy() };
    });

    it('should add segments', function() {
      expect(ctx.scope.segments.length).to.be(3);
    });

    it('should have correct func params', function() {
      expect(ctx.scope.functions[0].params.length).to.be(1);
    });
  });

  describe('when getting altSegments and metricFindQuery retuns empty array', function() {
    beforeEach(function() {
      ctx.scope.target.target = 'test.count';
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([]));
      ctx.scope.init();
      ctx.scope.getAltSegments(1).then(function(results) {
        ctx.altSegments = results;
      });
      ctx.scope.$digest();
    });

    it('should have no segments', function() {
      expect(ctx.altSegments.length).to.be(0);
    });

  });

  describe('targetChanged', function() {
    beforeEach(function() {
      ctx.panelCtrl.datasource.metricFindQuery.returns(ctx.$q.when([{expandable: false}]));
      ctx.scope.init();
      ctx.scope.$digest();

      ctx.panelCtrl.refresh = sinon.spy();
      ctx.scope.target.target = '';
      ctx.scope.targetChanged();
    });

    it('should rebuld target after expression model', function() {
      expect(ctx.scope.target.target).to.be('aliasByNode(scaleToSeconds(test.prod.*, 1), 2)');
    });

    it('should call panelCtrl.refresh', function() {
      expect(ctx.panelCtrl.refresh.called).to.be(true);
    });
  });
});
