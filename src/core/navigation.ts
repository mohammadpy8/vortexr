import { createContext, useContext } from "react";
import type { NavigationState } from "../types";

type NavigationContextValue = { state: NavigationState };

export const NavigationContext = createContext<NavigationContextValue>({
  state: "idle",
});

export function useNavigationContext(): NavigationContextValue {
  return useContext(NavigationContext);
}
