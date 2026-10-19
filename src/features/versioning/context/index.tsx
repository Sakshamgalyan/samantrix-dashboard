"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { pageParams } from "@/features/common/pagination";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import { getDeveloperRole, hasPermission } from "@/utils/roles";
import { APP_META } from "@/features/versioning/common/constants";
import type {
  ReleaseListItem,
  AppFilter,
  ChannelFilter,
  ReleaseFormValues,
  StatusFilter,
  VersioningContextType,
  VersioningDialog,
  VersioningState,
} from "@/features/versioning/types";
import * as actions from "@/features/versioning/context/action";
import { initialVersioningState, versioningReducer } from "@/features/versioning/context/reducer";
import {
  toCreatePayload,
  toUpdatePayload,
  useCreateReleaseMutation,
  useDeleteReleaseMutation,
  useGetReleasesQuery,
  useGetVersioningSummaryQuery,
  useTransitionReleaseMutation,
  useUpdateReleaseMutation,
} from "@/features/versioning/context/api";

const POLLING = {
  pollingInterval: POLL_INTERVAL_MS,
  skipPollingIfUnfocused: true,
} as const;

const NO_RELEASES: ReleaseListItem[] = [];

export const VersioningContext = createContext<VersioningContextType | undefined>(
  undefined,
);

