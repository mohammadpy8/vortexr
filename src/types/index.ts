import type { ComponentType, ReactNode } from "react";


export type RouteConfig = {
  /** The path pattern. Supports dynamic segments: /users/:id */
  path: string;

  /** The page component to render when this route matches */
  component: ComponentType;

  /**
   * Optional layout component wrapping the page.
   * Receives `children` (the page) as a prop.
   */
  layout?: ComponentType<{ children: ReactNode }>;

  /**
   * Nested child routes.
   * They inherit the parent path prefix automatically.
   *
   * @example
   * {
   *   path: "/dashboard",
   *   component: DashboardPage,
   *   layout: DashboardLayout,
   *   children: [
   *     { path: "/settings", component: SettingsPage },
   *     { path: "/profile",  component: ProfilePage  },
   *   ]
   * }
   */
  children?: RouteConfig[];
};

export type MatchResult = {
  matched: boolean;
  params: Record<string, string>;
};

export type FlatRoute = {
  path: string;
  component: ComponentType;
  layouts: ComponentType<{ children: ReactNode }>[];
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
