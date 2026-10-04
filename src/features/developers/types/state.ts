import type {
  DeveloperAccount,
  DeveloperStatus,
  DevelopersResponse,
} from "./api";

export type DeveloperTab = "ALL" | DeveloperStatus;

/** Decision dialogs: role-picking (approve/role/reinstate) and confirm-only (reject/revoke). */
export type DeveloperDialogKind =
  "approve" | "role" | "reinstate" | "reject" | "revoke";

export interface DeveloperDialog {
  kind: DeveloperDialogKind;
  dev: DeveloperAccount;
}

export interface DevelopersPageState {
  data: DevelopersResponse | null;
  error: string | null;
  refreshing: boolean;
  tab: DeveloperTab;
  search: string;
  dialog: DeveloperDialog | null;
  selectedRole: string;
  submitting: boolean;
}
