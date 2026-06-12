import type { LoaderArgs, LoaderFn } from "../types";

type CacheEntry = {
  data: unknown;
  cachedAt: number;
  staleTime: number;
};

const cache = new Map<string, CacheEntry>();

/**
 * Returns true if cached data for `path` is still fresh.
 */
export function isFresh(path: string): boolean {
  const entry = cache.get(path);
  if (!entry) return false;
  return Date.now() - entry.cachedAt < entry.staleTime;
}

/**
 * Returns cached loader data for `path`, or undefined if missing/stale.
 */
export function getCached(path: string): unknown | undefined {
  if (!isFresh(path)) return undefined;
  return cache.get(path)?.data;
}

/**
 * Stores loader data in the cache.
 */
export function setCached(path: string, data: unknown, staleTime: number): void {
  cache.set(path, { data, cachedAt: Date.now(), staleTime });
}

/**
 * Removes a single entry from the cache.
 */
export function invalidate(path: string): void {
  cache.delete(path);
}

/**
 * Clears the entire loader cache.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Runs the loader for a given path and caches the result.
 * If fresh data already exists in cache, returns it immediately.
 *
 * Used internally by <Link prefetch> and LoadedRoute.
 */
export async function prefetchLoader(
  path: string,
  loader: LoaderFn,
  args: LoaderArgs,
  staleTime: number,
): Promise<unknown> {
  if (isFresh(path)) return getCached(path);

  const data = await loader(args);
  setCached(path, data, staleTime);
  return data;
}
