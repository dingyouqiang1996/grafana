import { PanelQueryRunner } from './PanelQueryRunner';
import { PanelData, DataQueryRequest } from '@grafana/ui/src/types';
import moment from 'moment';

interface ScenarioContext {
  setup: (fn: () => void) => void;
  maxDataPoints?: number | null;
  widthPixels: number;
  dsInterval?: string;
  minInterval?: string;
  events?: PanelData[];
  res?: PanelData;
  queryCalledWith?: DataQueryRequest;
}

type ScenarioFn = (ctx: ScenarioContext) => void;

function describeQueryRunnerScenario(description: string, scenarioFn: ScenarioFn) {
  describe(description, () => {
    let setupFn = () => {};

    const ctx: ScenarioContext = {
      widthPixels: 200,
      setup: (fn: () => void) => {
        setupFn = fn;
      },
    };

    let runner: PanelQueryRunner;
    const response: any = {
      data: [{ target: 'hello', datapoints: [] }],
    };

    beforeEach(async () => {
      setupFn();

      const datasource: any = {
        interval: ctx.dsInterval,
        query: (options: DataQueryRequest) => {
          ctx.queryCalledWith = options;
          return Promise.resolve(response);
        },
        testDatasource: jest.fn(),
      };

      const args: any = {
        datasource,
        minInterval: ctx.minInterval,
        widthPixels: ctx.widthPixels,
        maxDataPoints: ctx.maxDataPoints,
        timeRange: {
          from: moment().subtract(1, 'days'),
          to: moment(),
          raw: { from: '1h', to: 'now' },
        },
        panelId: 0,
        queries: [{ refId: 'A', test: 1 }],
      };

      runner = new PanelQueryRunner();
      runner.subscribe({
        next: (data: PanelData) => {
          ctx.events.push(data);
        },
      });

      ctx.events = [];
      ctx.res = await runner.run(args);
    });

    scenarioFn(ctx);
  });
}

describe('PanelQueryRunner', () => {
  describeQueryRunnerScenario('with no maxDataPoints or minInterval', ctx => {
    ctx.setup(() => {
      ctx.maxDataPoints = null;
      ctx.widthPixels = 200;
    });

    it('should return data', async () => {
      expect(ctx.res.error).toBeUndefined();
      expect(ctx.res.series.length).toBe(1);
    });

    it('should use widthPixels as maxDataPoints', async () => {
      expect(ctx.queryCalledWith.maxDataPoints).toBe(200);
    });

    it('should calculate interval based on width', async () => {
      expect(ctx.queryCalledWith.interval).toBe('5m');
    });

    it('fast query should only publish 1 data events', async () => {
      expect(ctx.events.length).toBe(1);
    });
  });

  describeQueryRunnerScenario('with no panel min interval but datasource min interval', ctx => {
    ctx.setup(() => {
      ctx.widthPixels = 20000;
      ctx.dsInterval = '15s';
    });

    it('should limit interval to data source min interval', async () => {
      expect(ctx.queryCalledWith.interval).toBe('15s');
    });
  });

  describeQueryRunnerScenario('with panel min interval and data source min interval', ctx => {
    ctx.setup(() => {
      ctx.widthPixels = 20000;
      ctx.dsInterval = '15s';
      ctx.minInterval = '30s';
    });

    it('should limit interval to panel min interval', async () => {
      expect(ctx.queryCalledWith.interval).toBe('30s');
    });
  });

  describeQueryRunnerScenario('with maxDataPoints', ctx => {
    ctx.setup(() => {
      ctx.maxDataPoints = 10;
    });

    it('should pass maxDataPoints if specified', async () => {
      expect(ctx.queryCalledWith.maxDataPoints).toBe(10);
    });
  });
});
