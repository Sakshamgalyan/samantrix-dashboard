"use client";

import { OrganizationsProvider } from "@/features/organizations/context";
import { OrganizationsContent } from "@/features/organizations/components/organizations-content";

/** Platform admin: every tenant organization (route `admin/organizations`). */
const AdminOrganizationsPage = () => {
  return (
    <OrganizationsProvider>
      <OrganizationsContent />
    </OrganizationsProvider>
  );
};

export default AdminOrganizationsPage;
