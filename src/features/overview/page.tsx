"use client";

import React from "react";
import { useConsoleScope } from "@/components/layout/scope-context";
import { OverviewProvider } from "@/features/overview/context";
import { AdminOverview } from "@/features/overview/admin/admin-overview";
import { OrganizationView } from "@/features/overview/components/organization-view";

function OverviewContent() {
  const scope = useConsoleScope();
  return scope === "admin" ? <AdminOverview /> : <OrganizationView />;
}

/** Overview follows the console chosen in the sidebar (developer console vs workspace). */
export default function OverviewPage() {
  return (
    <OverviewProvider>
      <OverviewContent />
    </OverviewProvider>
  );
}
