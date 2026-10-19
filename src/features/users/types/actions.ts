import type { OrgRole } from "@/types/dashboard";
import type { TeamMemberRecord } from "@/features/users/types/api";
import type { RemoveDialogState } from "@/features/users/types/state";

export type UsersAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "APPLY_SEARCH"; payload: string }
  | { type: "SET_ROLE_FILTER"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "OPEN_INVITE_DIALOG" }
  | { type: "CLOSE_INVITE_DIALOG" }
  | { type: "SET_INVITE_TAB"; payload: "link" | "direct" }
  | { type: "SET_INVITE_EMAIL"; payload: string }
  | { type: "SET_DIRECT_NAME"; payload: string }
  | { type: "SET_DIRECT_PASSWORD"; payload: string }
  | { type: "TOGGLE_INVITE_SHOW_PASSWORD" }
  | { type: "SET_INVITE_ROLE"; payload: OrgRole }
  | { type: "SET_INVITE_DEPARTMENT"; payload: string }
  | { type: "SET_INVITING"; payload: boolean }
  | { type: "SET_INVITE_RESULT"; payload: { inviteUrl: string } | null }
  | { type: "SET_DIRECT_RESULT"; payload: { fullName: string; email: string } | null }
  | { type: "SET_COPIED_LINK"; payload: boolean }
  | { type: "SET_INVITE_ERROR"; payload: string | null }
  | { type: "OPEN_SETTINGS_DIALOG"; payload: TeamMemberRecord }
  | { type: "CLOSE_SETTINGS_DIALOG" }
  | { type: "SET_SETTINGS_ROLE"; payload: OrgRole }
  | { type: "SET_SETTINGS_STATUS"; payload: string }
  | { type: "SET_SAVING_SETTINGS"; payload: boolean }
  | { type: "SET_SETTINGS_ERROR"; payload: string | null }
  | { type: "OPEN_REMOVE_DIALOG"; payload: RemoveDialogState }
  | { type: "CLOSE_REMOVE_DIALOG" };
