import React, { Suspense, useEffect, useState, type ReactNode } from "react";
import { RouterContext } from "../../core/context";
import { OutletContext } from "../../core/outlet";
import { routerStore } from "../../core/store";
import { NavigationContext } from "../../core/navigation";
import { RouteMetaContext } from "../../core/routeMeta";
import { matchPath } from "../../utils/matcher";
import { flattenRoutes } from "../../utils/flatten";
import { usePathname } from "../../hooks/usePathname";
import { RouteErrorBoundary } from "../ErrorBoundary";
import { GuardedRoute } from "./GuardedRoute";
import { LoadedRoute } from "./LoadedRoute";
import { MetaManager } from "./MetaManager";
import { DefaultNotFound } from "./DefaultNotFound";
import type {
  FlatRoute,
  NavigationState,
  RouteConfig,
  VortexrComponent,
  VortexrErrorFallback,
  VortexrLayout,
} from "../../types";

import { createContext } from "react";
export const PrefetchContext = createContext<FlatRoute[]>([]);

type RouterProps = {
  routes: RouteConfig[];
  notFound?: VortexrComponent;
  errorFallback?: VortexrErrorFallback;
  basename?: string;
  suspenseFallback?: ReactNode;
};

export function Router({
  routes,
  notFound: NotFound = DefaultNotFound,
  errorFallback,
  basename,
  suspenseFallback = null,
}: RouterProps) {
  const pathname = usePathname();
  const flat = flattenRoutes(routes);
  const [navState, setNavState] = useState<NavigationState>("idle");

  useEffect(() => {
    if (basename !== undefined) routerStore.setBasename(basename);
  }, [basename]);

  const activeBasename = basename ?? routerStore.getBasename();

  for (const route of flat) {
    const { matched, params } = matchPath(route.path, pathname);
    if (!matched) continue;

    const Page = route.component;

    const wrapped = route.layouts.reduceRight<ReactNode>(
      (inner: ReactNode, Layout: VortexrLayout) => (
        <OutletContext.Provider value={{ outlet: inner }}>
          <Layout>{inner}</Layout>
        </OutletContext.Provider>
      ),
      <Page />,
    );

    const activeFallback = route.errorFallback ?? errorFallback;

    return (
      <PrefetchContext.Provider value={flat}>
        <NavigationContext.Provider value={{ state: navState }}>
          <RouterContext.Provider
            value={{
              pathname,
              params,
              push: (p) => {
                void routerStore.push(p);
              },
              replace: (p) => {
                void routerStore.replace(p);
              },
              back: routerStore.back.bind(routerStore),
              forward: routerStore.forward.bind(routerStore),
              basename: activeBasename,
            }}
          >
            <RouteMetaContext.Provider value={route.meta ?? {}}>
              <MetaManager route={route} />
              <RouteErrorBoundary fallback={activeFallback} resetKey={pathname}>
                <Suspense fallback={suspenseFallback}>
                  <GuardedRoute route={route}>
                    <LoadedRoute route={route} params={params} onStateChange={setNavState}>
                      {wrapped}
                    </LoadedRoute>
                  </GuardedRoute>
                </Suspense>
              </RouteErrorBoundary>
            </RouteMetaContext.Provider>
          </RouterContext.Provider>
        </NavigationContext.Provider>
      </PrefetchContext.Provider>
    );
  }

  return (<NotFound />) as React.ReactElement;
}
