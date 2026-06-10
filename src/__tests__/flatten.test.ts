import { describe, it, expect } from "vitest";
import { flattenRoutes } from "../utils/flatten";
import type { RouteConfig, GuardFn, VortexrLayout } from "../types";

// ─── Dummy components ─────────────────────────────────────────────────────────

const Page    = () => null;
const Layout1 = (({ children }) => children) as VortexrLayout;
const Layout2 = (({ children }) => children) as VortexrLayout;

const authGuard:  GuardFn = () => true;
const adminGuard: GuardFn = () => true;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("flattenRoutes", () => {

  it("flattens a single route", () => {
    const routes: RouteConfig[] = [{ path: "/", component: Page }];
    const flat = flattenRoutes(routes);
    expect(flat).toHaveLength(1);
    expect(flat[0].path).toBe("/");
  });

  it("flattens multiple top-level routes", () => {
    const routes: RouteConfig[] = [
      { path: "/",      component: Page },
      { path: "/about", component: Page },
    ];
    const flat = flattenRoutes(routes);
    expect(flat).toHaveLength(2);
    expect(flat.map((r) => r.path)).toEqual(["/", "/about"]);
  });

  // ─── Nested paths ──────────────────────────────────────────────────────────

  it("builds full path for child routes", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/dashboard",
        component: Page,
        children:  [{ path: "/settings", component: Page }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat).toHaveLength(2);
    expect(flat[1].path).toBe("/dashboard/settings");
  });

  it("handles deeply nested routes", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/a",
        component: Page,
        children:  [
          {
            path:      "/b",
            component: Page,
            children:  [{ path: "/c", component: Page }],
          },
        ],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[2].path).toBe("/a/b/c");
  });

  // ─── Layout inheritance ────────────────────────────────────────────────────

  it("assigns layout to route", () => {
    const routes: RouteConfig[] = [
      { path: "/", component: Page, layout: Layout1 },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[0].layouts).toEqual([Layout1]);
  });

  it("child route stacks layout on top of parent layout", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/dashboard",
        component: Page,
        layout:    Layout1,
        children:  [{ path: "/settings", component: Page, layout: Layout2 }],
      },
    ];
    const flat = flattenRoutes(routes);
    // parent: [Layout1]
    expect(flat[0].layouts).toEqual([Layout1]);
    // child:  [Layout1, Layout2]
    expect(flat[1].layouts).toEqual([Layout1, Layout2]);
  });

  it("child inherits parent layout even without own layout", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/dashboard",
        component: Page,
        layout:    Layout1,
        children:  [{ path: "/settings", component: Page }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[1].layouts).toEqual([Layout1]);
  });

  // ─── Guard inheritance ─────────────────────────────────────────────────────

  it("assigns guard to route", () => {
    const routes: RouteConfig[] = [
      { path: "/", component: Page, guard: authGuard },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[0].guards).toEqual([authGuard]);
  });

  it("child inherits parent guards", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/dashboard",
        component: Page,
        guard:     authGuard,
        children:  [{ path: "/settings", component: Page }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[1].guards).toContain(authGuard);
  });

  it("child guard runs after inherited parent guard", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/dashboard",
        component: Page,
        guard:     authGuard,
        children:  [{ path: "/admin", component: Page, guard: adminGuard }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[1].guards).toEqual([authGuard, adminGuard]);
  });

  it("merges guard and guards array on same route", () => {
    const extraGuard: GuardFn = () => true;
    const routes: RouteConfig[] = [
      {
        path:      "/",
        component: Page,
        guard:     authGuard,
        guards:    [extraGuard],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[0].guards).toEqual([authGuard, extraGuard]);
  });

  // ─── redirectTo inheritance ────────────────────────────────────────────────

  it("inherits parent redirectTo", () => {
    const routes: RouteConfig[] = [
      {
        path:       "/dashboard",
        component:  Page,
        redirectTo: "/login",
        children:   [{ path: "/settings", component: Page }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[1].redirectTo).toBe("/login");
  });

  it("child can override parent redirectTo", () => {
    const routes: RouteConfig[] = [
      {
        path:       "/dashboard",
        component:  Page,
        redirectTo: "/login",
        children:   [{ path: "/admin", component: Page, redirectTo: "/403" }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[1].redirectTo).toBe("/403");
  });

  // ─── Meta ──────────────────────────────────────────────────────────────────

  it("passes meta to flat route", () => {
    const routes: RouteConfig[] = [
      { path: "/", component: Page, meta: { title: "Home" } },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[0].meta).toEqual({ title: "Home" });
  });

  it("child does not inherit parent meta", () => {
    const routes: RouteConfig[] = [
      {
        path:      "/dashboard",
        component: Page,
        meta:      { title: "Dashboard" },
        children:  [{ path: "/settings", component: Page }],
      },
    ];
    const flat = flattenRoutes(routes);
    expect(flat[1].meta).toBeUndefined();
  });
});
