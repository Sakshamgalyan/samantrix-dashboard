"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { pageParams } from "@/features/common/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import { hasPermission, isSuperadmin } from "@/utils/roles";
import type {
  AdminOrganization,
  AssignSubscriptionRequest,
  CreateOrganizationRequest,
  OrganizationProfileInput,
  OrganizationsContextType,
  OrganizationsState,
  PlanFilter,
  SettableOrgStatus,
  StatusTab,
} from "@/features/organizations/types";
import { initialOrganizationsState, organizationsReducer } from "@/features/organizations/context/reducer";
import * as actions from "@/features/organizations/context/action";
import {
  LONG_LIVED_QUERY,
  useAssignSubscriptionMutation,
  useCreateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetAdminOrganizationsQuery,
  useGetAdminOrganizationsSummaryQuery,
  useGetAdminPlansQuery,
  useGetOrganizationDetailQuery,
  useLazyGetOrganizationDetailQuery,
  useUpdateOrganizationMutation,
  useUpdateOrganizationStatusMutation,
} from "@/features/organizations/context/api";

const LIST_POLLING = {
  pollingInterval: POLL_INTERVAL_MS,
  skipPollingIfUnfocused: true,
} as const;


export const OrganizationsContext = createContext<
  OrganizationsContextType | undefined
>(undefined);

