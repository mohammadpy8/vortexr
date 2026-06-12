import type { ReactNode } from "react";
import type { VortexrComponent, VortexrLayout } from "./component";
import type { GuardFn } from "./guard";
import type { LoaderFn } from "./loader";
import type { RouteMeta } from "./meta";
import type { VortexrErrorFallback } from "./error";
import type { ActionFn } from "./action";

export type RouteConfig = {
  path: string;
  component: VortexrComponent;
  layout?: VortexrLayout;
  children?: RouteConfig[];

  guard?: GuardFn;
  guards?: GuardFn[];
  redirectTo?: string;
  guardFallback?: VortexrComponent;

  errorFallback?: VortexrErrorFallback;

  loader?: LoaderFn;
  /** Cache duration in ms. 0 = no cache (default). */
  staleTime?: number;

  meta?: RouteMeta;

  /** "hover" | "render" | "none" */
  prefetch?: "hover" | "render" | "none";

  /**
   * Handles form submissions for this route.
   * Return data → accessible via useActionData()
   * Return string → redirect to that path
   */
  action?: ActionFn;
};

export type FlatRoute = {
  path: string;
  component: VortexrComponent;
  layouts: VortexrLayout[];
  guards: GuardFn[];
  redirectTo: string;
  guardFallback?: VortexrComponent;
  errorFallback?: VortexrErrorFallback;
  loader?: LoaderFn;
  staleTime?: number;
  meta?: RouteMeta;
  prefetch?: "hover" | "render" | "none";
  action?: ActionFn;
};

export type OutletContextValue = {
  outlet: ReactNode | null;
};
