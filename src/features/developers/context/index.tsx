"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { pageParams } from "@/features/common/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import { hasPermission, isSuperadmin } from "@/utils/roles";
import { ROLE_OPTIONS, roleLabel } from "@/features/developers/common/constants";
import type {
  DeveloperAccount,
  DeveloperDialog,
  DeveloperForm,
  DevelopersContextType,
  DevelopersPageState,
  RoleFilter,
  RowPermissions,
  StatusFilter,
  UpdateDeveloperRequest,
} from "@/features/developers/types";
import { developersReducer, initialDevelopersState } from "@/features/developers/context/reducer";
import * as actions from "@/features/developers/context/action";
import {
  useApproveDeveloperMutation,
  useDeleteDeveloperMutation,
  useGetDevelopersQuery,
  useGetDevelopersSummaryQuery,
  useRejectDeveloperMutation,
  useUpdateDeveloperMutation,
} from "@/features/developers/context/api";

const POLLING = {
  pollingInterval: POLL_INTERVAL_MS,
  skipPollingIfUnfocused: true,
} as const;

/** The approval queue: first page of pending registrations (same args as that table filter). */
const PENDING_PARAMS = pageParams(1, { status: "PENDING_VERIFICATION" });

export const DevelopersContext = createContext<DevelopersContextType | undefined>(
  undefined,
);

/** Only the fields that differ from the developer's current values. */
function changedFields(
  dev: DeveloperAccount,
  form: DeveloperForm,
): UpdateDeveloperRequest {
  const body: UpdateDeveloperRequest = {};
  if (form.fullName.trim() !== dev.fullName) body.fullName = form.fullName.trim();
  if (form.phone.trim() !== (dev.phone ?? "")) body.phone = form.phone.trim();
  if (form.role !== dev.platformRole) body.platformRole = form.role;
  if (
    (dev.status === "ACTIVE" || dev.status === "SUSPENDED") &&
    form.status !== dev.status
  )
    body.status = form.status;
  return body;
}

