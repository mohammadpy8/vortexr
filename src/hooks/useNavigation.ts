import { useNavigationContext } from "../core/navigation";
import type { NavigationState } from "../types";

/**
 * Returns the current navigation state.
 *
 * - `"idle"`    → nothing in progress
 * - `"loading"` → navigation, loader, or lazy component is resolving
 *
 * @example
 * const { state } = useNavigation();
 * if (state === "loading") return <Spinner />;
 */
export function useNavigation(): { state: NavigationState } {
  return useNavigationContext();
}
