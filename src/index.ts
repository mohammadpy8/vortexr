// ─── Components ───────────────────────────────────────────────────────────────
export { Router }             from "./components/Router";
export { Link, NavLink }      from "./components/Link";
export { Navigate }           from "./components/Navigate";
export { RouteErrorBoundary } from "./components/ErrorBoundary";

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { usePathname }     from "./hooks/usePathname";
export { useRouter }       from "./hooks/useRouter";
export { useNavigate }     from "./hooks/useNavigate";
export { useParams }       from "./hooks/useParams";
export { useSearchParams } from "./hooks/useSearchParams";
export { useMatch }        from "./hooks/useMatch";
export { useLoaderData }   from "./hooks/useLoaderData";
export { useNavigation }   from "./hooks/useNavigation";
export { useRouteMeta }    from "./hooks/useRouteMeta";

// ─── Outlet ───────────────────────────────────────────────────────────────────
export { Outlet } from "./core/outlet";

// ─── Core (advanced) ──────────────────────────────────────────────────────────
export { routerStore }   from "./core/store";
export { RouterContext } from "./core/context";

// ─── Utils ────────────────────────────────────────────────────────────────────
export { runGuards }         from "./utils/guards";
export { defineRouteConfig } from "./utils/defineRouteConfig";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  RouteConfig,
  RouteMeta,
  GuardFn,
  GuardResult,
  LoaderFn,
  LoaderArgs,
  NavigationState,
  MatchResult,
  RouterContextValue,
  VortexrComponent,
  VortexrLayout,
  VortexrErrorFallback,
  ErrorInfo,
} from "./types";
