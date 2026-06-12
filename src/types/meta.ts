export type RouteMeta = {
  /** Sets document.title when this route is active. */
  title?: string;
  /** Sets meta[name="description"] content. */
  description?: string;
  /** Any extra fields you want to attach to a route. */
  [key: string]: unknown;
};
