import type { MatchResult } from "../types";

/**
 * Matches a path pattern against an actual URL path.
 *
 * Supports:
 *   /about              → static
 *   /users/:id          → dynamic segment
 *   /a/:x/b/:y          → multiple params
 *   /docs/*             → wildcard
 */
export function matchPath(pattern: string, path: string): MatchResult {
  const paramNames: string[] = [];

  const regexStr = pattern
    .replace(/\./g, "\\.")
    .replace(/:([^/]+)/g, (_, name: string) => {
      paramNames.push(name);
      return "([^/]+)";
    })
    .replace(/\*/g, ".*");

  const regex = new RegExp(`^${regexStr}$`);
  const match = path.match(regex);

  if (!match) return { matched: false, params: {} };

  const params = paramNames.reduce(
    (acc, name, i) => ({ ...acc, [name]: decodeURIComponent(match[i + 1]) }),
    {} as Record<string, string>,
  );

  return { matched: true, params };
}
