"use client";

import dynamic from "next/dynamic";

// React Router owns every console URL, so the SPA renders client-side only.
const DashboardApp = dynamic(() => import("@/components/layout/dashboard-app"), { ssr: false });

export function DashboardClient() {
  return <DashboardApp />;
}
