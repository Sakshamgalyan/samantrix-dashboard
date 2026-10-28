"use client";

import { OrganizationFormDrawer } from "@/features/organizations/components/organization-form-drawer";
import { useOrganizationsContext } from "@/features/organizations/context";

export const OrganizationFormModal = () => {
  const { state } = useOrganizationsContext();
  const dialog = state.formDialog;
  if (!dialog) return null;
  return <OrganizationFormDrawer key={dialog.org?.id ?? "new"} />;
};

export default OrganizationFormModal;
