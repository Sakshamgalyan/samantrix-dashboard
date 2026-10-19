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
import { useDebounce } from "@/hooks/use-debounce";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import { hasPermission } from "@/utils/roles";
import type {
  Assignee,
  CreateQuoteRequest,
  DetailDialog,
  LeadActivityFormValues,
  LeadEmailFormValues,
  LeadsContextType,
  LeadsFilters,
  LeadsPageState,
  LeadsTab,
  PricePlan,
  QuoteStatus,
  UpdateLeadRequest,
  LeadActivity,
  WaitlistEntry,
  WaitlistFilters,
} from "@/features/leads/types";
import { initialLeadsState, leadsReducer } from "@/features/leads/context/reducer";
import * as actions from "@/features/leads/context/action";
import {
  downloadLeadsCsv,
  leadsQuery,
  waitlistQuery,
  useGetLeadActivitiesQuery,
  useCreateLeadQuoteMutation,
  useDeleteLeadMutation,
  useGetLeadAssigneesQuery,
  useGetLeadPlansQuery,
  useGetLeadQuery,
  useGetLeadsQuery,
  useGetLeadsSummaryQuery,
  useGetWaitlistQuery,
  useInviteWaitlistMutation,
  useLogLeadActivityMutation,
  useSendLeadEmailMutation,
  useSendLeadQuoteMutation,
  useSetLeadQuoteStatusMutation,
  useUpdateLeadMutation,
} from "@/features/leads/context/api";

export const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

const POLL = { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true } as const;
/** Assignees and plan prices rarely change: served from cache, never polled. */
const LOOKUP = { refetchOnMountOrArgChange: false } as const;

const NO_ASSIGNEES: Assignee[] = [];
const NO_PLANS: PricePlan[] = [];
const NO_WAITLIST: WaitlistEntry[] = [];
const NO_ACTIVITIES: LeadActivity[] = [];

