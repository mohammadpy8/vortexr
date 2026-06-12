import React, { useEffect, useState, type ReactNode } from "react";
import { routerStore } from "../../core/store";
import { runGuards } from "../../utils/guards";
import type { FlatRoute, GuardResult } from "../../types";

type Props = {
  route: FlatRoute;
  children: ReactNode;
};

/**
 * Runs the guard chain before rendering children.
 *
 * States:
 *   "pending" → async guards resolving → show guardFallback
 *   "allowed" → all guards passed      → render children
 *   "denied"  → a guard failed         → redirect and render nothing
 */
export function GuardedRoute({ route, children }: Props) {
  const [status, setStatus] = useState<"pending" | "allowed" | "denied">(
    route.guards.length === 0 ? "allowed" : "pending",
  );

  useEffect(() => {
    if (route.guards.length === 0) {
      setStatus("allowed");
      return;
    }

    let cancelled = false;

    runGuards(route.guards, route.redirectTo).then((result: GuardResult) => {
      if (cancelled) return;
      if (result.allowed) {
        setStatus("allowed");
      } else {
        setStatus("denied");
        routerStore.replace(result.redirectTo);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [route.path]);

  if (status === "pending") {
    const Fallback = route.guardFallback;
    return Fallback ? (Fallback() as React.ReactElement) : null;
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
