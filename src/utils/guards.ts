import type { GuardFn, GuardResult } from "../types";

/**
 * Runs a chain of guard functions in sequence.
 * Short-circuits on the first failure.
 */
export async function runGuards(guards: GuardFn[], defaultRedirectTo: string): Promise<GuardResult> {
  for (const guard of guards) {
    const result = await guard();

    if (result === true) continue;
    if (result === false) return { allowed: false, redirectTo: defaultRedirectTo };
    if (typeof result === "string") return { allowed: false, redirectTo: result };
  }

  return { allowed: true };
}
