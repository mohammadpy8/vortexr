import React, {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { RouterContext } from "../core/context";
import { routerStore } from "../core/store";
import { matchPath } from "../utils/matcher";
import { flattenRoutes } from "../utils/flatten";
import { usePathname } from "../hooks";
import type { RouteConfig } from "../types";


type RouterProps = {
  routes: RouteConfig[];
  notFound?: React.ComponentType;
};

/**
 * The root router. Matches the current path against your route config
 * and renders the correct page, wrapped in its layout chain.
 *
 * Supports nested routes and multiple stacked layouts.
 *
 * @example
 * <Router routes={routes} notFound={MyNotFoundPage} />
 */
export function Router({ routes, notFound: NotFound = DefaultNotFound }: RouterProps) {
  const pathname = usePathname();
  const flat = flattenRoutes(routes);

  for (const route of flat) {
    const { matched, params } = matchPath(route.path, pathname);

    if (matched) {
      const Page = route.component;

      const wrapped = route.layouts.reduceRight<ReactNode>(
        (children, Layout) => <Layout>{children}</Layout>,
        <Page />
      );

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
          {wrapped}
        </RouterContext.Provider>
      );
    }
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
 * Falls back to a normal `<a>` for external URLs.
 *
 * @example
 * <Link to="/dashboard">Go to Dashboard</Link>
 * <Link to="/settings" replace>Replace current</Link>
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
 * Like `<Link>` but automatically applies an active class/style when
 * the current path matches.
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
 * Imperatively navigates when rendered. Useful for redirects.
 *
 * @example
 * if (!isLoggedIn) return <Navigate to="/login" />;
 */
export function Navigate({ to, replace: useReplace = false }: NavigateProps) {
  React.useEffect(() => {
    useReplace ? routerStore.replace(to) : routerStore.push(to);
  }, [to, useReplace]);

  return null;
}


function DefaultNotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
      <p style={{ color: "#666" }}>This page doesn't exist — yet.</p>
      <a href="/" style={{ color: "#0070f3" }}>← Go Home</a>
    </div>
  );
}
