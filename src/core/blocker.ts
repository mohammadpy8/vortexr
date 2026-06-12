import type { BlockerFn } from "../types";

const blockers = new Map<string, BlockerFn>();

export function runBlockers(
  nextPath: string,
  currentPath: string,
): { allowed: true } | { allowed: false; message: string } {
  for (const [, fn] of blockers) {
    const result = fn({ nextPath, currentPath });
    if (result === true) continue;
    if (result === false) {
      return { allowed: false, message: "You have unsaved changes. Are you sure you want to leave?" };
    }
    if (typeof result === "string") {
      return { allowed: false, message: result };
    }
  }
  return { allowed: true };
}

export function registerBlocker(id: string, fn: BlockerFn): void {
  blockers.set(id, fn);
}

export function unregisterBlocker(id: string): void {
  blockers.delete(id);
}
