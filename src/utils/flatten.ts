import type { FlatRoute, GuardFn, RouteConfig, VortexrErrorFallback, VortexrLayout } from "../types";

/**
 * Recursively flattens a nested route tree into a flat array.
 *
 * Inheritance rules:
 *   path        → child prepends parent path
 *   layouts     → child accumulates parent layouts (outside → in)
 *   guards      → child inherits parent guards (parent runs first)
 *   redirectTo  → child inherits unless it defines its own
 *   errorFallback → child inherits unless it defines its own
 *   loader      → NOT inherited (each route owns its own data)
 *   meta        → NOT inherited
 *   staleTime   → NOT inherited
 *   prefetch    → NOT inherited
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
      staleTime: route.staleTime,
      meta: route.meta,
      prefetch: route.prefetch,
      action: route.action,
    });

    if (route.children?.length) {
      result.push(...flattenRoutes(route.children, fullPath, layouts, guards, redirectTo, errorFallback));
    }
  }

  return result;
}
