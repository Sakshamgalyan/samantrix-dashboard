"use client";

import React, { useEffect } from "react";
import { ServerErrorView } from "@/components/layout/common/server-error-view";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Simantrix Dashboard Root Error]:", error);
  }, [error]);

  return <ServerErrorView error={error} onRetry={reset} fullScreen />;
}
