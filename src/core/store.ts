import type { Listener } from "../types";

type ScrollBehavior = "top" | "restore" | "none";

let scrollBehavior: ScrollBehavior = "top";

const scrollHistory = new Map<string, { x: number; y: number }>();

function buildScrollKey(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function saveScroll(): void {
  scrollHistory.set(buildScrollKey(), {
    x: window.scrollX,
    y: window.scrollY,
  });
}

function restoreScroll(path: string, behavior: ScrollBehavior): void {
  if (behavior === "none") return;

  if (behavior === "restore") {
    const saved = scrollHistory.get(path);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(saved.x, saved.y));
      return;
    }
  }

  requestAnimationFrame(() => window.scrollTo(0, 0));
}

const listeners = new Set<Listener>();

function notify(path: string): void {
  listeners.forEach((fn) => fn(path));
}

/**
 * Core router store.
 * Wraps the History API and notifies all subscribers on navigation.
 */
export const routerStore = {
  getPath(): string {
    return window.location.pathname;
  },

  push(path: string): void {
    if (path === this.getPath()) return;
    saveScroll();
    window.history.pushState(null, "", path);
    notify(path);
    restoreScroll(path, scrollBehavior);
  },

  replace(path: string): void {
    saveScroll();
    window.history.replaceState(null, "", path);
    notify(path);
    restoreScroll(path, scrollBehavior);
  },

  back(): void {
    window.history.back();
  },

  forward(): void {
    window.history.forward();
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /**
   * Configure scroll behavior.
   *
   * - `"top"`     → always scroll to top on navigate (default)
   * - `"restore"` → restore previous scroll position on back/forward
   * - `"none"`    → do nothing
   */
  setScrollBehavior(behavior: ScrollBehavior): void {
    scrollBehavior = behavior;
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    notify(path);
    restoreScroll(path, scrollBehavior);
  });
}
