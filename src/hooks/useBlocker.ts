import { useEffect, useId } from "react";
import { registerBlocker, unregisterBlocker } from "../core/blocker";
import type { BlockerFn } from "../types";

/**
 * Blocks navigation when `when` is true.
 * Shows a confirmation dialog before allowing the user to leave.
 *
 * @example
 * // Simple boolean block
 * useBlocker({ when: isDirty });
 *
 * @example
 * // Custom message
 * useBlocker({
 *   when: isDirty,
 *   message: "Unsaved changes will be lost. Continue?",
 * });
 *
 * @example
 * // Full control — custom blocker function
 * useBlocker({
 *   when: isDirty,
 *   fn: ({ nextPath }) => {
 *     if (nextPath === "/save") return true; // always allow /save
 *     return "Leave without saving?";
 *   },
 * });
 */
export function useBlocker(options: { when: boolean; message?: string; fn?: BlockerFn }): void {
  const id = useId();
  const { when, message, fn } = options;

  useEffect(() => {
    if (!when) return;

    const blocker: BlockerFn = fn ?? (() => message ?? "You have unsaved changes. Are you sure you want to leave?");

    registerBlocker(id, blocker);
    return () => unregisterBlocker(id);
  }, [id, when, message, fn]);
}
