import { matchPath } from "../utils/matcher";
import { usePathname } from "./usePathname";

/**
 * Tests whether the given pattern matches the current path.
 * Returns match info (with params) or null if no match.
 *
 * @example
 * const match = useMatch("/users/:id");
 * if (match) {
 *   console.log(match.params.id); // → "42"
 * }
 */
export function useMatch(pattern: string): { params: Record<string, string> } | null {
  const pathname = usePathname();
  const result = matchPath(pattern, pathname);
  return result.matched ? { params: result.params } : null;
}
