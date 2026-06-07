import type { GuardFn, GuardResult } from "../types";

/**
 * Runs a chain of guard functions in sequence.
 *
 * - Stops at the first failing guard (short-circuit)
 * - Each guard can return:
 *     true          → pass, continue to next guard
 *     false         → fail, redirect to `defaultRedirectTo`
 *     "/some/path"  → fail, redirect to that specific path
 *
 * @param guards          Array of guard functions to run
 * @param defaultRedirectTo  Fallback redirect path if a guard returns false
 */
export async function runGuards(guards: GuardFn[], defaultRedirectTo: string): Promise<GuardResult> {
  for (const guard of guards) {
    const result = await guard();

    if (result === true) continue;

    if (result === false) {
      return { allowed: false, redirectTo: defaultRedirectTo };
    }

    if (typeof result === "string") {
      return { allowed: false, redirectTo: result };
    }
  }

  return { allowed: true };
}
