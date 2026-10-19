"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ServerErrorView } from "@/components/layout/common/server-error-view";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Contains a crash to the current page so the sidebar and header keep working.
 * The shell keys it by pathname, so navigating elsewhere clears the error.
 */
export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard page crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ServerErrorView
        fullScreen={false}
        error={this.state.error}
        onRetry={() => this.setState({ error: null })}
      />
    );
  }
}
