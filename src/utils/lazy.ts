import { lazy, type ComponentType } from "react";
import type { VortexrComponent } from "../types";

/**
 * Wraps React.lazy to produce a VortexrComponent.
 *
 * Use this instead of React.lazy directly so the type system
 * stays compatible with RouteConfig.component.
 *
 * @example
 * const routes = defineRouteConfig([
 *   {
 *     path: "/dashboard",
 *     component: lazyRoute(() => import("./pages/Dashboard")),
 *   },
 * ]);
 */
export function lazyRoute(factory: () => Promise<{ default: ComponentType }>): VortexrComponent {
  const Lazy = lazy(factory);
  // Cast: Lazy accepts no props, returns ReactNode — compatible with VortexrComponent
  return Lazy as unknown as VortexrComponent;
}
