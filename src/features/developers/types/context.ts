import type React from "react";
import type { DeveloperAccount } from "./api";
import type { DevelopersAction } from "./actions";
import type {
  DeveloperDialog,
  DevelopersPageState,
  DeveloperTab,
} from "./state";

/** A type alias (not an interface) so it is assignable to Galyan's index-signatured DropdownOption. */
export type RoleOption = {
  value: string;
  label: string;
  description: string;
};

export interface DevelopersContextType {
  state: DevelopersPageState;
  dispatch: React.Dispatch<DevelopersAction>;

  // Derived
  visibleDevelopers: DeveloperAccount[];
  onlineCount: number;
  /** Roles the signed-in admin may grant (Superadmin only for Superadmins). */
  roleOptions: RoleOption[];
  currentUserId?: string;
  actorIsSuperadmin: boolean;

  // Actions
  setTab: (tab: DeveloperTab) => void;
  setSearch: (search: string) => void;
  openDialog: (dialog: DeveloperDialog) => void;
  closeDialog: () => void;
  setRole: (role: string) => void;

  // API handlers
  refresh: () => Promise<void>;
  submitDialog: () => Promise<void>;
}
