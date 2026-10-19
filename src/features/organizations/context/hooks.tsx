import { useContext } from "react";
import { OrganizationsContext } from "@/features/organizations/context/index";
import type { OrganizationsContextType } from "@/features/organizations/types";

export function useOrganizationsContext(): OrganizationsContextType {
  const ctx = useContext(OrganizationsContext);
  if (!ctx) {
    throw new Error(
      "useOrganizationsContext must be used within an OrganizationsProvider",
    );
  }
  return ctx;
}
