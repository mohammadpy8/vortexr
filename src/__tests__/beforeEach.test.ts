import { describe, it, expect, vi, beforeEach } from "vitest";
import { addBeforeEach, addAfterEach, runBeforeEach, runAfterEach } from "../core/beforeEach";

describe("beforeEach / afterEach", () => {

  beforeEach(() => {
    // Reset hooks between tests by re-importing fresh module state
    vi.resetModules();
  });

  it("runBeforeEach returns null when no hooks", async () => {
    const result = await runBeforeEach("/dashboard", "/");
    expect(result).toBeNull();
  });

  it("runBeforeEach returns null when hook returns void", async () => {
    const unsub = addBeforeEach(() => undefined);
    const result = await runBeforeEach("/dashboard", "/");
    expect(result).toBeNull();
    unsub();
  });

  it("runBeforeEach returns redirect when hook returns string", async () => {
    const unsub = addBeforeEach(() => "/login");
    const result = await runBeforeEach("/dashboard", "/");
    expect(result).toEqual({ redirect: "/login" });
    unsub();
  });

  it("hook receives correct to/from args", async () => {
    let received = { to: "", from: "" };
    const unsub = addBeforeEach((to, from) => { received = { to, from }; });
    await runBeforeEach("/dashboard", "/home");
    expect(received.to).toBe("/dashboard");
    expect(received.from).toBe("/home");
    unsub();
  });

  it("unsubscribe removes the hook", async () => {
    const spy = vi.fn();
    const unsub = addBeforeEach(spy);
    unsub();
    await runBeforeEach("/dashboard", "/");
    expect(spy).not.toHaveBeenCalled();
  });

  it("afterEach runs all hooks", async () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    const u1 = addAfterEach(spy1);
    const u2 = addAfterEach(spy2);
    await runAfterEach("/dashboard", "/");
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
    u1(); u2();
  });
});
