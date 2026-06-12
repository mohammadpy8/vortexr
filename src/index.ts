export { Router } from "./components/Router";
export { Link, NavLink } from "./components/Link";
export { Navigate } from "./components/Navigate";
export { Form } from "./components/Form";
export { RouteErrorBoundary } from "./components/ErrorBoundary";
export { VortexrDevTools } from "./components/DevTools";

export { Outlet } from "./core/outlet";

export { usePathname } from "./hooks/usePathname";
export { useRouter } from "./hooks/useRouter";
export { useNavigate } from "./hooks/useNavigate";
export { useParams } from "./hooks/useParams";
export { useSearchParams } from "./hooks/useSearchParams";
export { useMatch } from "./hooks/useMatch";
export { useLoaderData } from "./hooks/useLoaderData";
export { useNavigation } from "./hooks/useNavigation";
export { useRouteMeta } from "./hooks/useRouteMeta";
export { useBlocker } from "./hooks/useBlocker";
export { useActionData } from "./hooks/useActionData";

export { routerStore } from "./core/store";
export { RouterContext } from "./core/context";
export type { RouterMode } from "./core/store";

export { defineRouteConfig } from "./utils/defineRouteConfig";
export { lazyRoute } from "./utils/lazy";
export { runGuards } from "./utils/guards";
export { clearCache } from "./utils/prefetch";
export { createRouter } from "./utils/typedRoutes";

export type {
  RouteConfig,
  FlatRoute,
  RouteMeta,
  GuardFn,
  GuardResult,
  LoaderFn,
  LoaderArgs,
  ActionFn,
  ActionArgs,
  ActionState,
  NavigationState,
  RouterContextValue,
  VortexrComponent,
  VortexrLayout,
  VortexrErrorFallback,
  ErrorInfo,
  BlockerFn,
  BlockerArgs,
  MatchResult,
} from "./types";
