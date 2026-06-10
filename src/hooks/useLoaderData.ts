import { useLoaderContext } from "../core/loader";

/**
 * Returns the data returned by the current route's `loader` function.
 * Must be used inside a route that defines a `loader`.
 *
 * Fully typed via generics.
 *
 * @example
 * // Route definition:
 * {
 *   path: "/users/:id",
 *   component: UserPage,
 *   loader: async ({ params }) => fetchUser(params.id),
 * }
 *
 * // Inside UserPage:
 * const user = useLoaderData<User>();
 * // → { id: "42", name: "Mohammad", ... }
 */
export function useLoaderData<T = unknown>(): T {
  const { data } = useLoaderContext();
  return data as T;
}
