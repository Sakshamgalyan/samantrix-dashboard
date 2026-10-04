"use client";

import { OrganizationsProvider } from "./context";
import { OrganizationsContent } from "./components/organizations-content";

/** Platform admin: every tenant organization (route `admin/organizations`). */
export default function AdminOrganizationsPage() {
  return (
    <OrganizationsProvider>
      <OrganizationsContent />
    </OrganizationsProvider>
  );
}
