import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCached, setCached, isFresh, invalidate, clearCache, prefetchLoader } from "../utils/prefetch";
import type { LoaderFn } from "../types";

describe("prefetch cache", () => {
  beforeEach(() => {
    clearCache();
  });

  // ─── isFresh ─────────────────────────────────────────────────────────────────

  it("returns false for unknown path", () => {
    expect(isFresh("/unknown")).toBe(false);
  });

  it("returns true immediately after setting", () => {
    setCached("/users", [1, 2, 3], 10_000);
    expect(isFresh("/users")).toBe(true);
  });

  it("returns false after staleTime expires", async () => {
    setCached("/users", [1, 2, 3], 1); // 1ms staleTime
    await new Promise((r) => setTimeout(r, 10));
    expect(isFresh("/users")).toBe(false);
  });

  // ─── getCached ────────────────────────────────────────────────────────────────

  it("returns cached data when fresh", () => {
    setCached("/users", [1, 2, 3], 10_000);
    expect(getCached("/users")).toEqual([1, 2, 3]);
  });

  it("returns undefined for stale data", async () => {
    setCached("/users", [1, 2, 3], 1);
    await new Promise((r) => setTimeout(r, 10));
    expect(getCached("/users")).toBeUndefined();
  });

  it("returns undefined for unknown path", () => {
    expect(getCached("/unknown")).toBeUndefined();
  });

  // ─── invalidate ───────────────────────────────────────────────────────────────

  it("invalidate removes entry", () => {
    setCached("/users", [1, 2, 3], 10_000);
    invalidate("/users");
    expect(isFresh("/users")).toBe(false);
    expect(getCached("/users")).toBeUndefined();
  });

  // ─── clearCache ───────────────────────────────────────────────────────────────

  it("clearCache removes all entries", () => {
    setCached("/a", 1, 10_000);
    setCached("/b", 2, 10_000);
    clearCache();
    expect(isFresh("/a")).toBe(false);
    expect(isFresh("/b")).toBe(false);
  });

  // ─── prefetchLoader ───────────────────────────────────────────────────────────

  it("calls loader and caches the result", async () => {
    const loader: LoaderFn = vi.fn().mockResolvedValue({ id: 1 });
    const args = { params: {}, searchParams: new URLSearchParams() };

    const data = await prefetchLoader("/users/1", loader, args, 10_000);

    expect(loader).toHaveBeenCalledOnce();
    expect(data).toEqual({ id: 1 });
    expect(isFresh("/users/1")).toBe(true);
  });

  it("returns cached data without calling loader again", async () => {
    const loader: LoaderFn = vi.fn().mockResolvedValue({ id: 1 });
    const args = { params: {}, searchParams: new URLSearchParams() };

    await prefetchLoader("/users/1", loader, args, 10_000);
    await prefetchLoader("/users/1", loader, args, 10_000);

    expect(loader).toHaveBeenCalledOnce(); // second call skipped
  });

  it("calls loader again after cache expires", async () => {
    const loader: LoaderFn = vi.fn().mockResolvedValue({ id: 1 });
    const args = { params: {}, searchParams: new URLSearchParams() };

    await prefetchLoader("/users/1", loader, args, 1); // 1ms
    await new Promise((r) => setTimeout(r, 10));
    await prefetchLoader("/users/1", loader, args, 1);

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
