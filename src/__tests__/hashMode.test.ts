import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { routerStore } from "../core/store";

describe("routerStore — hash mode", () => {

  afterEach(() => {
    routerStore.setMode("history");
  });

  it("defaults to history mode", () => {
    expect(routerStore.getMode()).toBe("history");
  });

  it("setMode switches to hash", () => {
    routerStore.setMode("hash");
    expect(routerStore.getMode()).toBe("hash");
  });

  it("getPath reads from hash in hash mode", async () => {
    routerStore.setMode("hash");
    await routerStore.push("/dashboard");
    expect(window.location.hash).toBe("#/dashboard");
    expect(routerStore.getPath()).toBe("/dashboard");
  });

  it("getPath defaults to / when hash is empty", () => {
    routerStore.setMode("hash");
    window.location.hash = "";
    expect(routerStore.getPath()).toBe("/");
  });

  it("push in hash mode does not change pathname", async () => {
    routerStore.setMode("hash");
    const before = window.location.pathname;
    await routerStore.push("/settings");
    expect(window.location.pathname).toBe(before);
    expect(window.location.hash).toBe("#/settings");
  });
});
