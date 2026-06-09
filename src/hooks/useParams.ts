import { useRouterContext } from "../core/context";

/**
 * Returns the dynamic params extracted from the matched route.
 * Fully typed via generics.
 *
 * @example
 * // Route: /users/:id/posts/:postId
 * // URL:   /users/42/posts/7
 * const { id, postId } = useParams<{ id: string; postId: string }>();
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { params } = useRouterContext();
  return params as T;
}
