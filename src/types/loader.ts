export type LoaderArgs = {
  params: Record<string, string>;
  searchParams: URLSearchParams;
};

/**
 * A loader function. Runs before the route renders.
 * Can be sync or async.
 * Result is accessible inside the component via useLoaderData().
 */
export type LoaderFn<T = unknown> = (args: LoaderArgs) => T | Promise<T>;
