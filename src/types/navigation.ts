/**
 * - "idle"    → no navigation in progress
 * - "loading" → navigating or a loader / lazy component is resolving
 */
export type NavigationState = "idle" | "loading";

export type RouterContextValue = {
  pathname: string;
  params: Record<string, string>;
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  basename: string;
};

export type Listener = (path: string) => void;
