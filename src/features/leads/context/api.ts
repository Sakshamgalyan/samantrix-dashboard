import { apiClient } from "@/lib/api-client/apiClient";
import { dashboardApi } from "@/store";
import { pageParams, type PageQueryParams } from "@/features/common/pagination";
import type {
  Assignee,
  BatchInviteResponse,
  CreateQuoteRequest,
  LeadActivitiesPage,
  LeadDetail,
  LeadQuote,
  LeadsFilters,
  LeadsPage,
  LeadsSummary,
  PricePlan,
  QuoteStatus,
  UpdateLeadRequest,
  WaitlistFilters,
  WaitlistPage,
} from "@/features/leads/types";
import type { LeadActivityFormValues, LeadEmailFormValues } from "@/features/leads/types";

/** Query string for one page of the list (also the CSV export, minus page/limit). */
export function leadsQuery(filters: LeadsFilters, page = filters.page): PageQueryParams {
  const named = filters.view === "OPEN" || filters.view === "FOLLOW_UP_DUE";
  const followUps = filters.view === "FOLLOW_UP_DUE";
  return pageParams(page, {
    view: named ? filters.view : undefined,
    status: named ? undefined : filters.view,
    type: filters.type,
    assignedToId: filters.assignee,
    search: filters.search,
    sortBy: followUps ? "nextFollowUpAt" : undefined,
    sortOrder: followUps ? "asc" : undefined,
  });
}

/** Query string for one page of the waitlist queue. */
export function waitlistQuery(filters: WaitlistFilters): PageQueryParams {
  return pageParams(filters.page, { status: filters.status, search: filters.search });
}

/** Cache tag of one lead's timeline (refetched whenever something is logged on it). */
const timelineTag = (id: string) => ({ type: "LeadDetail" as const, id: `${id}:activities` });

