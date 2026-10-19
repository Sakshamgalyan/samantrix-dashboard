import type React from "react";
import type { OrgRole } from "@/types/dashboard";
import type { UsersAction } from "@/features/users/types/actions";
import type { TeamMemberRecord } from "@/features/users/types/api";
import type { UsersState, RemoveDialogState } from "@/features/users/types/state";

export interface UsersContextType {
  state: UsersState;
  dispatch: React.Dispatch<UsersAction>;

  // Data methods
  refresh: () => Promise<void>;
  dismissError: () => void;

  // Filter & pagination methods
  setSearch: (search: string) => void;
  setRoleFilter: (role: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;

  // Invite modal methods
  openInviteDialog: () => void;
  closeInviteDialog: () => void;
  setInviteTab: (tab: "link" | "direct") => void;
  setInviteEmail: (email: string) => void;
  setDirectName: (name: string) => void;
  setDirectPassword: (password: string) => void;
  toggleInviteShowPassword: () => void;
  setInviteRole: (role: OrgRole) => void;
  setInviteDepartment: (dept: string) => void;
  sendInvite: (e: React.FormEvent) => Promise<void>;
  directAdd: (e: React.FormEvent) => Promise<void>;
  copyInviteLink: (url: string) => void;
  dismissInviteError: () => void;

  // Member Settings Modal methods
  openSettingsDialog: (member: TeamMemberRecord) => void;
  closeSettingsDialog: () => void;
  setSettingsRole: (role: OrgRole) => void;
  setSettingsStatus: (status: string) => void;
  saveSettings: () => Promise<void>;
  dismissSettingsError: () => void;

  // Removal dialog methods
  openRemoveDialog: (member: RemoveDialogState) => void;
  closeRemoveDialog: () => void;
  confirmRemove: () => Promise<void>;
}
