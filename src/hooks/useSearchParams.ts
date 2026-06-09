import { useCallback, useEffect, useState } from "react";
import { routerStore } from "../core/store";

/**
 * Returns the current URL search params and a setter.
 * Reactive — re-renders on every navigation.
 *
 * @example
 * const [params, setParams] = useSearchParams();
 *
 * params.get("page");           // read  → "2"
 * setParams({ page: "3" });     // write → ?page=3
 */
export function useSearchParams(): [URLSearchParams, (params: Record<string, string>) => void] {
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
