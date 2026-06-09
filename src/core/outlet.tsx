import { createContext, useContext, type ReactNode } from "react";
import type { OutletContextValue } from "../types";

export const OutletContext = createContext<OutletContextValue>({ outlet: null });

export function useOutletContext(): OutletContextValue {
  return useContext(OutletContext);
}

/**
 * Renders the matched child route inside a parent layout.
 * Works exactly like react-router's <Outlet />.
 *
 * @example
 * function DashboardLayout() {
 *   return (
 *     <div>
 *       <Sidebar />
 *       <Outlet />
 *     </div>
 *   );
 * }
 */
export function Outlet(): ReactNode {
  const { outlet } = useOutletContext();
  return outlet;
}
