import { useNavigationContext } from "../core/navigation";
import type { NavigationState } from "../types";

/**
 * Returns the current navigation state.
 *
 * - `"idle"`    → nothing is happening
 * - `"loading"` → a navigation is in progress or a loader is running
 *
 * Use this to show global loading indicators.
 *
 * @example
 * function GlobalSpinner() {
 *   const { state } = useNavigation();
 *   if (state === "idle") return null;
 *   return <div className="spinner" />;
 * }
 */
export function useNavigation(): { state: NavigationState } {
  return useNavigationContext();
}
