import React, { useEffect, useState, type ReactNode } from "react";
import { RouterContext } from "../core/context";
import { OutletContext } from "../core/outlet";
import { routerStore } from "../core/store";
import { matchPath } from "../utils/matcher";
import { flattenRoutes } from "../utils/flatten";
import { runGuards } from "../utils/guards";
import { usePathname } from "../hooks/usePathname";
import { RouteErrorBoundary } from "./ErrorBoundary";
import type {
  FlatRoute,
  GuardResult,
  RouteConfig,
  VortexrComponent,
  VortexrLayout,
  VortexrErrorFallback,
} from "../types";

type GuardedRouteProps = {
  route: FlatRoute;
  children: ReactNode;
};

function GuardedRoute({ route, children }: GuardedRouteProps) {
  const [status, setStatus] = useState<"pending" | "allowed" | "denied">(
    route.guards.length === 0 ? "allowed" : "pending",
  );

  useEffect(() => {
    if (route.guards.length === 0) {
      setStatus("allowed");
      return;
    }

    let cancelled = false;

    runGuards(route.guards, route.redirectTo).then((result: GuardResult) => {
      if (cancelled) return;
      if (result.allowed) {
        setStatus("allowed");
      } else {
        setStatus("denied");
        routerStore.replace(result.redirectTo);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [route.path]);

  if (status === "pending") {
    const Fallback = route.guardFallback;
    return Fallback ? (Fallback() as React.ReactElement) : null;
  }

  if (status === "denied") return null;

  return <>{children}</>;
}

type RouterProps = {
  routes: RouteConfig[];
  /** Custom 404 component. Defaults to built-in screen. */
  notFound?: VortexrComponent;
  /**
   * Global error fallback for any route that crashes.
   * Can be overridden per-route via `errorFallback` in RouteConfig.
   *
   * @example
   * <Router
   *   routes={routes}
   *   errorFallback={({ error, reset }) => (
   *     <div>
   *       <p>{error.message}</p>
   *       <button onClick={reset}>Retry</button>
   *     </div>
   *   )}
   * />
   */
  errorFallback?: VortexrErrorFallback;
};

/**
 * The root router.
 *
 * Matches the current URL → runs guard chain → wraps in layout chain →
 * provides RouterContext → catches render errors via ErrorBoundary.
 */
export function Router({ routes, notFound: NotFound = DefaultNotFound, errorFallback }: RouterProps) {
  const pathname = usePathname();
  const flat = flattenRoutes(routes);

  for (const route of flat) {
    const { matched, params } = matchPath(route.path, pathname);
    if (!matched) continue;

    const Page = route.component;

    /**
     * Outlet-aware layout wrapping.
     *
     * Each layout receives the next inner layout (or the Page)
     * via OutletContext, so <Outlet /> inside any layout renders
     * the correct child automatically.
     *
     * Render order (outside → in):
     *   Layout[0]
     *     └── Layout[1]  (via <Outlet />)
     *           └── Page (via <Outlet />)
     */
    const wrapped = route.layouts.reduceRight<ReactNode>(
      (innerContent: ReactNode, Layout: VortexrLayout) => (
        <OutletContext.Provider value={{ outlet: innerContent }}>
          <Layout>{innerContent}</Layout>
        </OutletContext.Provider>
      ),
      <Page />,
    );

    const activeFallback = route.errorFallback ?? errorFallback;

    return (
      <RouterContext.Provider
        value={{
          pathname,
          params,
          push: routerStore.push.bind(routerStore),
          replace: routerStore.replace.bind(routerStore),
          back: routerStore.back.bind(routerStore),
          forward: routerStore.forward.bind(routerStore),
        }}
      >
        <RouteErrorBoundary fallback={activeFallback} resetKey={pathname}>
          <GuardedRoute route={route}>{wrapped}</GuardedRoute>
        </RouteErrorBoundary>
      </RouterContext.Provider>
    );
  }

  return (<NotFound />) as React.ReactElement;
}

function DefaultNotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "2rem",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: "5rem", margin: 0, fontWeight: 800, color: "#111" }}>404</h1>
      <p style={{ color: "#666", fontSize: "1.1rem", margin: 0 }}>This page doesn't exist — yet.</p>
      <a
        href="/"
        style={{
          marginTop: "0.5rem",
          padding: "0.5rem 1.25rem",
          background: "#0070f3",
          color: "#fff",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "0.9rem",
          textDecoration: "none",
        }}
      >
        ← Go Home
      </a>
    </div>
  );
}
