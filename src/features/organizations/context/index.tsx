"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/lib/auth-context";
import type {
  AdminOrganization,
  OrganizationsContextType,
  OrgStatus,
  SettableOrgStatus,
  StatusTab,
} from "../types";
import { initialOrganizationsState, organizationsReducer } from "./reducer";
import * as actions from "./action";
import {
  fetchOrganizationDetailApi,
  fetchOrganizationsApi,
  getApiErrorMessage,
  updateOrganizationStatusApi,
} from "./api";

/** Statuses each tab covers. */
const TAB_STATUSES: Record<Exclude<StatusTab, "ALL">, OrgStatus[]> = {
  ACTIVE: ["ACTIVE"],
  TRIAL: ["TRIAL", "TRIALING"],
  PENDING: ["PENDING"],
  SUSPENDED: ["SUSPENDED"],
  CANCELLED: ["CANCELLED", "DELETED"],
};

const OrganizationsContext = createContext<
  OrganizationsContextType | undefined
>(undefined);

export function OrganizationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    organizationsReducer,
    initialOrganizationsState,
  );

  const canManage =
    user?.platformRole === "SUPERADMIN" ||
    user?.platformRole === "PLATFORM_ADMIN";

  const load = useCallback(() => fetchOrganizationsApi(dispatch), []);

  const refresh = useCallback(() => {
    dispatch(actions.setRefreshing(true));
    void load();
  }, [load]);

  const setTab = useCallback(
    (tab: StatusTab) => dispatch(actions.setTab(tab)),
    [],
  );

  const setSearch = useCallback(
    (search: string) => dispatch(actions.setSearch(search)),
    [],
  );

  const openDetail = useCallback((orgId: string) => {
    dispatch(actions.openDetail(orgId));
    void fetchOrganizationDetailApi(orgId, dispatch);
  }, []);

  const closeDetail = useCallback(() => dispatch(actions.closeDetail()), []);

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
      await updateOrganizationStatusApi(dialog.org.id, {
        status: dialog.target,
        ...(reason ? { reason } : {}),
      });
      toast.success(
        dialog.target === "SUSPENDED"
          ? `${dialog.org.name} is suspended.`
          : `${dialog.org.name} is active again.`,
      );
      dispatch(actions.closeStatusDialog());
      await load();
      if (state.detail?.orgId === dialog.org.id) {
        void fetchOrganizationDetailApi(dialog.org.id, dispatch);
      }
    } catch (err) {
      dispatch(actions.setStatusSubmitting(false));
      toast.error(
        getApiErrorMessage(err, "That status change failed. Please try again."),
      );
    }
  }, [state.statusDialog, state.detail?.orgId, load, toast]);

  const visible = useMemo(() => {
    const term = state.search.trim().toLowerCase();
    return (state.data?.organizations ?? []).filter(
      (org) =>
        (state.tab === "ALL" || TAB_STATUSES[state.tab].includes(org.status)) &&
        (!term ||
          org.name.toLowerCase().includes(term) ||
          org.slug.toLowerCase().includes(term) ||
          org.owner.fullName.toLowerCase().includes(term) ||
          org.owner.email.toLowerCase().includes(term)),
    );
  }, [state.data, state.tab, state.search]);

  const value = useMemo<OrganizationsContextType>(
    () => ({
      state,
      dispatch,
      visible,
      canManage,
      load,
      refresh,
      setTab,
      setSearch,
      openDetail,
      closeDetail,
      openStatusDialog,
      setStatusReason,
      closeStatusDialog,
      submitStatusChange,
    }),
    [
      state,
      visible,
      canManage,
      load,
      refresh,
      setTab,
      setSearch,
      openDetail,
      closeDetail,
      openStatusDialog,
      setStatusReason,
      closeStatusDialog,
      submitStatusChange,
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
