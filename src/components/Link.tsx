import React, { useContext, useEffect, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { routerStore } from "../core/store";
import { usePathname } from "../hooks/usePathname";
import { prefetchLoader } from "../utils/prefetch";
import { PrefetchContext } from "./Router";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  children: ReactNode;
  /**
   * Prefetch the target route's loader before navigation.
   * - "hover"  → warm the cache when user hovers this link
   * - "render" → warm the cache as soon as this link renders
   * - "none"   → no prefetch (default)
   */
  prefetch?: "hover" | "render" | "none";
};

export function Link({ to, replace: useReplace = false, children, onClick, prefetch = "none", ...rest }: LinkProps) {
  const isExternal = /^https?:\/\//.test(to);
  const flatRoutes = useContext(PrefetchContext);

  function triggerPrefetch() {
    if (prefetch === "none" || isExternal) return;
    const route = flatRoutes.find((r) => r.path === to);
    if (!route?.loader) return;
    void prefetchLoader(to, route.loader, { params: {}, searchParams: new URLSearchParams() }, route.staleTime ?? 0);
  }

  useEffect(() => {
    if (prefetch === "render") triggerPrefetch();
  }, [to, prefetch]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || isExternal) return;
    e.preventDefault();
    useReplace ? void routerStore.replace(to) : void routerStore.push(to);
  }

  return (
    <a href={to} onClick={handleClick} onMouseEnter={prefetch === "hover" ? triggerPrefetch : undefined} {...rest}>
      {children}
    </a>
  );
}

type NavLinkProps = LinkProps & {
  activeClassName?: string;
  activeStyle?: React.CSSProperties;
  exact?: boolean;
};

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
