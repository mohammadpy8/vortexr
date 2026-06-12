import { notify, subscribe } from "./listeners";
import { saveScroll, restoreScroll, setScrollBehavior } from "./scroll";
import { getBasename, setBasename, withBasename, stripBasename } from "./basename";
import { runBlockers } from "../blocker";
import { runBeforeEach, runAfterEach, addBeforeEach, addAfterEach } from "../beforeEach";
import { getMode, setMode, readPath, buildUrl, changeEventName, type RouterMode } from "./mode";

export { subscribe } from "./listeners";
export type { ScrollBehavior } from "./scroll";
export type { RouterMode } from "./mode";

// Browser navigation listener
// Re-attaches when mode changes: "history" listens to popstate,
// "hash" listens to hashchange.

let detachListener: (() => void) | null = null;

function attachListener() {
  if (typeof window === "undefined") return;
  detachListener?.();

  const handler = () => {
    const path = getMode() === "hash" ? readPath() : stripBasename(readPath());
    notify(path);
    restoreScroll(path);
  };

  const event = changeEventName();
  window.addEventListener(event, handler);
  detachListener = () => window.removeEventListener(event, handler);
}

attachListener();

export const routerStore = {
  getPath(): string {
    return getMode() === "hash" ? readPath() : stripBasename(readPath());
  },

  /**
   * Switch between "history" (default, uses pushState) and
   * "hash" (uses #/path — works on any static host with zero server config).
   *
   * @example
   * routerStore.setMode("hash");
   * // /dashboard → /#/dashboard
   */
  setMode(mode: RouterMode): void {
    setMode(mode);
    attachListener();
    notify(this.getPath());
  },

  getMode,

  async push(path: string): Promise<void> {
    if (path === this.getPath()) return;

    const block = runBlockers(path, this.getPath());
    if (!block.allowed && !window.confirm(block.message)) return;

    const before = await runBeforeEach(path, this.getPath());
    const finalPath = before?.redirect ?? path;

    saveScroll();

    if (getMode() === "hash") {
      window.history.pushState(null, "", buildUrl(finalPath));
    } else {
      window.history.pushState(null, "", withBasename(finalPath));
    }

    notify(finalPath);
    restoreScroll(finalPath);
    await runAfterEach(finalPath, path);
  },

  async replace(path: string): Promise<void> {
    const block = runBlockers(path, this.getPath());
    if (!block.allowed && !window.confirm(block.message)) return;

    const before = await runBeforeEach(path, this.getPath());
    const finalPath = before?.redirect ?? path;

    saveScroll();

    if (getMode() === "hash") {
      window.history.replaceState(null, "", buildUrl(finalPath));
    } else {
      window.history.replaceState(null, "", withBasename(finalPath));
    }

    notify(finalPath);
    restoreScroll(finalPath);
    await runAfterEach(finalPath, path);
  },

  back(): void {
    window.history.back();
  },
  forward(): void {
    window.history.forward();
  },

  subscribe,
  getBasename,
  setBasename,
  setScrollBehavior,

  /** Register a hook that runs before every navigation. Return a string to redirect. */
  beforeEach: addBeforeEach,

  /** Register a hook that runs after every navigation. */
  afterEach: addAfterEach,
};
