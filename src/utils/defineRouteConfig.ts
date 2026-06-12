import type { RouteConfig } from "../types";

/**
 * Type-safe helper for defining your route config.
 * Provides full TypeScript inference and autocomplete.
 *
 * @example
 * const routes = defineRouteConfig([
 *   { path: "/", component: HomePage },
 *   {
 *     path: "/dashboard",
 *     component: lazyRoute(() => import("./pages/Dashboard")),
 *     layout: DashboardLayout,
 *     guard: isAuthenticated,
 *     staleTime: 30_000,
 *   },
 * ]);
 */
export function defineRouteConfig(routes: RouteConfig[]): RouteConfig[] {
  return routes;
}
