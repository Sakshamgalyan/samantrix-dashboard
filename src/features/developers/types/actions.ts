import type {
  DeveloperDialog,
  DeveloperForm,
  RoleFilter,
  StatusFilter,
} from "@/features/developers/types/state";

export type DevelopersAction =
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_STATUS_FILTER"; payload: StatusFilter }
  | { type: "SET_ROLE_FILTER"; payload: RoleFilter }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "APPLY_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | {
      type: "OPEN_DIALOG";
      payload: { dialog: DeveloperDialog; form: DeveloperForm };
    }
  | { type: "CLOSE_DIALOG" }
  | { type: "PATCH_FORM"; payload: Partial<DeveloperForm> }
  | { type: "SET_SUBMITTING"; payload: boolean };
