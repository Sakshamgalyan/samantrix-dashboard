"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAutoRefresh } from "@/components/admin";
import { ROLE_DIALOGS, ROLE_OPTIONS, roleLabel } from "../common/constants";
import type {
  DeveloperDialog,
  DevelopersContextType,
  DeveloperTab,
} from "../types";
import { developersReducer, initialDevelopersState } from "./reducer";
import * as actions from "./action";
import {
  approveDeveloperApi,
  loadDevelopersApi,
  rejectDeveloperApi,
} from "./api";

const DevelopersContext = createContext<DevelopersContextType | undefined>(
  undefined,
);

export function DevelopersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const actorIsSuperadmin = user?.platformRole === "SUPERADMIN";

  // All page state lives in the reducer
  const [state, dispatch] = useReducer(
    developersReducer,
    initialDevelopersState,
  );

  const load = useCallback(() => loadDevelopersApi(dispatch), []);
  useAutoRefresh(load);

  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    await load();
  }, [load]);

  const roleOptions = useMemo(
    () =>
      ROLE_OPTIONS.filter((r) => actorIsSuperadmin || r.value !== "SUPERADMIN"),
    [actorIsSuperadmin],
  );

  const setTab = useCallback(
    (tab: DeveloperTab) => dispatch(actions.setTab(tab)),
    [],
  );
  const setSearch = useCallback(
    (search: string) => dispatch(actions.setSearch(search)),
    [],
  );
  const setRole = useCallback(
    (role: string) => dispatch(actions.setRole(role)),
    [],
  );
  const closeDialog = useCallback(() => dispatch(actions.closeDialog()), []);

  const openDialog = useCallback(
    (dialog: DeveloperDialog) => {
      const current = dialog.dev.platformRole;
      const role =
        ROLE_DIALOGS.has(dialog.kind) &&
        roleOptions.some((r) => r.value === current)
          ? current
          : "USER";
      dispatch(actions.openDialog(dialog, role));
    },
    [roleOptions],
  );

  const submitDialog = useCallback(async () => {
    const { dialog, selectedRole } = state;
    if (!dialog) return;
    const { dev, kind } = dialog;

    dispatch(actions.setSubmitting(true));
    try {
      if (kind === "reject" || kind === "revoke") {
        await rejectDeveloperApi(dev.id);
        toast.success(
          kind === "revoke"
            ? `Revoked access for ${dev.fullName}.`
            : `Rejected ${dev.fullName}'s request.`,
        );
      } else {
        await approveDeveloperApi(dev.id, selectedRole);
        toast.success(
          kind === "role"
            ? `${dev.fullName} is now ${roleLabel(selectedRole)}.`
            : `Approved ${dev.fullName} as ${roleLabel(selectedRole)}.`,
        );
      }
      dispatch(actions.setSubmitting(false));
      dispatch(actions.closeDialog());
      await load();
    } catch (err) {
      dispatch(actions.setSubmitting(false));
      toast.error(
        err instanceof ApiError
          ? err.message
          : "That action failed. Please try again.",
      );
    }
  }, [state, toast, load]);

  const visibleDevelopers = useMemo(() => {
    const term = state.search.trim().toLowerCase();
    return (state.data?.developers ?? []).filter(
      (d) =>
        (state.tab === "ALL" || d.status === state.tab) &&
        (!term ||
          d.fullName.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term)),
    );
  }, [state.data, state.tab, state.search]);

  const onlineCount = useMemo(
    () => state.data?.developers.filter((d) => d.online).length ?? 0,
    [state.data],
  );

  const value = useMemo<DevelopersContextType>(
    () => ({
      state,
      dispatch,
      visibleDevelopers,
      onlineCount,
      roleOptions,
      currentUserId: user?.id,
      actorIsSuperadmin,
      setTab,
      setSearch,
      openDialog,
      closeDialog,
      setRole,
      refresh,
      submitDialog,
    }),
    [
      state,
      visibleDevelopers,
      onlineCount,
      roleOptions,
      user?.id,
      actorIsSuperadmin,
      setTab,
      setSearch,
      openDialog,
      closeDialog,
      setRole,
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

export * from "./reducer";
export * from "./action";
export * from "./api";
