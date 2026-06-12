type NavigationHook = (to: string, from: string) => void | string | Promise<void | string>;

const beforeHooks: NavigationHook[] = [];
const afterHooks: NavigationHook[] = [];

/**
 * Register a hook that runs before every navigation.
 * Returning a string redirects to that path instead.
 *
 * @example
 * routerStore.beforeEach((to, from) => {
 *   analytics.track("page_view", { path: to });
 *   if (!isAuth && to !== "/login") return "/login";
 * });
 */
export function addBeforeEach(fn: NavigationHook): () => void {
  beforeHooks.push(fn);
  return () => beforeHooks.splice(beforeHooks.indexOf(fn), 1);
}

/**
 * Register a hook that runs after every navigation.
 *
 * @example
 * routerStore.afterEach((to, from) => {
 *   console.log(`navigated from ${from} to ${to}`);
 * });
 */
export function addAfterEach(fn: NavigationHook): () => void {
  afterHooks.push(fn);
  return () => afterHooks.splice(afterHooks.indexOf(fn), 1);
}

export async function runBeforeEach(to: string, from: string): Promise<{ redirect: string } | null> {
  for (const fn of beforeHooks) {
    const result = await fn(to, from);
    if (typeof result === "string") return { redirect: result };
  }
  return null;
}

export async function runAfterEach(to: string, from: string): Promise<void> {
  for (const fn of afterHooks) {
    await fn(to, from);
  }
}
