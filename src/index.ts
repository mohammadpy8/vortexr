export { Router } from "./components/Router";
export { Link, NavLink } from "./components/Link";
export { Navigate } from "./components/Navigate";
export { RouteErrorBoundary } from "./components/ErrorBoundary";

export { usePathname } from "./hooks/usePathname";
export { useRouter } from "./hooks/useRouter";
export { useNavigate } from "./hooks/useNavigate";
export { useParams } from "./hooks/useParams";
export { useSearchParams } from "./hooks/useSearchParams";
export { useMatch } from "./hooks/useMatch";

export { Outlet } from "./core/outlet";

export { routerStore } from "./core/store";
export { RouterContext } from "./core/context";

export { runGuards } from "./utils/guards";
export { defineRouteConfig } from "./utils/defineRouteConfig";

export type {
  RouteConfig,
  GuardFn,
  GuardResult,
  MatchResult,
  RouterContextValue,
  VortexrComponent,
  VortexrLayout,
  VortexrErrorFallback,
  ErrorInfo,
} from "./types";
