import type { ReactNode } from "react";

export type ErrorInfo = {
  error: Error;
  reset: () => void;
};

/**
 * A render function for error fallback UI.
 * Receives the caught error and a reset callback.
 */
export type VortexrErrorFallback = (info: ErrorInfo) => ReactNode;
