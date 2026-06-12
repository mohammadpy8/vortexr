export type ScrollBehavior = "top" | "restore" | "none";

let behavior: ScrollBehavior = "top";

const history = new Map<string, { x: number; y: number }>();

function key(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function saveScroll(): void {
  history.set(key(), { x: window.scrollX, y: window.scrollY });
}

export function restoreScroll(path: string): void {
  if (behavior === "none") return;

  if (behavior === "restore") {
    const saved = history.get(path);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(saved.x, saved.y));
      return;
    }
  }

  requestAnimationFrame(() => window.scrollTo(0, 0));
}

export function setScrollBehavior(b: ScrollBehavior): void {
  behavior = b;
}
