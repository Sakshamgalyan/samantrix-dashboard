import type React from "react";
import type { AdminOrganization, SettableOrgStatus } from "./api";
import type { OrganizationsState, StatusTab } from "./state";
import type { OrganizationsAction } from "./actions";

export interface OrganizationsContextType {
  state: OrganizationsState;
  dispatch: React.Dispatch<OrganizationsAction>;

  /** Organizations after the status tab and search filter. */
  visible: AdminOrganization[];
  /** True when the signed-in admin may activate / suspend (not REPORT_ADMIN). */
  canManage: boolean;

  load: () => Promise<void>;
  refresh: () => void;
  setTab: (tab: StatusTab) => void;
  setSearch: (search: string) => void;
  openDetail: (orgId: string) => void;
  closeDetail: () => void;
  openStatusDialog: (org: AdminOrganization, target: SettableOrgStatus) => void;
  setStatusReason: (reason: string) => void;
  closeStatusDialog: () => void;
  submitStatusChange: () => Promise<void>;
}
