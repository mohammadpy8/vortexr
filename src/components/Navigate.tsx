import { useEffect } from "react";
import { routerStore } from "../core/store";

type Props = {
  to: string;
  replace?: boolean;
};

/**
 * Navigates imperatively when rendered.
 * Useful for declarative redirects in JSX.
 *
 * @example
 * if (!isLoggedIn) return <Navigate to="/login" />;
 */
export function Navigate({ to, replace: useReplace = false }: Props) {
  useEffect(() => {
    useReplace ? routerStore.replace(to) : routerStore.push(to);
  }, [to, useReplace]);

  return null;
}
