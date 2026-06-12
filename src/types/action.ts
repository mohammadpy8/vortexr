export type ActionArgs = {
  formData: FormData;
  params: Record<string, string>;
  searchParams: URLSearchParams;
};

/**
 * An action function. Handles form submissions for a route.
 * Can return data (accessible via useActionData()) or a redirect string.
 *
 * Return data      → stored in ActionContext, accessible via useActionData()
 * Return string    → treated as a redirect path
 * Throw Error      → caught by ErrorBoundary
 */
export type ActionFn<T = unknown> = (args: ActionArgs) => T | string | Promise<T | string>;

export type ActionState = "idle" | "submitting";
