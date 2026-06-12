/**
 * A guard function. Can be sync or async.
 *
 * Return `true`   → allow, continue to next guard
 * Return `false`  → deny, redirect to route's `redirectTo`
 * Return `string` → deny, redirect to that specific path
 */
export type GuardFn = () => boolean | string | Promise<boolean | string>;

export type GuardResult = { allowed: true } | { allowed: false; redirectTo: string };
