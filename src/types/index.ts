import type { ComponentType, ReactNode } from "react";

/**
 * A guard function. Can be sync or async.
 * Return `true`  → allow navigation
 * Return `false` → deny and redirect to `redirectTo`
 * Return `string`→ deny and redirect to that specific path
 */
export type GuardFn = () => boolean | string | Promise<boolean | string>;

/**
 * Result after running the guard chain.
 */
export type GuardResult = { allowed: true } | { allowed: false; redirectTo: string };

export type RouteConfig = {
  /** The path pattern. Supports dynamic segments: /users/:id */
  path: string;

  /** The page component to render when this route matches */
  component: () => JSX.Element;

  /**
   * Optional layout component wrapping the page.
   * Receives `children` (the page) as a prop.
   */
  layout?: ({ children }: { children: ReactNode }) => JSX.Element;

  /**
   * Nested child routes.
   * They inherit the parent path prefix and layout chain automatically.
   *
   * @example
   * {
   *   path: "/dashboard",
   *   component: DashboardPage,
   *   layout: DashboardLayout,
   *   children: [
   *     { path: "/settings", component: SettingsPage },
   *   ]
   * }
   */
  children?: RouteConfig[];

  /**
   * A single guard function OR an array forming a middleware chain.
   * All guards must pass (return true) for the route to render.
   * Any guard can return a redirect path string instead of false.
   *
   * @example
   * // Single guard
   * guard: () => isLoggedIn()
   *
   * // Middleware chain — all must pass
   * guards: [isAuthenticated, isVerified, hasRole("admin")]
   */
  guard?: GuardFn;
  guards?: GuardFn[];

  /**
   * Where to redirect if a guard fails.
   * Can be overridden by returning a string from the guard itself.
   * Defaults to "/"
   */
  redirectTo?: string;

  /**
   * Optional loading component shown while async guards are resolving.
   * Defaults to null (nothing shown during async guard evaluation).
   */
  guardFallback?: () => JSX.Element;
};

export type MatchResult = {
  matched: boolean;
  params: Record<string, string>;
};

export type FlatRoute = {
  path: string;
  component: () => JSX.Element;
  layouts: (({ children }: { children: ReactNode }) => JSX.Element)[];
  guards: GuardFn[];
  redirectTo: string;
  guardFallback?: () => JSX.Element;
};

export type RouterContextValue = {
  pathname: string;
  params: Record<string, string>;
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
};

export type Listener = (path: string) => void;
