import { BusEventBase, BusEventWithPayload, EventBus, GrafanaTheme2, PanelModel, TimeRange } from '@grafana/data';

export class RefreshEvent extends BusEventBase {
  static type = 'refresh';
}

export class ThemeChangedEvent extends BusEventWithPayload<GrafanaTheme2> {
  static type = 'theme-changed';
}

export class TimeRangeUpdatedEvent extends BusEventWithPayload<TimeRange> {
  static type = 'time-range-updated';
}

export class CopyPanelEvent extends BusEventWithPayload<PanelModel> {
  static type = 'copy-panel';
}

// Internal singleton instance
let singletonInstance: EventBus;

/**
 * Used during startup by Grafana to set the LocationSrv so it is available
 * via the {@link getLocationSrv} to the rest of the application.
 *
 * @internal
 */
export function setAppEvents(instance: EventBus) {
  singletonInstance = instance;
}

/**
 * Used to retrieve an event bus that manages application level events
 *
 * @public
 */
export function getAppEvents(): EventBus {
  return singletonInstance;
}
