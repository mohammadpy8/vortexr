import { useActionContext } from "../core/action";
import type { ActionState } from "../types";

/**
 * Returns the data returned by the current route's `action` function,
 * and the current submission state.
 *
 * @example
 * const { data, state } = useActionData<{ error?: string }>();
 *
 * if (state === "submitting") return <Spinner />;
 * if (data?.error) return <p>{data.error}</p>;
 */
export function useActionData<T = unknown>(): { data: T | undefined; state: ActionState } {
  const { data, state } = useActionContext();
  return { data: data as T | undefined, state };
}
