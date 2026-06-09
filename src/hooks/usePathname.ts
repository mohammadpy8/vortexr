import { useEffect, useState } from "react";
import { routerStore } from "../core/store";

/**
 * Returns the current URL pathname.
 * Re-renders the component on every navigation.
 *
 * @example
 * const pathname = usePathname();
 * // → "/users/42"
 */
export function usePathname(): string {
  const [path, setPath] = useState<string>(routerStore.getPath);
  useEffect(() => routerStore.subscribe(setPath), []);
  return path;
}
