import { useCallback } from "react";
import { routerStore } from "../core/store";

/**
 * Returns router navigation methods with stable references.
 *
 * @example
 * const { push, replace, back, forward } = useRouter();
 * push("/dashboard");
 */
export function useRouter() {
  const push = useCallback((path: string) => routerStore.push(path), []);
  const replace = useCallback((path: string) => routerStore.replace(path), []);
  const back = useCallback(() => routerStore.back(), []);
  const forward = useCallback(() => routerStore.forward(), []);

  return { push, replace, back, forward };
}
