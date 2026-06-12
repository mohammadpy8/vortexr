import { createContext, useContext, type ReactNode } from "react";
import type { ActionState } from "../types";

type ActionContextValue = {
  data: unknown;
  state: ActionState;
};

const ActionContext = createContext<ActionContextValue>({
  data: undefined,
  state: "idle",
});

export function ActionProvider({ data, state, children }: { data: unknown; state: ActionState; children: ReactNode }) {
  return <ActionContext.Provider value={{ data, state }}>{children}</ActionContext.Provider>;
}

export function useActionContext(): ActionContextValue {
  return useContext(ActionContext);
}