export const LeadsProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const permissions = useMemo(
    () => ({
      canWork: hasPermission(user, "leads:work"),
      canDelete: hasPermission(user, "leads:delete"),
    }),
    [user],
  );

  const [ui, dispatch] = useReducer(leadsReducer, initialLeadsState);
  const { filters, waitlistFilters, tab, detailId, timelinePage } = ui;

  // ── Server data (shared cache; the summary is also read by the admin overview) ──
  // One request per dataset on screen: the waitlist only on its tab, the timeline and plan
  // prices only while a lead is open, assignees only where an owner picker shows.

  const listArgs = useMemo(() => leadsQuery(filters), [filters]);
  const waitlistArgs = useMemo(() => waitlistQuery(waitlistFilters), [waitlistFilters]);
  const summaryQuery = useGetLeadsSummaryQuery(undefined, POLL);
  const listQuery = useGetLeadsQuery(listArgs, { ...POLL, skip: tab !== "pipeline" });
  const waitlistQueryState = useGetWaitlistQuery(waitlistArgs, { ...POLL, skip: tab !== "waitlist" });
  const detailQuery = useGetLeadQuery(detailId ?? skipToken, POLL);
  const timelineQuery = useGetLeadActivitiesQuery(
    detailId ? { id: detailId, page: timelinePage } : skipToken,
    POLL,
  );
  const assigneesQuery = useGetLeadAssigneesQuery(undefined, {
    ...LOOKUP,
    skip: tab !== "pipeline" && !detailId,
  });
  const plansQuery = useGetLeadPlansQuery(undefined, {
    ...LOOKUP,
    skip: !detailId || !permissions.canWork,
  });

  const [updateLeadMutation] = useUpdateLeadMutation();
  const [logActivityMutation] = useLogLeadActivityMutation();
  const [sendEmailMutation] = useSendLeadEmailMutation();
  const [createQuoteMutation] = useCreateLeadQuoteMutation();
  const [sendQuoteMutation] = useSendLeadQuoteMutation();
  const [setQuoteStatusMutation] = useSetLeadQuoteStatusMutation();
  const [deleteLeadMutation] = useDeleteLeadMutation();
  const [inviteWaitlistMutation] = useInviteWaitlistMutation();

  // Keep the last good data on screen; errors only matter when there is nothing to show
  const state = useMemo<LeadsPageState>(() => {
    const page = listQuery.data;
    const waitlistPage = waitlistQueryState.data;
    const waitlist = waitlistPage?.data ?? NO_WAITLIST;
    // The drawer only ever shows the lead that is open, never the previous one
    const lead = detailQuery.currentData ?? null;
    const timeline = timelineQuery.currentData;
    return {
      ...ui,
      summary: summaryQuery.data ?? null,
      items: page?.data ?? [],
      meta: page?.meta ?? null,
      // Old rows stay up while another page/filter loads; skeleton only when there's nothing to show
      listLoading: listQuery.isFetching && !listQuery.currentData && !page?.data.length,
      listError: listQuery.error ? queryErrorMessage(listQuery.error, "Couldn't load leads.") : null,
      assignees: assigneesQuery.data ?? NO_ASSIGNEES,
      plans: plansQuery.data ?? NO_PLANS,
      waitlist,
      waitlistMeta: waitlistPage?.meta ?? null,
      // Old rows stay up while another page/filter loads
      waitlistLoading: waitlistQueryState.isFetching && !waitlistQueryState.currentData && !waitlist.length,
      waitlistError: waitlistQueryState.error
        ? queryErrorMessage(waitlistQueryState.error, "Couldn't load the waitlist.")
        : null,
      // Drop selections that are no longer on the page
      selectedWaitlistIds: waitlistPage
        ? ui.selectedWaitlistIds.filter((id) => waitlist.some((w) => w.id === id))
        : ui.selectedWaitlistIds,
      timeline: {
        items: timeline?.data ?? NO_ACTIVITIES,
        meta: timeline?.meta ?? null,
        loading: !timeline && timelineQuery.isFetching,
        error:
          !timeline && timelineQuery.error
            ? queryErrorMessage(timelineQuery.error, "Couldn't load the timeline.")
            : null,
      },
      detail: detailId
        ? {
            id: detailId,
            lead,
            loading: !lead && detailQuery.isFetching,
            error:
              !lead && detailQuery.error
                ? queryErrorMessage(detailQuery.error, "Couldn't load this lead.")
                : null,
          }
        : null,
    };
  }, [
    ui,
    detailId,
    summaryQuery.data,
    listQuery.data,
    listQuery.currentData,
    listQuery.isFetching,
    listQuery.error,
    assigneesQuery.data,
    plansQuery.data,
    waitlistQueryState.data,
    waitlistQueryState.currentData,
    waitlistQueryState.isFetching,
    waitlistQueryState.error,
    detailQuery.currentData,
    detailQuery.isFetching,
    detailQuery.error,
    timelineQuery.currentData,
    timelineQuery.isFetching,
    timelineQuery.error,
  ]);

  // Copy the typed searches into the filters after a short pause
  const debouncedSearch = useDebounce(ui.searchInput, 350);
  useEffect(() => {
    dispatch(actions.applySearch(debouncedSearch.trim()));
  }, [debouncedSearch]);
  const debouncedWaitlistSearch = useDebounce(ui.waitlistSearchInput, 350);
  useEffect(() => {
    dispatch(actions.applyWaitlistSearch(debouncedWaitlistSearch.trim()));
  }, [debouncedWaitlistSearch]);

  // ── Simple setters ────────────────────────────────────────────────────────

  const setTab = useCallback((t: LeadsTab) => dispatch(actions.setTab(t)), []);
  const setFilters = useCallback(
    (f: Partial<Omit<LeadsFilters, "page">>) => dispatch(actions.setFilters(f)),
    [],
  );
  const setSearchInput = useCallback((v: string) => dispatch(actions.setSearchInput(v)), []);
  const setPage = useCallback((p: number) => dispatch(actions.setPage(p)), []);
  const setDialog = useCallback((d: DetailDialog) => dispatch(actions.setDialog(d)), []);
  const setWaitlistSelection = useCallback(
    (ids: string[]) => dispatch(actions.setWaitlistSelection(ids)),
    [],
  );
  const setWaitlistStatus = useCallback(
    (s: WaitlistFilters["status"]) => dispatch(actions.setWaitlistStatus(s)),
    [],
  );
  const setWaitlistSearchInput = useCallback(
    (v: string) => dispatch(actions.setWaitlistSearchInput(v)),
    [],
  );
  const setWaitlistPage = useCallback((p: number) => dispatch(actions.setWaitlistPage(p)), []);
  const setTimelinePage = useCallback((p: number) => dispatch(actions.setTimelinePage(p)), []);

  const refetchSummary = summaryQuery.refetch;
  const refetchList = listQuery.refetch;
  const refetchWaitlist = waitlistQueryState.refetch;
  const refresh = useCallback(async () => {
    dispatch(actions.setRefreshing(true));
    try {
      // A skipped query can't be refetched, so only the list of the tab that is showing
      await Promise.all([
        refetchSummary(),
        tab === "pipeline" ? refetchList() : refetchWaitlist(),
      ]);
    } finally {
      dispatch(actions.setRefreshing(false));
    }
  }, [refetchSummary, refetchList, refetchWaitlist, tab]);

  const exportCsv = useCallback(async () => {
    try {
      await downloadLeadsCsv(filters);
    } catch (err) {
      toast.error(queryErrorMessage(err, "Couldn't export leads."));
    }
  }, [filters, toast]);

  const openDetail = useCallback((id: string) => dispatch(actions.openDetail(id)), []);
  const closeDetail = useCallback(() => dispatch(actions.closeDetail()), []);

  // ── Mutations on the open lead ────────────────────────────────────────────

  /** Runs a mutation on the open lead; its tags refresh the lead, the list and the KPIs. */
  const mutate = useCallback(
    async (
      run: (id: string) => Promise<unknown>,
      success: string | null,
      failure: string,
    ): Promise<boolean> => {
      const id = detailId;
      if (!id) return false;
      dispatch(actions.setSaving(true));
      try {
        await run(id);
        if (success) toast.success(success);
        return true;
      } catch (err) {
        toast.error(queryErrorMessage(err, failure));
        return false;
      } finally {
        dispatch(actions.setSaving(false));
      }
    },
    [detailId, toast],
  );

  const updateLead = useCallback(
    (body: UpdateLeadRequest, successMessage = "Lead updated.") =>
      mutate(
        (id) => updateLeadMutation({ id, body }).unwrap(),
        successMessage,
        "Couldn't update the lead.",
      ),
    [mutate, updateLeadMutation],
  );

  const logActivity = useCallback(
    (values: LeadActivityFormValues) =>
      mutate(
        (id) => logActivityMutation({ id, values }).unwrap(),
        values.type === "NOTE" ? "Note added." : `${values.type === "CALL" ? "Call" : "Meeting"} logged.`,
        "Couldn't save that.",
      ),
    [mutate, logActivityMutation],
  );

  const sendEmail = useCallback(
    async (values: LeadEmailFormValues) => {
      const ok = await mutate(
        (id) => sendEmailMutation({ id, values }).unwrap(),
        "Email sent.",
        "Couldn't send the email.",
      );
      if (ok) dispatch(actions.setDialog(null));
      return ok;
    },
    [mutate, sendEmailMutation],
  );

  const createQuote = useCallback(
    async (body: CreateQuoteRequest, send: boolean) => {
      const ok = await mutate(
        (leadId) => createQuoteMutation({ leadId, body, send }).unwrap(),
        send ? "Quote created and sent." : "Quote saved as draft.",
        "Couldn't create the quote.",
      );
      if (ok) dispatch(actions.setDialog(null));
      return ok;
    },
    [mutate, createQuoteMutation],
  );

  const sendQuote = useCallback(
    (quoteId: string) =>
      mutate(
        (leadId) => sendQuoteMutation({ quoteId, leadId }).unwrap(),
        "Quote sent.",
        "Couldn't send the quote.",
      ),
    [mutate, sendQuoteMutation],
  );

  const setQuoteStatus = useCallback(
    (quoteId: string, status: QuoteStatus) =>
      mutate(
        (leadId) => setQuoteStatusMutation({ quoteId, leadId, status }).unwrap(),
        status === "ACCEPTED" ? "Quote accepted — lead marked won." : "Quote updated.",
        "Couldn't update the quote.",
      ),
    [mutate, setQuoteStatusMutation],
  );

  const deleteLead = useCallback(async () => {
    const id = detailId;
    if (!id) return false;
    dispatch(actions.setSaving(true));
    try {
      await deleteLeadMutation(id).unwrap();
      toast.success("Lead deleted.");
      dispatch(actions.closeDetail());
      return true;
    } catch (err) {
      toast.error(queryErrorMessage(err, "Couldn't delete the lead."));
      dispatch(actions.setSaving(false));
      return false;
    }
  }, [detailId, deleteLeadMutation, toast]);

  const selectedWaitlistIds = state.selectedWaitlistIds;
  const inviteWaitlist = useCallback(async () => {
    const ids = selectedWaitlistIds;
    if (ids.length === 0) return false;
    try {
      const res = await inviteWaitlistMutation(ids).unwrap();
      toast.success(
        `${res.invitedCount} invited${res.skippedCount ? `, ${res.skippedCount} skipped (already invited)` : ""}.`,
      );
      dispatch(actions.setWaitlistSelection([]));
      return true;
    } catch (err) {
      toast.error(queryErrorMessage(err, "Couldn't invite the selected people."));
      return false;
    }
  }, [selectedWaitlistIds, inviteWaitlistMutation, toast]);

  const value = useMemo<LeadsContextType>(
    () => ({
      state,
      dispatch,
      permissions,
      setTab,
      setFilters,
      setSearchInput,
      setPage,
      refresh,
      exportCsv,
      openDetail,
      closeDetail,
      setDialog,
      updateLead,
      logActivity,
      sendEmail,
      createQuote,
      sendQuote,
      setQuoteStatus,
      deleteLead,
      setWaitlistSelection,
      setWaitlistStatus,
      setWaitlistSearchInput,
      setWaitlistPage,
      setTimelinePage,
      inviteWaitlist,
      openWaitlistLead: openDetail,
      openLead: state.detail?.lead ?? null,
    }),
    [
      state,
      permissions,
      setTab,
      setFilters,
      setSearchInput,
      setPage,
      refresh,
      exportCsv,
      openDetail,
      closeDetail,
      setDialog,
      updateLead,
      logActivity,
      sendEmail,
      createQuote,
      sendQuote,
      setQuoteStatus,
      deleteLead,
      setWaitlistSelection,
      setWaitlistStatus,
      setWaitlistSearchInput,
      setWaitlistPage,
      setTimelinePage,
      inviteWaitlist,
    ],
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
};

export * from "@/features/leads/context/hooks";
