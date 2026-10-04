import type React from "react";
import type { LeadListItem, LeadStatus } from "./api";
import type { LeadsAction } from "./actions";
import type { LeadsPageState, StatusFilter, TypeFilter } from "./state";

export interface LeadsContextType {
  state: LeadsPageState;
  dispatch: React.Dispatch<LeadsAction>;

  /** Rows on the current page that can still be invited (waitlist, pending/confirmed). */
  invitableSelected: LeadListItem[];

  // Filters
  setTypeFilter: (type: TypeFilter) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setSearchInput: (value: string) => void;
  setPage: (page: number) => void;
  setSelectedIds: (ids: string[]) => void;

  // Data
  refresh: () => void;
  reloadAll: () => Promise<void>;

  // Detail
  openDetail: (id: string) => void;
  closeDetail: () => void;

  // Mutations (resolve true on success)
  changeStatus: (lead: LeadListItem, status: LeadStatus) => Promise<boolean>;
  addNote: (id: string, content: string) => Promise<boolean>;
  openInviteDialog: () => void;
  closeInviteDialog: () => void;
  inviteSelected: () => Promise<boolean>;
}
