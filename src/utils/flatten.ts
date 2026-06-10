import type { FlatRoute, GuardFn, RouteConfig, VortexrErrorFallback, VortexrLayout } from "../types";

/**
 * Recursively flattens a nested route tree into a flat array.
 *
 * Each entry in the result has:
 * - Full absolute path
 * - Accumulated layout chain (outside → in)
 * - Accumulated guard chain (parent guards run first)
 * - Inherited redirectTo and errorFallback
 */
export function flattenRoutes(
  routes: RouteConfig[],
  parentPath = "",
  parentLayouts: VortexrLayout[] = [],
  parentGuards: GuardFn[] = [],
  parentRedirectTo = "/",
  parentErrorFallback?: VortexrErrorFallback,
): FlatRoute[] {
  const result: FlatRoute[] = [];

  for (const route of routes) {
    const fullPath = `${parentPath}${route.path}`.replace(/\/\//g, "/");

    const layouts = route.layout ? [...parentLayouts, route.layout] : [...parentLayouts];

    const routeGuards: GuardFn[] = [...(route.guard ? [route.guard] : []), ...(route.guards ?? [])];
    const guards = [...parentGuards, ...routeGuards];

    const redirectTo = route.redirectTo ?? parentRedirectTo;
    const errorFallback = route.errorFallback ?? parentErrorFallback;

    result.push({
      path: fullPath,
      component: route.component,
      layouts,
      guards,
      redirectTo,
      guardFallback: route.guardFallback,
      errorFallback,
      loader: route.loader,
      meta: route.meta,
    });

    if (route.children?.length) {
      result.push(...flattenRoutes(route.children, fullPath, layouts, guards, redirectTo, errorFallback));
    }
  }

  return result;
}
