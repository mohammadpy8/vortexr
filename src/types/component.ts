import type { ReactNode } from "react";

/**
 * A page component — no required props.
 * Compatible with React 18 and React 19 types.
 */
export type VortexrComponent = () => JSX.Element;

/**
 * A layout component — requires a `children` prop.
 * Compatible with React 18 and React 19 types.
 */
export type VortexrLayout = (props: { children: ReactNode }) => JSX.Element;
