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
 *     component: DashboardPage,
 *     layout: DashboardLayout,
 *     guard: isAuthenticated,
 *     children: [
 *       { path: "/settings", component: SettingsPage },
 *     ],
 *   },
 * ]);
 */
export function defineRouteConfig(routes: RouteConfig[]): RouteConfig[] {
  return routes;
}