/** Downloads the CSV for the current filters (all pages). A one-off download, so not cached. */
export async function downloadLeadsCsv(filters: LeadsFilters): Promise<void> {
  const params = leadsQuery(filters, 1);
  delete params.page;
  delete params.limit;
  // The raw axios instance: the CSV isn't wrapped in the JSON envelope
  const blob = await apiClient.get<Blob, Blob>("/leads/export", {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Simantrix-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Lookups that rarely change stay cached for an hour. */
const LOOKUP_CACHE_SECONDS = 60 * 60;

/** Cached lead queries; the admin overview reads the same entries as the Leads page. */
export const leadsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getLeadsSummary: build.query<LeadsSummary, void>({
      query: () => "/leads/summary",
      providesTags: ["Leads"],
    }),

    /** One page of leads for the given query string (see {@link leadsQuery} / `pageParams`). */
    getLeads: build.query<LeadsPage, PageQueryParams>({
      query: (params) => ({ url: "/leads", params }),
      providesTags: ["Leads"],
    }),

    /** One lead with its recent quotes (the detail drawer). */
    getLead: build.query<LeadDetail, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (_result, _error, id) => [{ type: "LeadDetail", id }],
    }),

    /** One page of a lead's timeline, newest first. */
    getLeadActivities: build.query<LeadActivitiesPage, { id: string; page: number }>({
      query: ({ id, page }) => ({ url: `/leads/${id}/activities`, params: pageParams(page) }),
      providesTags: (_result, _error, { id }) => [timelineTag(id)],
    }),

    /** One page of the early-access waitlist queue (see {@link waitlistQuery}). */
    getWaitlist: build.query<WaitlistPage, PageQueryParams>({
      query: (params) => ({ url: "/leads/waitlist/queue", params }),
      providesTags: ["Waitlist"],
    }),

    /** Developers a lead can be assigned to. */
    getLeadAssignees: build.query<Assignee[], void>({
      query: () => "/leads/assignees",
      keepUnusedDataFor: LOOKUP_CACHE_SECONDS,
    }),

    /** Plan price list used when building a quote. */
    getLeadPlans: build.query<PricePlan[], void>({
      query: () => "/leads/plans",
      providesTags: ["Plans"],
      keepUnusedDataFor: LOOKUP_CACHE_SECONDS,
    }),

    /** Edit deal fields / status / assignee. Returns the full lead, written straight into its cache. */
    updateLead: build.mutation<LeadDetail, { id: string; body: UpdateLeadRequest }>({
      query: ({ id, body }) => ({ url: `/leads/${id}`, method: "PATCH", body }),
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        upsertDetail(dispatch, queryFulfilled),
      // A status change also moves waitlist rows and is logged on the timeline
      invalidatesTags: (_result, _error, { id }) => ["Leads", "Waitlist", timelineTag(id)],
    }),

    /** Log a note, call or meeting. Returns the lead. */
    logLeadActivity: build.mutation<LeadDetail, { id: string; values: LeadActivityFormValues }>({
      query: ({ id, values }) => ({ url: `/leads/${id}/activities`, method: "POST", body: values }),
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        upsertDetail(dispatch, queryFulfilled),
      invalidatesTags: (_result, _error, { id }) => ["Leads", timelineTag(id)],
    }),

    /** Email the lead (logged on its timeline). Returns the lead. */
    sendLeadEmail: build.mutation<LeadDetail, { id: string; values: LeadEmailFormValues }>({
      query: ({ id, values }) => ({ url: `/leads/${id}/email`, method: "POST", body: values }),
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        upsertDetail(dispatch, queryFulfilled),
      invalidatesTags: (_result, _error, { id }) => ["Leads", timelineTag(id)],
    }),

    /** Create a quote, optionally sending it straight away (one cache invalidation for both steps). */
    createLeadQuote: build.mutation<LeadQuote, { leadId: string; body: CreateQuoteRequest; send: boolean }>({
      async queryFn({ leadId, body, send }, _api, _extraOptions, baseQuery) {
        const created = await baseQuery({ url: `/leads/${leadId}/quotes`, method: "POST", body });
        if (created.error) return { error: created.error };
        const quote = created.data as LeadQuote;
        if (!send) return { data: quote };
        const sent = await baseQuery({ url: `/leads/quotes/${quote.id}/send`, method: "POST" });
        return sent.error ? { error: sent.error } : { data: sent.data as LeadQuote };
      },
      // Also on failure: the quote may exist even if sending it failed
      invalidatesTags: (_result, _error, { leadId }) => [
        "Leads",
        { type: "LeadDetail", id: leadId },
        timelineTag(leadId),
      ],
    }),

    /** Send a draft quote. */
    sendLeadQuote: build.mutation<LeadQuote, { quoteId: string; leadId: string }>({
      query: ({ quoteId }) => ({ url: `/leads/quotes/${quoteId}/send`, method: "POST" }),
      invalidatesTags: (_result, _error, { leadId }) => [
        "Leads",
        { type: "LeadDetail", id: leadId },
        timelineTag(leadId),
      ],
    }),

    /** Accept / reject / expire a quote (accepting marks the lead won). */
    setLeadQuoteStatus: build.mutation<LeadQuote, { quoteId: string; leadId: string; status: QuoteStatus }>({
      query: ({ quoteId, status }) => ({
        url: `/leads/quotes/${quoteId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { leadId }) => [
        "Leads",
        { type: "LeadDetail", id: leadId },
        timelineTag(leadId),
      ],
    }),

    /** Delete a lead with its timeline and quotes. Its detail entry is dropped, not refetched. */
    deleteLead: build.mutation<void, string>({
      query: (id) => ({ url: `/leads/${id}`, method: "DELETE" }),
      invalidatesTags: ["Leads", "Waitlist"],
    }),

    /** Invite the selected waitlist entries (marks them contacted). */
    inviteWaitlist: build.mutation<BatchInviteResponse, string[]>({
      query: (ids) => ({ url: "/leads/waitlist/batch-invite", method: "POST", body: { ids } }),
      invalidatesTags: (_result, _error, ids) => [
        "Leads",
        "Waitlist",
        ...ids.flatMap((id) => [{ type: "LeadDetail" as const, id }, timelineTag(id)]),
      ],
    }),
  }),
});

/** Writes a mutation's returned lead into its `getLead` cache entry (no extra request). */
async function upsertDetail(
  dispatch: (action: unknown) => unknown,
  queryFulfilled: Promise<{ data: LeadDetail }>,
): Promise<void> {
  try {
    const { data } = await queryFulfilled;
    dispatch(leadsApi.util.upsertQueryData("getLead", data.id, data));
  } catch {
    // The caller shows the error; the cached lead stays as it was
  }
}

export const {
  useGetLeadsSummaryQuery,
  useGetLeadsQuery,
  useGetLeadQuery,
  useGetLeadActivitiesQuery,
  useGetWaitlistQuery,
  useGetLeadAssigneesQuery,
  useGetLeadPlansQuery,
  useUpdateLeadMutation,
  useLogLeadActivityMutation,
  useSendLeadEmailMutation,
  useCreateLeadQuoteMutation,
  useSendLeadQuoteMutation,
  useSetLeadQuoteStatusMutation,
  useDeleteLeadMutation,
  useInviteWaitlistMutation,
} = leadsApi;
