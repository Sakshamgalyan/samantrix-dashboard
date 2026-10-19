"use client";

import React from "react";
import { RevenueProvider } from "@/features/revenue/context";
import { RevenueContent } from "@/features/revenue/components/revenue-content";

/** /admin/revenue: superadmin-only revenue report (route gated by `revenue:view`). */
export default function RevenuePage() {
  return (
    <RevenueProvider>
      <RevenueContent />
    </RevenueProvider>
  );
}
