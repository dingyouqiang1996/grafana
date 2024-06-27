// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     TSTypesJenny
//     LatestMajorsOrXJenny
//
// Run 'make gen-cue' from repository root to regenerate.

export interface QueryHistoryPreference {
  /**
   * one of: '' | 'query' | 'starred';
   */
  homeTab?: string;
}

export interface CookiePreferences {
  analytics?: Record<string, unknown>;
  functional?: Record<string, unknown>;
  performance?: Record<string, unknown>;
}

export interface NavbarPreference {
  savedItems: Array<PreferenceNavLink>;
}

export const defaultNavbarPreference: Partial<NavbarPreference> = {
  savedItems: [],
};

export interface PreferenceNavLink {
  id: string;
  target: string;
  text: string;
  url: string;
}

/**
 * Spec defines user, team or org Grafana preferences
 * swagger:model Preferences
 */
export interface Preferences {
  /**
   * Cookie preferences
   */
  cookiePreferences?: CookiePreferences;
  /**
   * UID for the home dashboard
   */
  homeDashboardUID?: string;
  /**
   * Selected language (beta)
   */
  language?: string;
  /**
   * Navigation preferences
   */
  navbar?: NavbarPreference;
  /**
   * Explore query history preferences
   */
  queryHistory?: QueryHistoryPreference;
  /**
   * light, dark, empty is default
   */
  theme?: string;
  /**
   * The timezone selection
   * TODO: this should use the timezone defined in common
   */
  timezone?: string;
  /**
   * day of the week (sunday, monday, etc)
   */
  weekStart?: string;
}
