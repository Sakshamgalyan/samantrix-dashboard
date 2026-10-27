import type React from "react";
import type { DeveloperAccount } from "@/features/developers/types/api";
import type { DevelopersAction } from "@/features/developers/types/actions";
import type {
  DeveloperDialog,
  DeveloperForm,
  InviteDeveloperForm,
  DevelopersPageState,
  RoleFilter,
  StatusFilter,
} from "@/features/developers/types/state";

/** A type alias (not an interface) so it is assignable to Galyan's index-signatured DropdownOption. */
export type RoleOption = {
  value: string;
  label: string;
  description: string;
};

/** Whether the signed-in developer may act on one row, and why not. */
export interface RowPermissions {
  canManage: boolean;
  /** Tooltip shown when actions are locked */
  reason?: string;
}

export interface DevelopersContextType {
  state: DevelopersPageState;
  dispatch: React.Dispatch<DevelopersAction>;

  // Derived
  /** First page of pending registrations (the approval queue). */
  pendingDevelopers: DeveloperAccount[];
  /** Roles the signed-in admin may grant (Superadmin only for Superadmins). */
  roleOptions: RoleOption[];
  currentUserId?: string;
  /** Manager or Superadmin: may approve, edit, re-role and delete. */
  canManageDevelopers: boolean;
  permissionsFor: (dev: DeveloperAccount) => RowPermissions;

  // Actions
  setStatusFilter: (status: StatusFilter) => void;
  setRoleFilter: (role: RoleFilter) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  openDialog: (dialog: DeveloperDialog) => void;
  closeDialog: () => void;
  patchForm: (patch: Partial<DeveloperForm>) => void;
  openInviteModal: (defaultRole?: string) => void;
  closeInviteModal: () => void;
  patchInviteForm: (patch: Partial<InviteDeveloperForm>) => void;

  // API handlers
  refresh: () => Promise<void>;
  submitDialog: () => Promise<void>;
  submitInvite: () => Promise<void>;
}
