import { describe, it, expect } from "vitest";
import { matchPath } from "../utils/matcher";

describe("matchPath", () => {

  // ─── Static routes ──────────────────────────────────────────────────────────

  it("matches exact static route", () => {
    const result = matchPath("/about", "/about");
    expect(result.matched).toBe(true);
    expect(result.params).toEqual({});
  });

  it("does not match different static route", () => {
    expect(matchPath("/about", "/contact").matched).toBe(false);
  });

  it("matches root /", () => {
    expect(matchPath("/", "/").matched).toBe(true);
  });

  it("does not match root against /about", () => {
    expect(matchPath("/", "/about").matched).toBe(false);
  });

  // ─── Dynamic segments ────────────────────────────────────────────────────────

  it("matches single dynamic segment", () => {
    const result = matchPath("/users/:id", "/users/42");
    expect(result.matched).toBe(true);
    expect(result.params).toEqual({ id: "42" });
  });

  it("matches multiple dynamic segments", () => {
    const result = matchPath("/users/:userId/posts/:postId", "/users/5/posts/99");
    expect(result.matched).toBe(true);
    expect(result.params).toEqual({ userId: "5", postId: "99" });
  });

  it("does not match when segment count differs", () => {
    expect(matchPath("/users/:id", "/users/42/extra").matched).toBe(false);
  });

  it("decodes URI encoded params", () => {
    const result = matchPath("/search/:query", "/search/hello%20world");
    expect(result.matched).toBe(true);
    expect(result.params.query).toBe("hello world");
  });

  // ─── Wildcard ────────────────────────────────────────────────────────────────

  it("matches wildcard route", () => {
    expect(matchPath("/docs/*", "/docs/getting-started/installation").matched).toBe(true);
  });

  it("matches wildcard at root level", () => {
    expect(matchPath("*", "/anything/here").matched).toBe(true);
  });

  // ─── Nested paths ────────────────────────────────────────────────────────────

  it("matches nested static path", () => {
    expect(matchPath("/dashboard/settings", "/dashboard/settings").matched).toBe(true);
  });

  it("does not match parent when child route is active", () => {
    expect(matchPath("/dashboard", "/dashboard/settings").matched).toBe(false);
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────────

  it("handles slug-style params", () => {
    const result = matchPath("/posts/:slug", "/posts/my-first-post");
    expect(result.matched).toBe(true);
    expect(result.params.slug).toBe("my-first-post");
  });

  it("returns empty params for static match", () => {
    const result = matchPath("/contact", "/contact");
    expect(result.params).toEqual({});
  });
});
