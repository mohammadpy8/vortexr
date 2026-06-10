import { describe, it, expect, beforeEach } from "vitest";
import { routerStore } from "../core/store";

describe("routerStore — basename", () => {

  beforeEach(() => {
    // reset basename before each test
    routerStore.setBasename("");
  });

  it("getBasename returns empty string by default", () => {
    expect(routerStore.getBasename()).toBe("");
  });

  it("setBasename stores the basename", () => {
    routerStore.setBasename("/my-app");
    expect(routerStore.getBasename()).toBe("/my-app");
  });

  it("setBasename strips trailing slash", () => {
    routerStore.setBasename("/my-app/");
    expect(routerStore.getBasename()).toBe("/my-app");
  });

  it("setScrollBehavior accepts valid values", () => {
    expect(() => routerStore.setScrollBehavior("top")).not.toThrow();
    expect(() => routerStore.setScrollBehavior("restore")).not.toThrow();
    expect(() => routerStore.setScrollBehavior("none")).not.toThrow();
  });
});
