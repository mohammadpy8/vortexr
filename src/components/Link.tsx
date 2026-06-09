import { type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { routerStore } from "../core/store";
import { usePathname } from "../hooks/usePathname";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  /** Use replaceState instead of pushState */
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
 * <Link to="https://github.com" target="_blank">GitHub</Link>
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

import type React from "react";

type NavLinkProps = LinkProps & {
  /** Class applied when this link's path matches the current URL */
  activeClassName?: string;
  /** Style applied when this link is active */
  activeStyle?: React.CSSProperties;
  /** Exact match only (default: true) */
  exact?: boolean;
};

/**
 * Like `<Link>`, but automatically applies an active class/style
 * when the current path matches.
 *
 * @example
 * <NavLink to="/dashboard" activeClassName="font-bold text-blue-500">
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
