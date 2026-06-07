import { useCallback, useEffect, useState } from "react";
import { routerStore } from "../core/store";
import { useRouterContext } from "../core/context";

// ─── usePathname ──────────────────────────────────────────────────────────────

/**
 * Returns the current URL pathname and re-renders on navigation.
 *
 * @example
 * const pathname = usePathname();
 * // → "/users/42"
 */
export function usePathname(): string {
  const [path, setPath] = useState<string>(routerStore.getPath);

  useEffect(() => {
    return routerStore.subscribe(setPath);
  }, []);

  return path;
}

// ─── useRouter ────────────────────────────────────────────────────────────────

/**
 * Returns router navigation methods.
 *
 * @example
 * const { push, replace, back } = useRouter();
 * push("/dashboard");
 */
export function useRouter() {
  const push = useCallback((path: string) => routerStore.push(path), []);
  const replace = useCallback((path: string) => routerStore.replace(path), []);
  const back = useCallback(() => routerStore.back(), []);
  const forward = useCallback(() => routerStore.forward(), []);

  return { push, replace, back, forward };
}

// ─── useParams ────────────────────────────────────────────────────────────────

/**
 * Returns the dynamic params extracted from the matched route.
 *
 * @example
 * // Route: /users/:id/posts/:postId
 * // URL:   /users/42/posts/7
 * const { id, postId } = useParams<{ id: string; postId: string }>();
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { params } = useRouterContext();
  return params as T;
}

// ─── useSearchParams ─────────────────────────────────────────────────────────

/**
 * Returns the current URL search params and a setter.
 *
 * @example
 * const [params, setParams] = useSearchParams();
 * params.get("q");           // read
 * setParams({ q: "react" }); // write → ?q=react
 */
export function useSearchParams(): [
  URLSearchParams,
  (params: Record<string, string>) => void
] {
  const [raw, setRaw] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    return routerStore.subscribe(() => {
      setRaw(new URLSearchParams(window.location.search));
    });
  }, []);

  const setParams = useCallback((params: Record<string, string>) => {
    const next = new URLSearchParams(params);
    const newUrl = `${window.location.pathname}?${next.toString()}`;
    routerStore.push(newUrl);
  }, []);

  return [raw, setParams];
}
