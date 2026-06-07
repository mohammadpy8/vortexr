import React, { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { RouterContext } from "../core/context";
import { routerStore } from "../core/store";
import { matchPath } from "../utils/matcher";
import { flattenRoutes } from "../utils/flatten";
import { runGuards } from "../utils/guards";
import { usePathname } from "../hooks";
import type { FlatRoute, GuardResult, RouteConfig } from "../types";

type GuardedRouteProps = {
  route: FlatRoute;
  children: ReactNode;
};

/**
 * Internal component that runs the guard chain before rendering children.
 *
 * States:
 *   "pending"  → async guards are still resolving  → show guardFallback
 *   "allowed"  → all guards passed                 → render children
 *   "denied"   → a guard failed                    → redirect
 */
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
    return Fallback ? <Fallback /> : null;
  }

  if (status === "denied") return null;

  return <>{children}</>;
}

type RouterProps = {
  routes: RouteConfig[];
  /** Custom 404 component. Defaults to a minimal not-found screen. */
  notFound?: React.ComponentType;
};

/**
 * The root router. Matches the current path against your route config,
 * runs the guard chain, and renders the page wrapped in its layout chain.
 *
 * @example
 * <Router routes={routes} notFound={MyNotFoundPage} />
 */
export function Router({ routes, notFound: NotFound = DefaultNotFound }: RouterProps) {
  const pathname = usePathname();
  const flat = flattenRoutes(routes);

  for (const route of flat) {
    const { matched, params } = matchPath(route.path, pathname);

    if (!matched) continue;

    const Page = route.component;

    const wrapped = route.layouts.reduceRight<ReactNode>((children, Layout) => <Layout>{children}</Layout>, <Page />);

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
        <GuardedRoute route={route}>{wrapped}</GuardedRoute>
      </RouterContext.Provider>
    );
  }

  return <NotFound />;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  children: ReactNode;
};

/**
 * Client-side navigation link. No page refresh.
 * Falls back gracefully for external URLs (http/https).
 *
 * @example
 * <Link to="/dashboard">Dashboard</Link>
 * <Link to="/settings" replace>Settings</Link>
 */
export function Link({ to, replace: useReplace = false, children, onClick, ...rest }: LinkProps) {
  const isExternal = /^https?:\/\//.test(to);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || isExternal) return;
    e.preventDefault();
    useReplace ? routerStore.replace(to) : routerStore.push(to);
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

type NavLinkProps = LinkProps & {
  activeClassName?: string;
  activeStyle?: React.CSSProperties;
  exact?: boolean;
};

/**
 * Like `<Link>` but automatically applies an active class/style
 * when the current path matches.
 *
 * @example
 * <NavLink to="/dashboard" activeClassName="text-blue-500">
 *   Dashboard
 * </NavLink>
 */
export function NavLink({
  to,
  activeClassName = "active",
  activeStyle,
  exact = true,
  className,
  style,
  ...rest
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={[className, isActive ? activeClassName : ""].filter(Boolean).join(" ")}
      style={isActive ? { ...style, ...activeStyle } : style}
      {...rest}
    />
  );
}

type NavigateProps = {
  to: string;
  replace?: boolean;
};

/**
 * Navigates imperatively when rendered. Useful for declarative redirects.
 *
 * @example
 * if (!isLoggedIn) return <Navigate to="/login" />;
 */
export function Navigate({ to, replace: useReplace = false }: NavigateProps) {
  useEffect(() => {
    useReplace ? routerStore.replace(to) : routerStore.push(to);
  }, [to, useReplace]);

  return null;
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
        fontFamily: "sans-serif",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "6rem", margin: 0, fontWeight: 800, color: "#111" }}>404</h1>
      <p style={{ color: "#666", fontSize: "1.1rem" }}>This page doesn't exist — yet.</p>
      <a href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
        ← Go Home
      </a>
    </div>
  );
}
