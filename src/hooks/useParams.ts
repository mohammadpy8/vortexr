import { useRouterContext } from "../core/context";

/**
 * Returns the dynamic params from the matched route.
 * Fully typed via generics.
 *
 * @example
 * // Route: /users/:id/posts/:postId
 * const { id, postId } = useParams<{ id: string; postId: string }>();
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { params } = useRouterContext();
  return params as T;
}
