import { describe, it, expect } from "vitest";
import { createRouter } from "../utils/typedRoutes";

describe("createRouter — build()", () => {
  const router = createRouter(["/", "/about", "/users/:id", "/users/:id/posts/:postId"] as const);

  it("builds static path unchanged", () => {
    expect(router.build("/about")).toBe("/about");
  });

  it("builds root path unchanged", () => {
    expect(router.build("/")).toBe("/");
  });

  it("builds path with single param", () => {
    expect(router.build("/users/:id", { id: 42 })).toBe("/users/42");
  });

  it("builds path with string param", () => {
    expect(router.build("/users/:id", { id: "abc" })).toBe("/users/abc");
  });

  it("builds path with multiple params", () => {
    expect(router.build("/users/:id/posts/:postId", { id: 1, postId: 7 })).toBe("/users/1/posts/7");
  });

  it("push navigates to built path", async () => {
    router.push("/users/:id", { id: 99 });
    await new Promise((r) => setTimeout(r, 0));
    expect(window.location.pathname).toBe("/users/99");
  });

  it("push works for static path with no params", async () => {
    router.push("/about");
    await new Promise((r) => setTimeout(r, 0));
    expect(window.location.pathname).toBe("/about");
  });
});
