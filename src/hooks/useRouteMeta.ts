import { useContext } from "react";
import { RouteMetaContext } from "../core/routeMeta";
import type { RouteMeta } from "../types";

/**
 * Returns the `meta` object from the currently active route.
 *
 * @example
 * const meta = useRouteMeta();
 * // → { title: "Dashboard", description: "..." }
 */
export function useRouteMeta(): RouteMeta {
  return useContext(RouteMetaContext);
}
