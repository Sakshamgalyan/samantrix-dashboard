"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, EmptyState } from "@galyan/ui";
import { AlertTriangle, RotateCcw } from "lucide-react";

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
      <EmptyState
        variant="dashed"
        size="lg"
        icon={<AlertTriangle className="size-6 text-[var(--gy-danger)]" />}
        title="This page couldn't be displayed"
        description={this.state.error.message || "An unexpected error occurred while rendering this page."}
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw className="size-4" />}
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        }
      />
    );
  }
}
