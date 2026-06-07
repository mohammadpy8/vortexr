// ─── Components ───────────────────────────────────────────────────────────────
export { Router, Link, NavLink, Navigate } from "./components";

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useRouter, usePathname, useParams, useSearchParams } from "./hooks";

// ─── Core (advanced usage) ────────────────────────────────────────────────────
export { routerStore } from "./core/store";
export { RouterContext } from "./core/context";

// ─── Types ────────────────────────────────────────────────────────────────────
export type { RouteConfig, MatchResult, RouterContextValue } from "./types";
