import type React from "react";
import type {
  AdminOrganization,
  AssignSubscriptionRequest,
  CreateOrganizationRequest,
  OrganizationProfileInput,
  SettableOrgStatus,
} from "@/features/organizations/types/api";
import type { OrganizationsState, PlanFilter, StatusTab } from "@/features/organizations/types/state";
import type { OrganizationsAction } from "@/features/organizations/types/actions";

export interface OrganizationsContextType {
  state: OrganizationsState;
  dispatch: React.Dispatch<OrganizationsAction>;

  /** Superadmins and managers create, edit, delete and assign subscriptions. */
  canManage: boolean;
  /** Only a superadmin may delete permanently. */
  canHardDelete: boolean;

  /** Refetches the list (and the open detail); a failure keeps the last data on screen. */
  refresh: () => void;
  setTab: (tab: StatusTab) => void;
  setPlan: (plan: PlanFilter) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  openDetail: (orgId: string) => void;
  closeDetail: () => void;

  openStatusDialog: (org: AdminOrganization, target: SettableOrgStatus) => void;
  setStatusReason: (reason: string) => void;
  closeStatusDialog: () => void;
  submitStatusChange: () => Promise<void>;

  openCreate: () => void;
  /** Loads the organization's full profile, then opens the edit form. */
  openEdit: (orgId: string) => Promise<void>;
  closeForm: () => void;
  /** Resolves true on success (the form closes itself). */
  submitCreate: (body: CreateOrganizationRequest) => Promise<boolean>;
  submitEdit: (
    orgId: string,
    body: Partial<OrganizationProfileInput>,
  ) => Promise<boolean>;

  openSubscription: (org: AdminOrganization) => void;
  closeSubscription: () => void;
  submitSubscription: (
    orgId: string,
    body: AssignSubscriptionRequest,
  ) => Promise<boolean>;

  openDelete: (org: AdminOrganization) => void;
  closeDelete: () => void;
  submitDelete: (orgId: string, hard: boolean) => Promise<boolean>;
}
