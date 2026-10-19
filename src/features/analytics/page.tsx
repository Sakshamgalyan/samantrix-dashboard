"use client";

import React from "react";
import { AnalyticsProvider } from "@/features/analytics/context";
import { AnalyticsContent } from "@/features/analytics/components/analytics-content";

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  );
}
