import coreModule from 'app/core/core_module';

export class AlertSrv {
  constructor() {}

  set() {
    console.log('old deprecated alert srv being used');
  }
}

// this is just added to not break old plugins that might be using it
coreModule.service('alertSrv', AlertSrv);
