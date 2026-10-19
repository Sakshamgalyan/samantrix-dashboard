"use client";

import React, { useEffect } from "react";
import { ServerErrorView } from "@/components/layout/common/server-error-view";

export default function DashboardRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Simantrix Dashboard Route Error]:", error);
  }, [error]);

  return <ServerErrorView error={error} onRetry={reset} fullScreen />;
}
