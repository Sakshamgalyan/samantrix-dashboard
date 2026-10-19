import type { AdminOrganization, SettableOrgStatus } from "@/features/organizations/types/api";
import type { FormDialogState, PlanFilter, StatusTab } from "@/features/organizations/types/state";

export type OrganizationsAction =
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_TAB"; payload: StatusTab }
  | { type: "SET_PLAN"; payload: PlanFilter }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "APPLY_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "OPEN_DETAIL"; payload: string }
  | { type: "CLOSE_DETAIL" }
  | {
      type: "OPEN_STATUS_DIALOG";
      payload: { org: AdminOrganization; target: SettableOrgStatus };
    }
  | { type: "SET_STATUS_REASON"; payload: string }
  | { type: "SET_STATUS_SUBMITTING"; payload: boolean }
  | { type: "CLOSE_STATUS_DIALOG" }
  | { type: "SET_FORM_DIALOG"; payload: FormDialogState | null }
  | { type: "SET_SUBSCRIPTION_DIALOG"; payload: AdminOrganization | null }
  | { type: "SET_DELETE_DIALOG"; payload: AdminOrganization | null };
