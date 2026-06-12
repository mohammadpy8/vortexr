import { createContext, useContext, type ReactNode } from "react";

type LoaderContextValue = { data: unknown };

const LoaderContext = createContext<LoaderContextValue>({ data: undefined });

export function LoaderProvider({ data, children }: { data: unknown; children: ReactNode }) {
  return <LoaderContext.Provider value={{ data }}>{children}</LoaderContext.Provider>;
}

export function useLoaderContext(): LoaderContextValue {
  return useContext(LoaderContext);
}
