import type { ComponentType, ReactNode } from "react";
import type { FlatRoute, GuardFn, RouteConfig } from "../types";

/**
 * Recursively flattens a nested route tree into a flat array.
 *
 * - Child routes inherit parent path prefix
 * - Child routes accumulate parent layouts (outside → in)
 * - Child routes inherit parent guards (all must pass)
 * - Child routes inherit parent redirectTo (unless overridden)
 */
export function flattenRoutes(
  routes: RouteConfig[],
  parentPath = "",
  parentLayouts: ComponentType<{ children: ReactNode }>[] = [],
  parentGuards: GuardFn[] = [],
  parentRedirectTo = "/",
): FlatRoute[] {
  const result: FlatRoute[] = [];

  for (const route of routes) {
    const fullPath = `${parentPath}${route.path}`.replace(/\/\//g, "/");

    const layouts = route.layout ? [...parentLayouts, route.layout] : [...parentLayouts];

    const routeGuards: GuardFn[] = [...(route.guard ? [route.guard] : []), ...(route.guards ?? [])];
    const guards = [...parentGuards, ...routeGuards];

    const redirectTo = route.redirectTo ?? parentRedirectTo;

    result.push({
      path: fullPath,
      component: route.component,
      layouts,
      guards,
      redirectTo,
      guardFallback: route.guardFallback,
    });

    if (route.children?.length) {
      result.push(...flattenRoutes(route.children, fullPath, layouts, guards, redirectTo));
    }
  }

  return result;
}
