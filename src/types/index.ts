import type { ReactNode } from "react";

export type VortexrComponent = () => ReactNode;
export type VortexrLayout = (props: { children: ReactNode }) => ReactNode;

/**
 * A guard function. Can be sync or async.
 *
 * Return `true`   → allow, continue to next guard
 * Return `false`  → deny, redirect to route's `redirectTo`
 * Return `string` → deny, redirect to that specific path
 */
export type GuardFn = () => boolean | string | Promise<boolean | string>;
export type GuardResult = { allowed: true } | { allowed: false; redirectTo: string };

export type ErrorInfo = {
  error: Error;
  reset: () => void;
};

export type VortexrErrorFallback = (info: ErrorInfo) => ReactNode;

export type RouteConfig = {
  /** Path pattern. Supports :param and * wildcard. */
  path: string;

  /** Page component rendered when this route matches. */
  component: VortexrComponent;

  /** Optional layout wrapping the page. Must accept a `children` prop. */
  layout?: VortexrLayout;

  /** Nested child routes. Inherit parent path, layouts, and guards. */
  children?: RouteConfig[];

  /** Single guard function. */
  guard?: GuardFn;

  /** Guard middleware chain. All must pass. Runs after `guard` if both are set. */
  guards?: GuardFn[];

  /** Where to redirect if any guard fails. Defaults to "/" */
  redirectTo?: string;

  /** Component shown while async guards are resolving. */
  guardFallback?: VortexrComponent;

  /**
   * Custom error fallback for this route.
   * Overrides the Router-level errorFallback.
   */
  errorFallback?: VortexrErrorFallback;
};

export type MatchResult = {
  matched: boolean;
  params: Record<string, string>;
};

export type FlatRoute = {
  path: string;
  component: VortexrComponent;
  layouts: VortexrLayout[];
  guards: GuardFn[];
  redirectTo: string;
  guardFallback?: VortexrComponent;
  errorFallback?: VortexrErrorFallback;
};

export type RouterContextValue = {
  pathname: string;
  params: Record<string, string>;
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
};

export type OutletContextValue = {
  outlet: ReactNode | null;
};

export type Listener = (path: string) => void;
