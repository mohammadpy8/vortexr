import React, { useEffect, useState, type ReactNode } from "react";
import { RouterContext } from "../core/context";
import { OutletContext } from "../core/outlet";
import { routerStore } from "../core/store";
import { LoaderProvider } from "../core/loader";
import { NavigationContext } from "../core/navigation";
import { RouteMetaContext } from "../core/routeMeta";
import { matchPath } from "../utils/matcher";
import { flattenRoutes } from "../utils/flatten";
import { runGuards } from "../utils/guards";
import { usePathname } from "../hooks/usePathname";
import { RouteErrorBoundary } from "./ErrorBoundary";
import type {
  FlatRoute,
  GuardResult,
  LoaderArgs,
  NavigationState,
  RouteConfig,
  VortexrComponent,
  VortexrErrorFallback,
  VortexrLayout,
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

type LoadedRouteProps = {
  route: FlatRoute;
  params: Record<string, string>;
  children: ReactNode;
  onStateChange: (state: NavigationState) => void;
};

function LoadedRoute({ route, params, children, onStateChange }: LoadedRouteProps) {
  const [loaderData, setLoaderData] = useState<unknown>(undefined);
  const [ready, setReady] = useState(!route.loader);

  useEffect(() => {
    if (!route.loader) {
      setReady(true);
      setLoaderData(undefined);
      return;
    }

    let cancelled = false;
    onStateChange("loading");

    const args: LoaderArgs = {
      params,
      searchParams: new URLSearchParams(window.location.search),
    };

    Promise.resolve(route.loader(args))
      .then((data) => {
        if (cancelled) return;
        setLoaderData(data);
        setReady(true);
        onStateChange("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onStateChange("idle");
        throw err;
      });

    return () => {
      cancelled = true;
    };
  }, [route.path]);

  if (!ready) return null;

  return <LoaderProvider data={loaderData}>{children}</LoaderProvider>;
}

/**
 * Syncs document.title and meta description with the active route's meta.
 * Renders nothing — pure side effect.
 */
function MetaManager({ route }: { route: FlatRoute }) {
  useEffect(() => {
    const { meta } = route;
    if (!meta) return;

    if (meta.title && typeof meta.title === "string") {
      document.title = meta.title;
    }

    if (meta.description && typeof meta.description === "string") {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = meta.description;
    }
  }, [route.path, route.meta]);

  return null;
}

type RouterProps = {
  routes: RouteConfig[];
  /** Custom 404 component. Defaults to built-in screen. */
  notFound?: VortexrComponent;
  /**
   * Global error fallback. Can be overridden per-route.
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
  /**
   * Base path for apps deployed on a subdirectory.
   * Can also be set globally via routerStore.setBasename().
   *
   * @example
   * <Router routes={routes} basename="/my-app" />
   */
  basename?: string;
};

/**
 * The root router.
 *
 * Flow per navigation:
 *   match URL → run guards → run loader → set meta → wrap in layouts → render
 *
 * Provides:
 *   RouterContext     → pathname, params, push/replace/back/forward, basename
 *   NavigationContext → state: "idle" | "loading"
 *   LoaderProvider    → data from the route's loader
 *   RouteMetaContext  → meta object from the active route
 *   OutletContext     → nested layout rendering via <Outlet />
 *   ErrorBoundary     → catches render errors per route
 */
export function Router({ routes, notFound: NotFound = DefaultNotFound, errorFallback, basename }: RouterProps) {
  const pathname = usePathname();
  const flat = flattenRoutes(routes);
  const [navState, setNavState] = useState<NavigationState>("idle");

  useEffect(() => {
    if (basename !== undefined) {
      routerStore.setBasename(basename);
    }
  }, [basename]);

  const activeBasename = basename ?? routerStore.getBasename();

  for (const route of flat) {
    const { matched, params } = matchPath(route.path, pathname);
    if (!matched) continue;

    const Page = route.component;

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
      <NavigationContext.Provider value={{ state: navState }}>
        <RouterContext.Provider
          value={{
            pathname,
            params,
            push: routerStore.push.bind(routerStore),
            replace: routerStore.replace.bind(routerStore),
            back: routerStore.back.bind(routerStore),
            forward: routerStore.forward.bind(routerStore),
            basename: activeBasename,
          }}
        >
          <RouteMetaContext.Provider value={route.meta ?? {}}>
            <MetaManager route={route} />
            <RouteErrorBoundary fallback={activeFallback} resetKey={pathname}>
              <GuardedRoute route={route}>
                <LoadedRoute route={route} params={params} onStateChange={setNavState}>
                  {wrapped}
                </LoadedRoute>
              </GuardedRoute>
            </RouteErrorBoundary>
          </RouteMetaContext.Provider>
        </RouterContext.Provider>
      </NavigationContext.Provider>
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