export const VersioningProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [ui, dispatch] = useReducer(
    versioningReducer,
    initialVersioningState,
  );

  // Two cached queries, refreshed every minute while the page is open: the summary (KPIs,
  // current versions, tab counts) and one page of the releases table
  const releaseArgs = pageParams(ui.page, {
    app: ui.appFilter,
    channel: ui.channelFilter,
    status: ui.statusFilter,
    search: ui.search.trim() || undefined,
  });
  const releasesQuery = useGetReleasesQuery(releaseArgs, POLLING);
  const summaryQuery = useGetVersioningSummaryQuery(undefined, POLLING);
  const { refetch: refetchReleases } = releasesQuery;
  const { refetch: refetchSummary } = summaryQuery;
  const [createRelease] = useCreateReleaseMutation();
  const [updateRelease] = useUpdateReleaseMutation();
  const [transitionRelease] = useTransitionReleaseMutation();
  const [deleteRelease] = useDeleteReleaseMutation();

  // Keep the last good data on screen; the page shows the error only before the first load
  const state = useMemo<VersioningState>(() => {
    const loadError = releasesQuery.error ?? summaryQuery.error;
    return {
      ...ui,
      releases: releasesQuery.data ?? null,
      releasesLoading: releasesQuery.isFetching && releasesQuery.currentData === undefined,
      summary: summaryQuery.data ?? null,
      loaded: releasesQuery.data !== undefined && summaryQuery.data !== undefined,
      error: loadError ? queryErrorMessage(loadError, "Couldn't load releases.") : null,
    };
  }, [
    ui,
    releasesQuery.data,
    releasesQuery.currentData,
    releasesQuery.isFetching,
    releasesQuery.error,
    summaryQuery.data,
    summaryQuery.error,
  ]);

  // Deleting the last row of the last page leaves it empty: step back to the new last page
  const totalPages = releasesQuery.currentData?.meta.totalPages;
  useEffect(() => {
    if (totalPages !== undefined && ui.page > totalPages) dispatch(actions.setPage(totalPages));
  }, [totalPages, ui.page]);

  const canManage = hasPermission(user, "versioning:manage") || hasPermission(user, "releases:manage");
  const role = getDeveloperRole(user);
  const canDelete = role === "SUPERADMIN" || role === "MANAGER";
  const [publishingId, setPublishingId] = useState<string | null>(null);

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
  const setSearch = useCallback((search: string) => {
    dispatch(actions.setSearch(search));
  }, []);
  const setPage = useCallback((page: number) => {
    dispatch(actions.setPage(page));
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
  const refresh = useCallback(() => {
    dispatch(actions.setRefreshing(true));
    void Promise.allSettled([refetchReleases(), refetchSummary()]).then(() =>
      dispatch(actions.setRefreshing(false)),
    );
  }, [refetchReleases, refetchSummary]);

  /**
   * Runs a mutation with the submitting flag set, then toasts and closes the dialog on success.
   * The mutation invalidates the cached releases + summary, which refetch once.
   */
  const run = useCallback(
    async (
      request: () => Promise<unknown>,
      fallback: string,
      success: string,
    ): Promise<boolean> => {
      dispatch(actions.setSubmitting(true));
      try {
        await request();
      } catch (err) {
        toast.error(queryErrorMessage(err, fallback));
        return false;
      } finally {
        dispatch(actions.setSubmitting(false));
      }
      toast.success(success);
      dispatch(actions.closeDialog());
      return true;
    },
    [toast],
  );

  const submitReleaseForm = useCallback(
    async (values: ReleaseFormValues) => {
      const dialog = state.dialog;
      const name = `${APP_META[values.app].label} ${values.version.trim()}`;
      if (dialog?.kind === "edit") {
        const { id } = dialog.release;
        const body = toUpdatePayload(dialog.release, values);
        return run(
          () => updateRelease({ id, body }).unwrap(),
          "Couldn't save the release.",
          `Saved ${name}.`,
        );
      }
      return run(
        () => createRelease(toCreatePayload(values)).unwrap(),
        "Couldn't create the release.",
        `Created draft ${name}.`,
      );
    },
    [state.dialog, run, updateRelease, createRelease],
  );

  const confirmAction = useCallback(async () => {
    const dialog = state.dialog;
    if (!dialog || dialog.kind === "create" || dialog.kind === "edit") return;
    const { release } = dialog;
    const name = `${APP_META[release.app].label} ${release.version}`;

    const transitionFailed = "Couldn't update the release status.";
    switch (dialog.kind) {
      case "rollout":
        await run(
          () =>
            transitionRelease({
              id: release.id,
              body: { status: "ROLLING_OUT", rolloutPercent: dialog.percent },
            }).unwrap(),
          transitionFailed,
          `${name} is rolling out to ${dialog.percent}%.`,
        );
        return;
      case "release":
        await run(
          () => transitionRelease({ id: release.id, body: { status: "RELEASED" } }).unwrap(),
          transitionFailed,
          `${name} is deployed live to 100% of production.`,
        );
        return;
      case "rollback":
        await run(
          () => transitionRelease({ id: release.id, body: { status: "ROLLED_BACK" } }).unwrap(),
          transitionFailed,
          `${name} was rolled back. Previous stable version restored.`,
        );
        return;
      case "delete":
        await run(
          () => deleteRelease(release.id).unwrap(),
          "Couldn't delete the release.",
          `Deleted ${name}.`,
        );
        return;
    }
  }, [state.dialog, run, transitionRelease, deleteRelease]);

  const setShowOnHome = useCallback(
    async (release: ReleaseListItem, showOnHome: boolean) => {
      setPublishingId(release.id);
      try {
        await updateRelease({ id: release.id, body: { showOnHome } }).unwrap();
      } catch (err) {
        toast.error(queryErrorMessage(err, "Couldn't update the website listing."));
        return;
      } finally {
        setPublishingId(null);
      }
      const name = `${APP_META[release.app].label} ${release.version}`;
      toast.success(
        showOnHome
          ? release.status === "RELEASED"
            ? `${name} is now on the website changelog.`
            : `${name} will appear on the website once released.`
          : `${name} was removed from the website changelog.`,
      );
    },
    [toast, updateRelease],
  );

  const value = useMemo<VersioningContextType>(
    () => ({
      state,
      dispatch,
      releases: state.releases?.data ?? NO_RELEASES,
      summary: state.summary,
      canManage,
      canDelete,
      publishingId,
      setAppFilter,
      setChannelFilter,
      setStatusFilter,
      setSearch,
      setPage,
      openDialog,
      closeDialog,
      setRolloutPercent,
      refresh,
      submitReleaseForm,
      confirmAction,
      setShowOnHome,
    }),
    [
      state,
      setPage,
      canManage,
      canDelete,
      publishingId,
      setShowOnHome,
      setAppFilter,
      setChannelFilter,
      setStatusFilter,
      setSearch,
      openDialog,
      closeDialog,
      setRolloutPercent,
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
};

export const useVersioningContext = (): VersioningContextType => {
  const ctx = useContext(VersioningContext);
  if (!ctx) {
    throw new Error(
      "useVersioningContext must be used within a VersioningProvider",
    );
  }
  return ctx;
};

export * from "@/features/versioning/context/hooks";
