import React, { Component, type ReactNode } from "react";
import { DefaultErrorUI } from "./DefaultErrorUI";
import type { VortexrErrorFallback } from "../../types";

type Props = {
  fallback?: VortexrErrorFallback;
  children: ReactNode;
  /**
   * When resetKey changes, the error state clears automatically.
   * Pass the current pathname so navigating away resets the boundary.
   */
  resetKey?: string;
};

type State = { error: Error | null };

/**
 * Error boundary used internally by vortexr.
 * Wraps each matched route and catches render-time errors.
 *
 * Uses `fallback` if provided, otherwise shows DefaultErrorUI.
 * Resets automatically when the user navigates to a new route.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      if (fallback) {
        return fallback({ error, reset: this.reset }) as React.ReactElement;
      }
      return <DefaultErrorUI error={error} reset={this.reset} />;
    }

    return children;
  }
}
