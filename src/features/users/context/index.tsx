"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { pageParams } from "@/features/common/pagination";
import { useGetOrgAnalyticsOverviewQuery } from "@/features/analytics/context/api";
import { useGetOrgSecurityQuery } from "@/features/security/context/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useRealtime } from "@/features/realtime";
import { queryErrorMessage } from "@/store";
import type { OrgRole } from "@/types/dashboard";
import type { TeamMemberRecord } from "@/features/users/types/api";
import type { UsersContextType } from "@/features/users/types/context";
import type { UsersState, RemoveDialogState } from "@/features/users/types/state";
import { initialUsersUiState, usersReducer } from "@/features/users/context/reducer";
import * as actions from "@/features/users/context/action";
import {
  useGetOrgMembersQuery,
  useInviteOrgMemberMutation,
  useAddOrgMemberMutation,
  useRemoveOrgMemberMutation,
  useUpdateOrgMemberRoleMutation,
  useUpdateOrgMemberStatusMutation,
} from "@/features/users/context/api";

export const UsersContext = createContext<UsersContextType | undefined>(
  undefined,
);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser, canManageTeam } = useAuth();
  const { presenceMap, onlineUserIds } = useRealtime();
  const { toast } = useToast();

  const [ui, dispatch] = useReducer(usersReducer, initialUsersUiState);

  // Debounced server search
  const debouncedSearch = useDebounce(ui.search, 300);
  useEffect(() => {
    dispatch(actions.applySearch(debouncedSearch));
  }, [debouncedSearch]);

  // Server Queries
  const membersQuery = useGetOrgMembersQuery(
    pageParams(ui.page, {
      search: ui.appliedSearch,
      role: ui.roleFilter,
      status: ui.statusFilter,
    }),
  );
  const overviewQuery = useGetOrgAnalyticsOverviewQuery();
  const securityQuery = useGetOrgSecurityQuery();

  const { refetch: refetchMembers } = membersQuery;
  const { refetch: refetchOverview } = overviewQuery;

  // Mutations
  const [updateMemberRole] = useUpdateOrgMemberRoleMutation();
  const [updateMemberStatus] = useUpdateOrgMemberStatusMutation();
  const [removeMember] = useRemoveOrgMemberMutation();
  const [inviteMember] = useInviteOrgMemberMutation();
  const [addOrgMember] = useAddOrgMemberMutation();

  const members = useMemo<TeamMemberRecord[]>(
    () => membersQuery.data?.data ?? [],
    [membersQuery.data],
  );
  const membersMeta = membersQuery.data?.meta ?? null;
  const overview = overviewQuery.data;

  const totalMembers = overview?.totalMembers ?? 0;
  const seatLimit = overview?.maxMembers ?? 0;
  const activeCount = overview?.activeMembers ?? 0;
  const suspendedCount = overview?.suspendedMembers ?? 0;
  const pendingInvites = overview?.pendingInvitations ?? 0;
  const seatUtilizationPercent = overview?.seatUtilizationPercent ?? 0;
  const allowedEmailDomains = useMemo(
    () => securityQuery.data?.allowedEmailDomains ?? [],
    [securityQuery.data?.allowedEmailDomains],
  );

  const loadError = membersQuery.error
    ? queryErrorMessage(membersQuery.error, "Failed to load team members.")
    : null;
  const error = ui.actionError ?? loadError;

  // Refresh
  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    dispatch(actions.setActionError(null));
    try {
      await Promise.all([refetchMembers(), refetchOverview()]);
    } finally {
      dispatch(actions.setRefreshing(false));
    }
  }, [refetchMembers, refetchOverview]);

  const dismissError = useCallback(() => {
    dispatch(actions.setActionError(null));
  }, []);

  // Filter setters
  const setSearch = useCallback((q: string) => {
    dispatch(actions.setSearch(q));
  }, []);

  const setRoleFilter = useCallback((role: string) => {
    dispatch(actions.setRoleFilter(role));
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    dispatch(actions.setStatusFilter(status));
  }, []);

  const setPage = useCallback((p: number) => {
    dispatch(actions.setPage(p));
  }, []);

  // Invite modal methods
  const openInviteDialog = useCallback(() => {
    dispatch(actions.openInviteDialog());
  }, []);

  const closeInviteDialog = useCallback(() => {
    dispatch(actions.closeInviteDialog());
  }, []);

  const setInviteTab = useCallback((tab: "link" | "direct") => {
    dispatch(actions.setInviteTab(tab));
  }, []);

  const setInviteEmail = useCallback((email: string) => {
    dispatch(actions.setInviteEmail(email));
  }, []);

  const setDirectName = useCallback((name: string) => {
    dispatch(actions.setDirectName(name));
  }, []);

  const setDirectPassword = useCallback((password: string) => {
    dispatch(actions.setDirectPassword(password));
  }, []);

  const toggleInviteShowPassword = useCallback(() => {
    dispatch(actions.toggleInviteShowPassword());
  }, []);

  const setInviteRole = useCallback((role: OrgRole) => {
    dispatch(actions.setInviteRole(role));
  }, []);

  const setInviteDepartment = useCallback((dept: string) => {
    dispatch(actions.setInviteDepartment(dept));
  }, []);

  const dismissInviteError = useCallback(() => {
    dispatch(actions.setInviteError(null));
  }, []);

  const copyInviteLink = useCallback(
    (url: string) => {
      navigator.clipboard.writeText(url);
      dispatch(actions.setCopiedLink(true));
      toast.success("Invite link copied to clipboard.");
      setTimeout(() => dispatch(actions.setCopiedLink(false)), 3000);
    },
    [toast],
  );

  const sendInvite = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const email = ui.inviteDialog.email.trim();
      if (!email) return;

      dispatch(actions.setInviting(true));
      dispatch(actions.setInviteError(null));
      dispatch(actions.setActionError(null));

      try {
        const res = await inviteMember({
          email: email.toLowerCase(),
          role: ui.inviteDialog.role,
          department: ui.inviteDialog.department,
        }).unwrap();

        if (res?.inviteUrl) {
          dispatch(actions.setInviteResult({ inviteUrl: res.inviteUrl }));
          toast.success("Invitation link generated successfully.");
        } else {
          const fallbackMsg =
            "Invitation created, but no invite link was returned.";
          dispatch(actions.setInviteError(fallbackMsg));
          toast.warning(fallbackMsg);
        }
      } catch (err) {
        const msg = queryErrorMessage(err, "Failed to create invitation.");
        dispatch(actions.setInviteError(msg));
        toast.error(msg);
      } finally {
        dispatch(actions.setInviting(false));
      }
    },
    [
      ui.inviteDialog.email,
      ui.inviteDialog.role,
      ui.inviteDialog.department,
      inviteMember,
      toast,
    ],
  );

  const directAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const email = ui.inviteDialog.email.trim();
      const fullName = ui.inviteDialog.fullName.trim();
      const password = ui.inviteDialog.password.trim();
      if (!email || !fullName || !password) return;

      dispatch(actions.setInviting(true));
      dispatch(actions.setInviteError(null));
      dispatch(actions.setActionError(null));

      try {
        const res = await addOrgMember({
          email: email.toLowerCase(),
          fullName,
          password,
          role: ui.inviteDialog.role,
          department: ui.inviteDialog.department,
        }).unwrap();

        dispatch(
          actions.setDirectResult({
            fullName: res.member.fullName,
            email: res.member.email,
          }),
        );
        toast.success(`${res.member.fullName} was added to the organization.`);
      } catch (err) {
        const msg = queryErrorMessage(err, "Failed to add member directly.");
        dispatch(actions.setInviteError(msg));
        toast.error(msg);
      } finally {
        dispatch(actions.setInviting(false));
      }
    },
    [
      ui.inviteDialog.email,
      ui.inviteDialog.fullName,
      ui.inviteDialog.password,
      ui.inviteDialog.role,
      ui.inviteDialog.department,
      addOrgMember,
      toast,
    ],
  );

  // Member Settings Modal methods
  const openSettingsDialog = useCallback((member: TeamMemberRecord) => {
    dispatch(actions.openSettingsDialog(member));
  }, []);

  const closeSettingsDialog = useCallback(() => {
    dispatch(actions.closeSettingsDialog());
  }, []);

  const setSettingsRole = useCallback((role: OrgRole) => {
    dispatch(actions.setSettingsRole(role));
  }, []);

  const setSettingsStatus = useCallback((status: string) => {
    dispatch(actions.setSettingsStatus(status));
  }, []);

  const dismissSettingsError = useCallback(() => {
    dispatch(actions.setSettingsError(null));
  }, []);

  const saveSettings = useCallback(async () => {
    const member = ui.settingsDialog.member;
    if (!member) return;

    dispatch(actions.setSavingSettings(true));
    dispatch(actions.setSettingsError(null));

    try {
      const promises: Promise<unknown>[] = [];
      const roleChanged = ui.settingsDialog.role !== member.role;
      const statusChanged = ui.settingsDialog.status !== member.status;

      if (!roleChanged && !statusChanged) {
        dispatch(actions.closeSettingsDialog());
        return;
      }

      if (roleChanged) {
        promises.push(
          updateMemberRole({
            memberId: member.id,
            role: ui.settingsDialog.role,
          }).unwrap(),
        );
      }
      if (statusChanged) {
        promises.push(
          updateMemberStatus({
            memberId: member.id,
            status: ui.settingsDialog.status,
          }).unwrap(),
        );
      }

      await Promise.all(promises);
      toast.success(`Settings updated for ${member.fullName || "member"}.`);
      dispatch(actions.closeSettingsDialog());
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to update member settings.");
      dispatch(actions.setSettingsError(msg));
      toast.error(msg);
    } finally {
      dispatch(actions.setSavingSettings(false));
    }
  }, [
    ui.settingsDialog.member,
    ui.settingsDialog.role,
    ui.settingsDialog.status,
    updateMemberRole,
    updateMemberStatus,
    toast,
  ]);

  // Removal Modal methods
  const openRemoveDialog = useCallback((member: RemoveDialogState) => {
    dispatch(actions.openRemoveDialog(member));
  }, []);

  const closeRemoveDialog = useCallback(() => {
    dispatch(actions.closeRemoveDialog());
  }, []);

  const confirmRemove = useCallback(async () => {
    if (!ui.removeDialog) return;
    const { id: memberId, name: memberName } = ui.removeDialog;

    try {
      await removeMember(memberId).unwrap();
      toast.success(`Removed ${memberName} from the organization.`);
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to remove member.");
      toast.error(msg);
      dispatch(actions.setActionError(msg));
    } finally {
      dispatch(actions.closeRemoveDialog());
    }
  }, [ui.removeDialog, removeMember, toast]);

  const state: UsersState = useMemo(
    () => ({
      ...ui,
      members,
      meta: membersMeta,
      loading: membersQuery.isLoading,
      error,
      totalMembers,
      seatLimit,
      activeCount,
      suspendedCount,
      pendingInvites,
      seatUtilizationPercent,
      allowedEmailDomains,
      presenceMap,
      onlineUserIds,
      currentUser,
      canManageTeam,
    }),
    [
      ui,
      members,
      membersMeta,
      membersQuery.isLoading,
      error,
      totalMembers,
      seatLimit,
      activeCount,
      suspendedCount,
      pendingInvites,
      seatUtilizationPercent,
      allowedEmailDomains,
      presenceMap,
      onlineUserIds,
      currentUser,
      canManageTeam,
    ],
  );

  const contextValue: UsersContextType = useMemo(
    () => ({
      state,
      dispatch,
      refresh,
      dismissError,
      setSearch,
      setRoleFilter,
      setStatusFilter,
      setPage,
      openInviteDialog,
      closeInviteDialog,
      setInviteTab,
      setInviteEmail,
      setDirectName,
      setDirectPassword,
      toggleInviteShowPassword,
      setInviteRole,
      setInviteDepartment,
      sendInvite,
      directAdd,
      copyInviteLink,
      dismissInviteError,
      openSettingsDialog,
      closeSettingsDialog,
      setSettingsRole,
      setSettingsStatus,
      saveSettings,
      dismissSettingsError,
      openRemoveDialog,
      closeRemoveDialog,
      confirmRemove,
    }),
    [
      state,
      refresh,
      dismissError,
      setSearch,
      setRoleFilter,
      setStatusFilter,
      setPage,
      openInviteDialog,
      closeInviteDialog,
      setInviteTab,
      setInviteEmail,
      setDirectName,
      setDirectPassword,
      toggleInviteShowPassword,
      setInviteRole,
      setInviteDepartment,
      sendInvite,
      directAdd,
      copyInviteLink,
      dismissInviteError,
      openSettingsDialog,
      closeSettingsDialog,
      setSettingsRole,
      setSettingsStatus,
      saveSettings,
      dismissSettingsError,
      openRemoveDialog,
      closeRemoveDialog,
      confirmRemove,
    ],
  );

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
}

export * from "@/features/users/context/hooks";
export * from "@/features/users/context/action";
export * from "@/features/users/context/reducer";
export * from "@/features/users/context/api";

