import type {
  AdminOrganization,
  AdminOrganizationDetail,
  AdminOrganizationsResponse,
  SettableOrgStatus,
} from "./api";
import type { StatusTab } from "./state";

export type OrganizationsAction =
  | { type: "LOAD_SUCCESS"; payload: AdminOrganizationsResponse }
  | { type: "LOAD_FAILURE"; payload: string }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_TAB"; payload: StatusTab }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "OPEN_DETAIL"; payload: string }
  | { type: "DETAIL_SUCCESS"; payload: AdminOrganizationDetail }
  | { type: "DETAIL_FAILURE"; payload: { orgId: string; error: string } }
  | { type: "CLOSE_DETAIL" }
  | {
      type: "OPEN_STATUS_DIALOG";
      payload: { org: AdminOrganization; target: SettableOrgStatus };
    }
  | { type: "SET_STATUS_REASON"; payload: string }
  | { type: "SET_STATUS_SUBMITTING"; payload: boolean }
  | { type: "CLOSE_STATUS_DIALOG" };
