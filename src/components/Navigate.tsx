import { useEffect } from "react";
import { routerStore } from "../core/store";

type NavigateProps = {
  to: string;
  /** Use replaceState instead of pushState */
  replace?: boolean;
};

/**
 * Navigates imperatively when rendered.
 * Useful for declarative redirects in JSX.
 *
 * @example
 * if (!isLoggedIn) return <Navigate to="/login" />;
 * if (isAdmin)     return <Navigate to="/admin" replace />;
 */
export function Navigate({ to, replace: useReplace = false }: NavigateProps) {
  useEffect(() => {
    useReplace ? routerStore.replace(to) : routerStore.push(to);
  }, [to, useReplace]);

  return null;
}
