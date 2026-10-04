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
import { APP_META } from "../common/constants";
import type {
  AppFilter,
  ChannelFilter,
  ReleaseFormValues,
  StatusFilter,
  VersioningContextType,
  VersioningDialog,
} from "../types";
import * as actions from "./action";
import { initialVersioningState, versioningReducer } from "./reducer";
import {
  createReleaseApi,
  deleteReleaseApi,
  fetchVersioningApi,
  transitionReleaseApi,
  updateReleaseApi,
} from "./api";

const VersioningContext = createContext<VersioningContextType | undefined>(
  undefined,
);

const MANAGER_ROLES = new Set(["SUPERADMIN", "PLATFORM_ADMIN"]);

export function VersioningProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    versioningReducer,
    initialVersioningState,
  );

  const canManage = Boolean(
    (user?.platformRole && MANAGER_ROLES.has(user.platformRole)) ||
      user?.role === "SUPERADMIN",
  );

  // ── Filters & dialogs ────────────────────────────────────────────────
  const setAppFilter = useCallback((filter: AppFilter) => {
    dispatch(actions.setAppFilter(filter));
  }, []);
  const setChannelFilter = useCallback((filter: ChannelFilter) => {
    dispatch(actions.setChannelFilter(filter));
  }, []);
  const setStatusFilter = useCallback((filter: StatusFilter) => {
    dispatch(actions.setStatusFilter(filter));
  }, []);
  const openDialog = useCallback((dialog: VersioningDialog) => {
    dispatch(actions.openDialog(dialog));
  }, []);
  const closeDialog = useCallback(() => {
    dispatch(actions.closeDialog());
  }, []);
  const setRolloutPercent = useCallback((percent: number) => {
    dispatch(actions.setRolloutPercent(percent));
  }, []);

  // ── API handlers ─────────────────────────────────────────────────────
  const load = useCallback(() => fetchVersioningApi(dispatch), []);

  const refresh = useCallback(() => {
    dispatch(actions.setRefreshing(true));
    void fetchVersioningApi(dispatch);
  }, []);

  /** Finishes a mutation: toast, close the dialog and reload on success. */
  const settle = useCallback(
    async (error: string | null, success: string) => {
      if (error) {
        toast.error(error);
        return false;
      }
      toast.success(success);
      dispatch(actions.closeDialog());
      await fetchVersioningApi(dispatch);
      return true;
    },
    [toast],
  );

  const submitReleaseForm = useCallback(
    async (values: ReleaseFormValues) => {
      const dialog = state.dialog;
      const name = `${APP_META[values.app].label} ${values.version.trim()}`;
      if (dialog?.kind === "edit") {
        const error = await updateReleaseApi(dialog.release.id, values, dispatch);
        return settle(error, `Saved ${name}.`);
      }
      const error = await createReleaseApi(values, dispatch);
      return settle(error, `Created draft ${name}.`);
    },
    [state.dialog, settle],
  );

  const confirmAction = useCallback(async () => {
    const dialog = state.dialog;
    if (!dialog || dialog.kind === "create" || dialog.kind === "edit") return;
    const { release } = dialog;
    const name = `${APP_META[release.app].label} ${release.version}`;

    switch (dialog.kind) {
      case "rollout": {
        const error = await transitionReleaseApi(
          release.id,
          { status: "ROLLING_OUT", rolloutPercent: dialog.percent },
          dispatch,
        );
        await settle(error, `${name} is rolling out to ${dialog.percent}%.`);
        return;
      }
      case "release": {
        const error = await transitionReleaseApi(
          release.id,
          { status: "RELEASED" },
          dispatch,
        );
        await settle(error, `${name} is released to everyone.`);
        return;
      }
      case "rollback": {
        const error = await transitionReleaseApi(
          release.id,
          { status: "ROLLED_BACK" },
          dispatch,
        );
        await settle(error, `${name} was rolled back.`);
        return;
      }
      case "delete": {
        const error = await deleteReleaseApi(release.id, dispatch);
        await settle(error, `Deleted draft ${name}.`);
        return;
      }
    }
  }, [state.dialog, settle]);

  const visibleReleases = useMemo(
    () =>
      state.releases.filter(
        (r) =>
          (state.appFilter === "ALL" || r.app === state.appFilter) &&
          (state.channelFilter === "ALL" || r.channel === state.channelFilter) &&
          (state.statusFilter === "ALL" || r.status === state.statusFilter),
      ),
    [state.releases, state.appFilter, state.channelFilter, state.statusFilter],
  );

  const value = useMemo<VersioningContextType>(
    () => ({
      state,
      dispatch,
      releases: state.releases,
      visibleReleases,
      summary: state.summary,
      canManage,
      setAppFilter,
      setChannelFilter,
      setStatusFilter,
      openDialog,
      closeDialog,
      setRolloutPercent,
      load,
      refresh,
      submitReleaseForm,
      confirmAction,
    }),
    [
      state,
      visibleReleases,
      canManage,
      setAppFilter,
      setChannelFilter,
      setStatusFilter,
      openDialog,
      closeDialog,
      setRolloutPercent,
      load,
      refresh,
      submitReleaseForm,
      confirmAction,
    ],
  );

  return (
    <VersioningContext.Provider value={value}>
      {children}
    </VersioningContext.Provider>
  );
}

export function useVersioningContext(): VersioningContextType {
  const ctx = useContext(VersioningContext);
  if (!ctx) {
    throw new Error(
      "useVersioningContext must be used within a VersioningProvider",
    );
  }
  return ctx;
}
