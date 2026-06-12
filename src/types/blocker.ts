export type BlockerArgs = {
  nextPath: string;
  currentPath: string;
};

/**
 * Return true    → allow navigation
 * Return false   → block, show default confirmation
 * Return string  → block, show that string as confirmation message
 */
export type BlockerFn = (args: BlockerArgs) => boolean | string;

export type BlockerContextValue = {
  register: (id: string, fn: BlockerFn) => void;
  unregister: (id: string) => void;
};
