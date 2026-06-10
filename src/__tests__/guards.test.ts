import { describe, it, expect, vi } from "vitest";
import { runGuards } from "../utils/guards";
import type { GuardFn } from "../types";

describe("runGuards", () => {

  // ─── Allow ───────────────────────────────────────────────────────────────────

  it("allows when no guards", async () => {
    const result = await runGuards([], "/login");
    expect(result.allowed).toBe(true);
  });

  it("allows when single sync guard returns true", async () => {
    const guard: GuardFn = () => true;
    const result = await runGuards([guard], "/login");
    expect(result.allowed).toBe(true);
  });

  it("allows when all guards pass", async () => {
    const guards: GuardFn[] = [() => true, () => true, () => true];
    const result = await runGuards(guards, "/login");
    expect(result.allowed).toBe(true);
  });

  it("allows when async guard resolves true", async () => {
    const guard: GuardFn = async () => {
      await Promise.resolve();
      return true;
    };
    const result = await runGuards([guard], "/login");
    expect(result.allowed).toBe(true);
  });

  // ─── Deny ────────────────────────────────────────────────────────────────────

  it("denies when guard returns false", async () => {
    const guard: GuardFn = () => false;
    const result = await runGuards([guard], "/login");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.redirectTo).toBe("/login");
    }
  });

  it("redirects to custom path when guard returns string", async () => {
    const guard: GuardFn = () => "/403";
    const result = await runGuards([guard], "/login");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.redirectTo).toBe("/403");
    }
  });

  it("uses defaultRedirectTo when guard returns false", async () => {
    const result = await runGuards([() => false], "/dashboard");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.redirectTo).toBe("/dashboard");
    }
  });

  // ─── Short-circuit ────────────────────────────────────────────────────────────

  it("short-circuits on first failing guard", async () => {
    const spy = vi.fn().mockReturnValue(true);
    const guards: GuardFn[] = [() => false, spy];
    await runGuards(guards, "/login");
    expect(spy).not.toHaveBeenCalled();
  });

  it("runs all guards until one fails", async () => {
    const spy1 = vi.fn().mockReturnValue(true);
    const spy2 = vi.fn().mockReturnValue(false);
    const spy3 = vi.fn().mockReturnValue(true);

    await runGuards([spy1, spy2, spy3], "/login");

    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
    expect(spy3).not.toHaveBeenCalled();
  });

  // ─── Async ───────────────────────────────────────────────────────────────────

  it("handles async guards in chain", async () => {
    const guards: GuardFn[] = [
      async () => { await Promise.resolve(); return true; },
      async () => { await Promise.resolve(); return false; },
    ];
    const result = await runGuards(guards, "/login");
    expect(result.allowed).toBe(false);
  });

  it("async guard can return a redirect string", async () => {
    const guard: GuardFn = async () => "/unauthorized";
    const result = await runGuards([guard], "/login");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.redirectTo).toBe("/unauthorized");
    }
  });
});
