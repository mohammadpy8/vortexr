import { describe, it, expect, beforeEach } from "vitest";
import { runBlockers, registerBlocker, unregisterBlocker } from "../core/blocker";

describe("blocker", () => {

  beforeEach(() => {
    // Clean up any registered blockers between tests
    unregisterBlocker("test-1");
    unregisterBlocker("test-2");
    unregisterBlocker("test-3");
  });

  it("allows navigation when no blockers registered", () => {
    const result = runBlockers("/dashboard", "/");
    expect(result.allowed).toBe(true);
  });

  it("allows navigation when blocker returns true", () => {
    registerBlocker("test-1", () => true);
    const result = runBlockers("/dashboard", "/");
    expect(result.allowed).toBe(true);
    unregisterBlocker("test-1");
  });

  it("blocks navigation when blocker returns false", () => {
    registerBlocker("test-1", () => false);
    const result = runBlockers("/dashboard", "/");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toContain("unsaved changes");
    }
    unregisterBlocker("test-1");
  });

  it("blocks with custom message when blocker returns string", () => {
    registerBlocker("test-1", () => "Custom block message");
    const result = runBlockers("/dashboard", "/");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toBe("Custom block message");
    }
    unregisterBlocker("test-1");
  });

  it("short-circuits on first blocking result", () => {
    let secondCalled = false;
    registerBlocker("test-1", () => false);
    registerBlocker("test-2", () => { secondCalled = true; return true; });

    runBlockers("/dashboard", "/");
    expect(secondCalled).toBe(false);

    unregisterBlocker("test-1");
    unregisterBlocker("test-2");
  });

  it("passes correct args to blocker function", () => {
    let receivedArgs = { nextPath: "", currentPath: "" };
    registerBlocker("test-1", (args) => {
      receivedArgs = args;
      return true;
    });

    runBlockers("/dashboard", "/home");
    expect(receivedArgs.nextPath).toBe("/dashboard");
    expect(receivedArgs.currentPath).toBe("/home");

    unregisterBlocker("test-1");
  });

  it("unregistering a blocker removes it", () => {
    registerBlocker("test-1", () => false);
    unregisterBlocker("test-1");
    const result = runBlockers("/dashboard", "/");
    expect(result.allowed).toBe(true);
  });

  it("allows navigation after all blockers return true", () => {
    registerBlocker("test-1", () => true);
    registerBlocker("test-2", () => true);
    registerBlocker("test-3", () => true);
    const result = runBlockers("/dashboard", "/");
    expect(result.allowed).toBe(true);
    unregisterBlocker("test-1");
    unregisterBlocker("test-2");
    unregisterBlocker("test-3");
  });
});