export function OrganizationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [ui, dispatch] = useReducer(
    organizationsReducer,
    initialOrganizationsState,
  );

  const canManage = hasPermission(user, "organizations:manage");
  const canHardDelete = isSuperadmin(user);

  // Counts are shared with the admin overview: one request, one cache entry, refreshed every minute
  const summaryQuery = useGetAdminOrganizationsSummaryQuery(undefined, LIST_POLLING);
  // One server-filtered page (the backend maps TRIAL / CANCELLED to their status groups);
  // page 1 without filters is the same cache entry as the overview's recent organizations
  const listQuery = useGetAdminOrganizationsQuery(
    pageParams(ui.page, {
      status: ui.tab,
      planTier: ui.plan,
      search: ui.appliedSearch,
    }),
    LIST_POLLING,
  );
  // The detail dialog and the edit-form prefill read the same per-organization cache entry
  const detailQuery = useGetOrganizationDetailQuery(ui.detailOrgId ?? skipToken);
  const [loadDetail] = useLazyGetOrganizationDetailQuery();
  // Plans are only needed by the subscription form; cached long-term once loaded
  const plansQuery = useGetAdminPlansQuery(undefined, {
    ...LONG_LIVED_QUERY,
    skip: !ui.subscriptionDialog,
  });

  const [updateOrganizationStatus] = useUpdateOrganizationStatusMutation();
  const [createOrganization] = useCreateOrganizationMutation();
  const [updateOrganization] = useUpdateOrganizationMutation();
  const [assignSubscription] = useAssignSubscriptionMutation();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const { refetch: refetchSummary } = summaryQuery;
  const { refetch: refetchList } = listQuery;

  // Copy the typed search into the query after a short pause
  const debouncedSearch = useDebounce(ui.search, 350);
  useEffect(() => {
    dispatch(actions.applySearch(debouncedSearch.trim()));
  }, [debouncedSearch]);
  const { refetch: refetchDetail } = detailQuery;

  // Keep the last good data on screen; components show the error only when nothing is cached
  const state = useMemo<OrganizationsState>(
    () => ({
      ...ui,
      summary: summaryQuery.data ?? null,
      error: summaryQuery.error
        ? queryErrorMessage(summaryQuery.error, "Couldn't load organizations.")
        : null,
      rows: listQuery.data?.data ?? [],
      meta: listQuery.data?.meta ?? null,
      // Old rows stay up while another page/filter loads; skeleton only when there's nothing to show
      listLoading:
        listQuery.isFetching && !listQuery.currentData && !listQuery.data?.data.length,
      detail: ui.detailOrgId
        ? {
            orgId: ui.detailOrgId,
            data: detailQuery.currentData ?? null,
            loading: detailQuery.isFetching,
            error: detailQuery.error
              ? queryErrorMessage(detailQuery.error, "Couldn't load this organization.")
              : null,
          }
        : null,
      // A failed plan lookup still opens the form (with no plans to pick from)
      plans: plansQuery.data ?? (plansQuery.isError ? [] : null),
    }),
    [
      ui,
      summaryQuery.data,
      summaryQuery.error,
      listQuery.data,
      listQuery.currentData,
      listQuery.isFetching,
      detailQuery.currentData,
      detailQuery.isFetching,
      detailQuery.error,
      plansQuery.data,
      plansQuery.isError,
    ],
  );

  const refresh = useCallback(() => {
    dispatch(actions.setRefreshing(true));
    const pending: Promise<unknown>[] = [refetchSummary(), refetchList()];
    if (ui.detailOrgId) pending.push(refetchDetail());
    void Promise.allSettled(pending).then(() =>
      dispatch(actions.setRefreshing(false)),
    );
  }, [refetchSummary, refetchList, refetchDetail, ui.detailOrgId]);

  const setTab = useCallback(
    (tab: StatusTab) => dispatch(actions.setTab(tab)),
    [],
  );
  const setPlan = useCallback(
    (plan: PlanFilter) => dispatch(actions.setPlan(plan)),
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

  const openDetail = useCallback(
    (orgId: string) => {
      // Re-opening the same organization (e.g. "Try again") refetches it
      if (orgId === ui.detailOrgId) void refetchDetail();
      else dispatch(actions.openDetail(orgId));
    },
    [ui.detailOrgId, refetchDetail],
  );

  const closeDetail = useCallback(() => dispatch(actions.closeDetail()), []);

  // ── Status ─────────────────────────────────────────────────────────────
  const openStatusDialog = useCallback(
    (org: AdminOrganization, target: SettableOrgStatus) =>
      dispatch(actions.openStatusDialog(org, target)),
    [],
  );

  const setStatusReason = useCallback(
    (reason: string) => dispatch(actions.setStatusReason(reason)),
    [],
  );

  const closeStatusDialog = useCallback(() => {
    if (!state.statusDialog?.submitting) dispatch(actions.closeStatusDialog());
  }, [state.statusDialog?.submitting]);

  const submitStatusChange = useCallback(async () => {
    const dialog = state.statusDialog;
    if (!dialog) return;
    dispatch(actions.setStatusSubmitting(true));
    try {
      const reason = dialog.reason.trim();
      await updateOrganizationStatus({
        orgId: dialog.org.id,
        body: { status: dialog.target, ...(reason ? { reason } : {}) },
      }).unwrap();
      toast.success(
        dialog.target === "SUSPENDED"
          ? `${dialog.org.name} is suspended.`
          : `${dialog.org.name} is active.`,
      );
      // The mutation invalidates the list and this organization's detail for every screen
      dispatch(actions.closeStatusDialog());
    } catch (err) {
      dispatch(actions.setStatusSubmitting(false));
      toast.error(
        queryErrorMessage(err, "That status change failed. Please try again."),
      );
    }
  }, [state.statusDialog, updateOrganizationStatus, toast]);

  // ── Create / edit ──────────────────────────────────────────────────────
  const openCreate = useCallback(
    () => dispatch(actions.setFormDialog({ mode: "create", org: null })),
    [],
  );

  const openEdit = useCallback(
    async (orgId: string) => {
      try {
        // Reuses the cached detail (e.g. the open detail dialog) instead of fetching again
        const org = await loadDetail(orgId, true).unwrap();
        dispatch(actions.setFormDialog({ mode: "edit", org }));
      } catch (err) {
        toast.error(queryErrorMessage(err, "Couldn't open this organization."));
      }
    },
    [loadDetail, toast],
  );

  const closeForm = useCallback(() => dispatch(actions.setFormDialog(null)), []);

  const submitCreate = useCallback(
    async (body: CreateOrganizationRequest) => {
      try {
        const created = await createOrganization(body).unwrap();
        toast.success(
          created.ownerCreated
            ? `${created.name} created. The owner was emailed how to set a password.`
            : `${created.name} created.`,
        );
        dispatch(actions.setFormDialog(null));
        return true;
      } catch (err) {
        toast.error(
          queryErrorMessage(err, "Couldn't create the organization."),
        );
        return false;
      }
    },
    [createOrganization, toast],
  );

  const submitEdit = useCallback(
    async (orgId: string, body: Partial<OrganizationProfileInput>) => {
      try {
        const updated = await updateOrganization({ orgId, body }).unwrap();
        toast.success(`${updated.name} saved.`);
        dispatch(actions.setFormDialog(null));
        return true;
      } catch (err) {
        toast.error(queryErrorMessage(err, "Couldn't save your changes."));
        return false;
      }
    },
    [updateOrganization, toast],
  );

  // ── Subscription ───────────────────────────────────────────────────────
  // Opening the dialog subscribes the cached plans query
  const openSubscription = useCallback(
    (org: AdminOrganization) => dispatch(actions.setSubscriptionDialog(org)),
    [],
  );

  const closeSubscription = useCallback(
    () => dispatch(actions.setSubscriptionDialog(null)),
    [],
  );

  const submitSubscription = useCallback(
    async (orgId: string, body: AssignSubscriptionRequest) => {
      try {
        const result = await assignSubscription({ orgId, body }).unwrap();
        toast.success(`Subscription updated for ${result.name}.`);
        dispatch(actions.setSubscriptionDialog(null));
        return true;
      } catch (err) {
        toast.error(
          queryErrorMessage(err, "Couldn't assign the subscription."),
        );
        return false;
      }
    },
    [assignSubscription, toast],
  );

  // ── Delete ─────────────────────────────────────────────────────────────
  const openDelete = useCallback(
    (org: AdminOrganization) => dispatch(actions.setDeleteDialog(org)),
    [],
  );

  const closeDelete = useCallback(
    () => dispatch(actions.setDeleteDialog(null)),
    [],
  );

  const submitDelete = useCallback(
    async (orgId: string, hard: boolean) => {
      try {
        const result = await deleteOrganization({ orgId, hard }).unwrap();
        toast.success(
          result.deleted === "hard"
            ? `${result.name} was permanently deleted.`
            : `${result.name} was deleted.`,
        );
        dispatch(actions.setDeleteDialog(null));
        // A permanently deleted organization has no detail left to show
        if (hard) dispatch(actions.closeDetail());
        return true;
      } catch (err) {
        toast.error(
          queryErrorMessage(err, "Couldn't delete the organization."),
        );
        return false;
      }
    },
    [deleteOrganization, toast],
  );

  const value = useMemo<OrganizationsContextType>(
    () => ({
      state,
      dispatch,
      canManage,
      canHardDelete,
      refresh,
      setTab,
      setPlan,
      setSearch,
      setPage,
      openDetail,
      closeDetail,
      openStatusDialog,
      setStatusReason,
      closeStatusDialog,
      submitStatusChange,
      openCreate,
      openEdit,
      closeForm,
      submitCreate,
      submitEdit,
      openSubscription,
      closeSubscription,
      submitSubscription,
      openDelete,
      closeDelete,
      submitDelete,
    }),
    [
      state,
      canManage,
      canHardDelete,
      refresh,
      setTab,
      setPlan,
      setSearch,
      setPage,
      openDetail,
      closeDetail,
      openStatusDialog,
      setStatusReason,
      closeStatusDialog,
      submitStatusChange,
      openCreate,
      openEdit,
      closeForm,
      submitCreate,
      submitEdit,
      openSubscription,
      closeSubscription,
      submitSubscription,
      openDelete,
      closeDelete,
      submitDelete,
    ],
  );

  return (
    <OrganizationsContext.Provider value={value}>
      {children}
    </OrganizationsContext.Provider>
  );
}

export function useOrganizationsContext(): OrganizationsContextType {
  const ctx = useContext(OrganizationsContext);
  if (!ctx) {
    throw new Error(
      "useOrganizationsContext must be used within an OrganizationsProvider",
    );
  }
  return ctx;
}

export * from "@/features/organizations/context/hooks";
