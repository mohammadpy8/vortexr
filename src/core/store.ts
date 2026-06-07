import type { Listener } from "../types";

const listeners = new Set<Listener>();

function notify(path: string) {
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
    window.history.pushState(null, "", path);
    notify(path);
  },

  replace(path: string): void {
    window.history.replaceState(null, "", path);
    notify(path);
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
};

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    notify(window.location.pathname);
  });
}
