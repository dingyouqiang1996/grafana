import { PanelModel } from './PanelModel';
import { getPanelPlugin } from '../../plugins/__mocks__/pluginMocks';

class TablePanelCtrl {}

describe('PanelModel', () => {
  describe('when creating new panel model', () => {
    let model;
    let modelJson;

    beforeEach(() => {
      modelJson = {
        type: 'table',
        showColumns: true,
        targets: [{ refId: 'A' }, { noRefId: true }],
        options: {
          fieldOptions: {
            thresholds: [
              {
                color: '#F2495C',
                index: 1,
                value: 50,
              },
              {
                color: '#73BF69',
                index: 0,
                value: null,
              },
            ],
          },
        },
      };
      model = new PanelModel(modelJson);
      model.pluginLoaded(
        getPanelPlugin(
          {
            id: 'table',
          },
          null, // react
          TablePanelCtrl // angular
        )
      );
    });

    it('should apply defaults', () => {
      expect(model.gridPos.h).toBe(3);
    });

    it('should set model props on instance', () => {
      expect(model.showColumns).toBe(true);
    });

    it('should add missing refIds', () => {
      expect(model.targets[1].refId).toBe('B');
    });

    it("shouldn't break panel with non-array targets", () => {
      modelJson.targets = {
        0: { refId: 'A' },
        foo: { bar: 'baz' },
      };
      model = new PanelModel(modelJson);
      expect(model.targets[0].refId).toBe('A');
    });

    it('getSaveModel should remove defaults', () => {
      const saveModel = model.getSaveModel();
      expect(saveModel.gridPos).toBe(undefined);
    });

    it('getSaveModel should remove nonPersistedProperties', () => {
      const saveModel = model.getSaveModel();
      expect(saveModel.events).toBe(undefined);
    });

    describe('when changing panel type', () => {
      beforeEach(() => {
        model.changePlugin(getPanelPlugin({ id: 'graph' }));
        model.alert = { id: 2 };
      });

      it('should remove table properties but keep core props', () => {
        expect(model.showColumns).toBe(undefined);
      });

      it('should restore table properties when changing back', () => {
        model.changePlugin(getPanelPlugin({ id: 'table' }));
        expect(model.showColumns).toBe(true);
      });

      it('should remove alert rule when changing type that does not support it', () => {
        model.changePlugin(getPanelPlugin({ id: 'table' }));
        expect(model.alert).toBe(undefined);
      });

      it('panelQueryRunner should be cleared', () => {
        const panelQueryRunner = (model as any).queryRunner;
        expect(panelQueryRunner).toBeFalsy();
      });
    });

    describe('when changing from angular panel', () => {
      let tearDownPublished = false;

      beforeEach(() => {
        model.events.on('panel-teardown', () => {
          tearDownPublished = true;
        });
        model.changePlugin(getPanelPlugin({ id: 'graph' }));
      });

      it('should teardown / destroy panel so angular panels event subscriptions are removed', () => {
        expect(tearDownPublished).toBe(true);
        expect(model.events.getEventCount()).toBe(0);
      });
    });

    describe('when changing to react panel from angular panel', () => {
      let panelQueryRunner: any;

      const onPanelTypeChanged = jest.fn();
      const reactPlugin = getPanelPlugin({ id: 'react' }).setPanelChangeHandler(onPanelTypeChanged as any);

      beforeEach(() => {
        model.changePlugin(reactPlugin);
        panelQueryRunner = model.getQueryRunner();
      });

      it('should call react onPanelTypeChanged', () => {
        expect(onPanelTypeChanged.mock.calls.length).toBe(1);
        expect(onPanelTypeChanged.mock.calls[0][1]).toBe('table');
        expect(onPanelTypeChanged.mock.calls[0][2].fieldOptions.thresholds).toBeDefined();
      });

      it('getQueryRunner() should return same instance after changing to another react panel', () => {
        model.changePlugin(getPanelPlugin({ id: 'react2' }));
        const sameQueryRunner = model.getQueryRunner();
        expect(panelQueryRunner).toBe(sameQueryRunner);
      });
    });

    describe('get panel options', () => {
      it('should apply defaults', () => {
        model.options = { existingProp: 10 };
        const options = model.getOptions({
          defaultProp: true,
          existingProp: 0,
        });

        expect(options.defaultProp).toBe(true);
        expect(options.existingProp).toBe(10);
        expect(model.options).toBe(options);
      });
    });
  });
});
