"use client";

import { useConsoleScope } from "@/components/layout/scope-context";
import { PlatformAdminView } from "./components/platform-admin-view";
import { OrganizationView } from "./components/organization-view";

/** Overview follows the console chosen in the sidebar (Platform vs Workspace). */
export default function OverviewPage() {
  const scope = useConsoleScope();
  return scope === "admin" ? <PlatformAdminView /> : <OrganizationView />;
}