export function DevelopersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const actorIsSuperadmin = isSuperadmin(user);
  const canManageDevelopers = hasPermission(user, "developers:manage");

  const [ui, dispatch] = useReducer(developersReducer, initialDevelopersState);

  // Counts are shared with the sidebar badge and the overview: one request, one cache entry
  const summaryQuery = useGetDevelopersSummaryQuery(undefined, POLLING);
  // One server-filtered page of the table
  const listQuery = useGetDevelopersQuery(
    pageParams(ui.page, {
      status: ui.statusFilter,
      role: ui.roleFilter,
      search: ui.appliedSearch,
    }),
    POLLING,
  );
  // The approval queue only loads when something is pending
  const hasPending = (summaryQuery.data?.counts.pending ?? 0) > 0;
  const pendingQuery = useGetDevelopersQuery(PENDING_PARAMS, {
    ...POLLING,
    skip: !hasPending,
  });
  const { refetch: refetchSummary } = summaryQuery;
  const { refetch: refetchList } = listQuery;
  const [approveDeveloper] = useApproveDeveloperMutation();
  const [rejectDeveloper] = useRejectDeveloperMutation();
  const [updateDeveloper] = useUpdateDeveloperMutation();
  const [deleteDeveloper] = useDeleteDeveloperMutation();

  // Copy the typed search into the query after a short pause
  const debouncedSearch = useDebounce(ui.search, 350);
  useEffect(() => {
    dispatch(actions.applySearch(debouncedSearch.trim()));
  }, [debouncedSearch]);

  // Keep the last good data on screen; the error only shows when there is nothing cached
  const state = useMemo<DevelopersPageState>(
    () => ({
      ...ui,
      summary: summaryQuery.data ?? null,
      error: summaryQuery.error
        ? queryErrorMessage(summaryQuery.error, "Couldn't load developer accounts.")
        : null,
      rows: listQuery.data?.data ?? [],
      meta: listQuery.data?.meta ?? null,
      // Old rows stay up while another page/filter loads; skeleton only when there's nothing to show
      listLoading:
        listQuery.isFetching && !listQuery.currentData && !listQuery.data?.data.length,
    }),
    [
      ui,
      summaryQuery.data,
      summaryQuery.error,
      listQuery.data,
      listQuery.currentData,
      listQuery.isFetching,
    ],
  );

  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    try {
      await Promise.allSettled([refetchSummary(), refetchList()]);
    } finally {
      dispatch(actions.setRefreshing(false));
    }
  }, [refetchSummary, refetchList]);

  const roleOptions = useMemo(
    () =>
      ROLE_OPTIONS.filter((r) => actorIsSuperadmin || r.value !== "SUPERADMIN"),
    [actorIsSuperadmin],
  );

  // Mirrors the backend rules: no actions on yourself; managers can't touch superadmins
  const permissionsFor = useCallback(
    (dev: DeveloperAccount): RowPermissions => {
      if (!canManageDevelopers) return { canManage: false };
      if (dev.id === user?.id)
        return { canManage: false, reason: "You can't change your own account here" };
      if (dev.platformRole === "SUPERADMIN" && !actorIsSuperadmin)
        return { canManage: false, reason: "Only a Superadmin can change a Superadmin" };
      return { canManage: true };
    },
    [canManageDevelopers, actorIsSuperadmin, user?.id],
  );

  const setStatusFilter = useCallback(
    (status: StatusFilter) => dispatch(actions.setStatusFilter(status)),
    [],
  );
  const setRoleFilter = useCallback(
    (role: RoleFilter) => dispatch(actions.setRoleFilter(role)),
    [],
  );
  const setSearch = useCallback(
    (search: string) => dispatch(actions.setSearch(search)),
    [],
  );
  const setPage = useCallback(
    (page: number) => dispatch(actions.setPage(page)),
    [],
  );
  const patchForm = useCallback(
    (patch: Partial<DeveloperForm>) => dispatch(actions.patchForm(patch)),
    [],
  );
  const closeDialog = useCallback(() => dispatch(actions.closeDialog()), []);

  const openDialog = useCallback(
    (dialog: DeveloperDialog) => {
      const { dev } = dialog;
      const grantable = roleOptions.some((r) => r.value === dev.platformRole);
      dispatch(
        actions.openDialog(dialog, {
          fullName: dev.fullName,
          phone: dev.phone ?? "",
          role: grantable ? dev.platformRole : "MEMBER",
          status: dev.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        }),
      );
    },
    [roleOptions],
  );

  const submitDialog = useCallback(async () => {
    const { dialog, form } = state;
    if (!dialog) return;
    const { dev, kind } = dialog;

    let message: string;
    dispatch(actions.setSubmitting(true));
    try {
      switch (kind) {
        case "approve":
        case "reinstate":
          await approveDeveloper({ id: dev.id, platformRole: form.role }).unwrap();
          message = `${kind === "approve" ? "Approved" : "Reinstated"} ${dev.fullName} as ${roleLabel(form.role)}.`;
          break;
        case "reject":
          await rejectDeveloper(dev.id).unwrap();
          message = `Rejected ${dev.fullName}'s request.`;
          break;
        case "role":
          await updateDeveloper({ id: dev.id, body: { platformRole: form.role } }).unwrap();
          message = `${dev.fullName} is now ${roleLabel(form.role)}.`;
          break;
        case "suspend":
        case "reactivate":
          await updateDeveloper({
            id: dev.id,
            body: { status: kind === "suspend" ? "SUSPENDED" : "ACTIVE" },
          }).unwrap();
          message =
            kind === "suspend"
              ? `Suspended ${dev.fullName}.`
              : `Reactivated ${dev.fullName}.`;
          break;
        case "edit": {
          if (!form.fullName.trim()) {
            toast.error("Name can't be empty.");
            dispatch(actions.setSubmitting(false));
            return;
          }
          const body = changedFields(dev, form);
          if (Object.keys(body).length > 0)
            await updateDeveloper({ id: dev.id, body }).unwrap();
          message = `Saved changes to ${form.fullName.trim()}.`;
          break;
        }
        case "delete":
          await deleteDeveloper(dev.id).unwrap();
          message = `Deleted ${dev.fullName}'s account.`;
          break;
      }
      toast.success(message);
      dispatch(actions.setSubmitting(false));
      // The mutation invalidates the developers cache, which refetches it once for every screen
      dispatch(actions.closeDialog());
    } catch (err) {
      dispatch(actions.setSubmitting(false));
      toast.error(queryErrorMessage(err, "That action failed. Please try again."));
    }
  }, [state, toast, approveDeveloper, rejectDeveloper, updateDeveloper, deleteDeveloper]);

  const pendingDevelopers = useMemo(
    () => (hasPending ? (pendingQuery.data?.data ?? []) : []),
    [hasPending, pendingQuery.data],
  );

  const value = useMemo<DevelopersContextType>(
    () => ({
      state,
      dispatch,
      pendingDevelopers,
      roleOptions,
      currentUserId: user?.id,
      canManageDevelopers,
      permissionsFor,
      setStatusFilter,
      setRoleFilter,
      setSearch,
      setPage,
      openDialog,
      closeDialog,
      patchForm,
      refresh,
      submitDialog,
    }),
    [
      state,
      pendingDevelopers,
      roleOptions,
      user?.id,
      canManageDevelopers,
      permissionsFor,
      setStatusFilter,
      setRoleFilter,
      setSearch,
      setPage,
      openDialog,
      closeDialog,
      patchForm,
      refresh,
      submitDialog,
    ],
  );

  return (
    <DevelopersContext.Provider value={value}>
      {children}
    </DevelopersContext.Provider>
  );
}

export function useDevelopersContext(): DevelopersContextType {
  const context = useContext(DevelopersContext);
  if (!context) {
    throw new Error(
      "useDevelopersContext must be used within a DevelopersProvider",
    );
  }
  return context;
}

export * from "@/features/developers/context/reducer";
export * from "@/features/developers/context/action";
export * from "@/features/developers/context/api";
export * from "@/features/developers/context/hooks";
