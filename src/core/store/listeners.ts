import type { Listener } from "../../types";

const listeners = new Set<Listener>();

export function notify(path: string): void {
  listeners.forEach((fn) => fn(path));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
