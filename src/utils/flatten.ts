import type { ComponentType, ReactNode } from "react";
import type { FlatRoute, RouteConfig } from "../types";

/**
 * Recursively flattens a nested route tree into a flat array.
 * Child routes inherit parent path prefix and accumulate layouts top-down.
 *
 * @example
 * Input:
 * [
 *   {
 *     path: "/dashboard",
 *     layout: DashboardLayout,
 *     component: DashboardPage,
 *     children: [
 *       { path: "/settings", component: SettingsPage }
 *     ]
 *   }
 * ]
 *
 * Output:
 * [
 *   { path: "/dashboard",          layouts: [DashboardLayout], component: DashboardPage },
 *   { path: "/dashboard/settings", layouts: [DashboardLayout], component: SettingsPage  },
 * ]
 */
export function flattenRoutes(
  routes: RouteConfig[],
  parentPath = "",
  parentLayouts: ComponentType<{ children: ReactNode }>[] = []
): FlatRoute[] {
  const result: FlatRoute[] = [];

  for (const route of routes) {
    const fullPath = `${parentPath}${route.path}`.replace(/\/\//g, "/");
    const layouts = route.layout
      ? [...parentLayouts, route.layout]
      : [...parentLayouts];

    result.push({
      path: fullPath,
      component: route.component,
      layouts,
    });

    if (route.children?.length) {
      result.push(...flattenRoutes(route.children, fullPath, layouts));
    }
  }

  return result;
}
