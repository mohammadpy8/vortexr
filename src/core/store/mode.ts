export type RouterMode = "history" | "hash";

let _mode: RouterMode = "history";

export function getMode(): RouterMode {
  return _mode;
}

export function setMode(mode: RouterMode): void {
  _mode = mode;
}

/**
 * Reads the current path from the browser URL,
 * based on the active mode.
 *
 * - "history" → window.location.pathname
 * - "hash"    → window.location.hash (without '#', defaults to "/")
 */
export function readPath(): string {
  if (_mode === "hash") {
    const hash = window.location.hash.slice(1);
    return hash || "/";
  }
  return window.location.pathname;
}

/**
 * Builds the URL to write to the browser, based on the active mode.
 *
 * - "history" → returns path as-is (basename applied by caller)
 * - "hash"    → returns current pathname unchanged, with `#path` appended
 */
export function buildUrl(path: string): string {
  if (_mode === "hash") {
    return `${window.location.pathname}${window.location.search}#${path}`;
  }
  return path;
}

/**
 * The browser event that signals a navigation change for the active mode.
 */
export function changeEventName(): "popstate" | "hashchange" {
  return _mode === "hash" ? "hashchange" : "popstate";
}
