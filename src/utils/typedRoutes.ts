import { routerStore } from "../core/store";

/**
 * Extracts param names from a path pattern as a union of string literals.
 *
 * "/users/:id"               → "id"
 * "/users/:id/posts/:postId" → "id" | "postId"
 * "/about"                   → never
 */
type ExtractParamNames<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractParamNames<`/${Rest}`>
  : T extends `${string}:${infer Param}`
    ? Param
    : never;

/**
 * Builds a params object type from a path pattern.
 *
 * "/users/:id"   → { id: string }
 * "/about"       → Record<string, never>
 */
type ParamsForPath<T extends string> =
  ExtractParamNames<T> extends never ? Record<string, never> : { [K in ExtractParamNames<T>]: string | number };

/**
 * Defines a type-safe set of route paths for use with `push`/`replace`.
 *
 * This does NOT replace `<Router routes={...} />` — it's a thin,
 * type-safe wrapper around `routerStore` for navigation calls.
 *
 * @example
 * const router = createRouter([
 *   "/",
 *   "/about",
 *   "/users/:id",
 *   "/users/:id/posts/:postId",
 * ] as const);
 *
 * router.push("/users", { id: 42 });           // ✅ → "/users/42"
 * router.push("/users/:id/posts/:postId", {    // ✅
 *   id: 1, postId: 7
 * });                                          // → "/users/1/posts/7"
 *
 * router.push("/userz");                       // ❌ TypeScript error
 * router.push("/users/:id");                   // ❌ missing params
 */
export function createRouter<const T extends readonly string[]>(_paths: T) {
  type Path = T[number];

  function build<P extends Path>(path: P, params?: ParamsForPath<P>): string {
    let result: string = path;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(`:${key}`, String(value));
      }
    }
    return result;
  }

  return {
    /** Builds the final URL string from a typed path + params, without navigating. */
    build,

    /** Type-safe navigation. Replaces :params with values from the second argument. */
    push<P extends Path>(path: P, ...args: ParamsForPath<P> extends Record<string, never> ? [] : [ParamsForPath<P>]) {
      void routerStore.push(build(path, args[0] as ParamsForPath<P> | undefined));
    },

    /** Type-safe navigation with replaceState. */
    replace<P extends Path>(
      path: P,
      ...args: ParamsForPath<P> extends Record<string, never> ? [] : [ParamsForPath<P>]
    ) {
      void routerStore.replace(build(path, args[0] as ParamsForPath<P> | undefined));
    },
  };
}
