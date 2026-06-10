import { createContext, useContext } from "react";
import type { RouterContextValue } from "../types";
import { routerStore } from "./store";

const defaultValue: RouterContextValue = {
  pathname: typeof window !== "undefined" ? routerStore.getPath() : "/",
  params: {},
  push: routerStore.push.bind(routerStore),
  replace: routerStore.replace.bind(routerStore),
  back: routerStore.back.bind(routerStore),
  forward: routerStore.forward.bind(routerStore),
  basename: "",
};

export const RouterContext = createContext<RouterContextValue>(defaultValue);

export function useRouterContext(): RouterContextValue {
  return useContext(RouterContext);
}
