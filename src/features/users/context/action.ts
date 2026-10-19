import type { OrgRole } from "@/types/dashboard";
import type { TeamMemberRecord } from "@/features/users/types/api";
import type { UsersAction } from "@/features/users/types/actions";
import type { RemoveDialogState } from "@/features/users/types/state";

export const setSearch = (search: string): UsersAction => ({
  type: "SET_SEARCH",
  payload: search,
});

export const applySearch = (search: string): UsersAction => ({
  type: "APPLY_SEARCH",
  payload: search,
});

export const setRoleFilter = (role: string): UsersAction => ({
  type: "SET_ROLE_FILTER",
  payload: role,
});

export const setStatusFilter = (status: string): UsersAction => ({
  type: "SET_STATUS_FILTER",
  payload: status,
});

export const setPage = (page: number): UsersAction => ({
  type: "SET_PAGE",
  payload: page,
});

export const setRefreshing = (refreshing: boolean): UsersAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setActionError = (error: string | null): UsersAction => ({
  type: "SET_ACTION_ERROR",
  payload: error,
});

export const openInviteDialog = (): UsersAction => ({
  type: "OPEN_INVITE_DIALOG",
});

export const closeInviteDialog = (): UsersAction => ({
  type: "CLOSE_INVITE_DIALOG",
});

export const setInviteTab = (tab: "link" | "direct"): UsersAction => ({
  type: "SET_INVITE_TAB",
  payload: tab,
});

export const setInviteEmail = (email: string): UsersAction => ({
  type: "SET_INVITE_EMAIL",
  payload: email,
});

export const setDirectName = (name: string): UsersAction => ({
  type: "SET_DIRECT_NAME",
  payload: name,
});

export const setDirectPassword = (password: string): UsersAction => ({
  type: "SET_DIRECT_PASSWORD",
  payload: password,
});

export const toggleInviteShowPassword = (): UsersAction => ({
  type: "TOGGLE_INVITE_SHOW_PASSWORD",
});

export const setInviteRole = (role: OrgRole): UsersAction => ({
  type: "SET_INVITE_ROLE",
  payload: role,
});

export const setInviteDepartment = (dept: string): UsersAction => ({
  type: "SET_INVITE_DEPARTMENT",
  payload: dept,
});

export const setInviting = (inviting: boolean): UsersAction => ({
  type: "SET_INVITING",
  payload: inviting,
});

export const setInviteResult = (
  result: { inviteUrl: string } | null,
): UsersAction => ({
  type: "SET_INVITE_RESULT",
  payload: result,
});

export const setDirectResult = (
  result: { fullName: string; email: string } | null,
): UsersAction => ({
  type: "SET_DIRECT_RESULT",
  payload: result,
});

export const setCopiedLink = (copied: boolean): UsersAction => ({
  type: "SET_COPIED_LINK",
  payload: copied,
});

export const setInviteError = (error: string | null): UsersAction => ({
  type: "SET_INVITE_ERROR",
  payload: error,
});

export const openSettingsDialog = (member: TeamMemberRecord): UsersAction => ({
  type: "OPEN_SETTINGS_DIALOG",
  payload: member,
});

export const closeSettingsDialog = (): UsersAction => ({
  type: "CLOSE_SETTINGS_DIALOG",
});

export const setSettingsRole = (role: OrgRole): UsersAction => ({
  type: "SET_SETTINGS_ROLE",
  payload: role,
});

export const setSettingsStatus = (status: string): UsersAction => ({
  type: "SET_SETTINGS_STATUS",
  payload: status,
});

export const setSavingSettings = (saving: boolean): UsersAction => ({
  type: "SET_SAVING_SETTINGS",
  payload: saving,
});

export const setSettingsError = (error: string | null): UsersAction => ({
  type: "SET_SETTINGS_ERROR",
  payload: error,
});

export const openRemoveDialog = (member: RemoveDialogState): UsersAction => ({
  type: "OPEN_REMOVE_DIALOG",
  payload: member,
});

export const closeRemoveDialog = (): UsersAction => ({
  type: "CLOSE_REMOVE_DIALOG",
});
