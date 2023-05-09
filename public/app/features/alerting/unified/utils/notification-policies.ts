import { cloneDeep } from 'lodash';

import { AlertmanagerGroup, Route, RouteWithID } from 'app/plugins/datasource/alertmanager/types';

import { Label, normalizeMatchers, labelsMatchObjectMatchers } from './matchers';

// Match does a depth-first left-to-right search through the route tree
// and returns the matching routing nodes.
function findMatchingRoutes<T extends Route>(root: T, labels: Label[]): T[] {
  let matches: T[] = [];

  // If the current node is not a match, return nothing
  // const normalizedMatchers = normalizeMatchers(root);
  // Normalization should have happened earlier in the code
  if (!root.object_matchers || !labelsMatchObjectMatchers(root.object_matchers, labels)) {
    return [];
  }

  // If the current node matches, recurse through child nodes
  if (root.routes) {
    for (let index = 0; index < root.routes.length; index++) {
      let child = root.routes[index];
      let matchingChildren = findMatchingRoutes(child, labels);

      // TODO how do I solve this typescript thingy? It looks correct to me /shrug
      // @ts-ignore
      matches = matches.concat(matchingChildren);

      // we have matching children and we don't want to continue, so break here
      if (matchingChildren.length && !child.continue) {
        break;
      }
    }
  }

  // If no child nodes were matches, the current node itself is a match.
  if (matches.length === 0) {
    matches.push(root);
  }

  return matches;
}

export type NormalizedRoute = Omit<RouteWithID, 'matchers' | 'match' | 'match_re'> & { routes?: NormalizedRoute[] };

// This is a performance improvement to normalize matchers only once and use the normalized version later on
export function normalizeRootRoute(rootRoute: RouteWithID): NormalizedRoute {
  function normalizeRoute(route: RouteWithID) {
    route.object_matchers = normalizeMatchers(route);
    delete route.matchers;
    delete route.match;
    delete route.match_re;
    route.routes?.forEach(normalizeRoute);
  }

  const normalizedRootRoute = cloneDeep(rootRoute);
  normalizeRoute(normalizedRootRoute);

  return normalizedRootRoute;
}

/**
 * find all of the groups that have instances that match the route, thay way we can find all instances
 * (and their grouping) for the given route
 */
function findMatchingAlertGroups(
  routeTree: Route,
  route: Route,
  alertGroups: AlertmanagerGroup[]
): AlertmanagerGroup[] {
  const matchingGroups: AlertmanagerGroup[] = [];

  return alertGroups.reduce((acc, group) => {
    // find matching alerts in the current group
    const matchingAlerts = group.alerts.filter((alert) => {
      const labels = Object.entries(alert.labels);
      return findMatchingRoutes(routeTree, labels).some((matchingRoute) => matchingRoute === route);
    });

    // if the groups has any alerts left after matching, add it to the results
    if (matchingAlerts.length) {
      acc.push({
        ...group,
        alerts: matchingAlerts,
      });
    }

    return acc;
  }, matchingGroups);
}

export { findMatchingAlertGroups, findMatchingRoutes };
