import { useLoaderContext } from "../core/loader";

/**
 * Returns the data returned by the current route's `loader`.
 * Fully typed via generics.
 *
 * Must be used inside a route that defines a `loader`.
 *
 * @example
 * const user = useLoaderData<User>();
 */
export function useLoaderData<T = unknown>(): T {
  const { data } = useLoaderContext();
  return data as T;
}
