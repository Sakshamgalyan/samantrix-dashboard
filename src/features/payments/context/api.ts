import { dashboardApi, queryErrorMessage } from "@/store";
import type { PageQueryParams } from "@/features/common/pagination";
import type {
  ManualPaymentInput,
  OrganizationOptionsResponse,
  PaymentsConfig,
  PaymentsListResponse,
  PaymentsSummary,
  Plan,
  PlanCreateInput,
  PlansQuery,
  PlanTier,
  PlanUpdateInput,
  PlatformFeatureCatalogItem,
  SeatsResponse,
} from "@/features/payments/types";

/** Message of a failed request (an `.unwrap()` rejection or an `ApiError`), with a fallback. */
export const errorMessage = (err: unknown, fallback: string) =>
  queryErrorMessage(err, fallback);

/** Plans and payment config rarely change: keep them for an hour once loaded. */
const LOOKUP_CACHE_SECONDS = 3600;

/** Hook options for the long-lived lookups (reuse the cache instead of refetching on mount). */
export const LONG_LIVED_QUERY = { refetchOnMountOrArgChange: false } as const;

/** Every view that shows payments, seats, subscriptions or revenue. */
const PAYMENT_CHANGE_TAGS = [
  "Payments",
  "Revenue",
  "PlatformOverview",
  "Organizations",
  "OrganizationDetail",
  "Billing",
] as const;

/**
 * Cached finance queries. Paginated lists take `pageParams(...)`; the admin overview shares
 * `getPaymentsSummary()` and `getPayments(pageParams(1))` with the Payments page.
 */
export const paymentsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** KPI row: month collections, failed / open checkouts and platform seat totals. */
    getPaymentsSummary: build.query<PaymentsSummary, void>({
      query: () => "/finance/payments/summary",
      providesTags: ["Payments"],
    }),

    /** One page of payments (`pageParams(page, { status, provider, search, settled })`). */
    getPayments: build.query<PaymentsListResponse, PageQueryParams>({
      query: (params) => ({ url: "/finance/payments", params }),
      providesTags: ["Payments"],
    }),

    /** One page of organizations with seats bought vs used (`pageParams(page, { paidOnly, search })`). */
    getSeats: build.query<SeatsResponse, PageQueryParams>({
      query: (params) => ({ url: "/finance/seats", params }),
      providesTags: ["Payments"],
    }),

    /** Organization picker of the manual-payment form (`pageParams(1, { search })`). */
    getPaymentOrganizationOptions: build.query<OrganizationOptionsResponse, PageQueryParams>({
      query: (params) => ({ url: "/finance/organizations/options", params }),
      providesTags: ["Organizations"],
    }),

    /** Plan price list. Superadmins get inactive plans too unless `activeOnly`. */
    getFinancePlans: build.query<Plan[], PlansQuery | void>({
      query: (params) => ({ url: "/finance/plans", params: params ?? undefined }),
      providesTags: ["Plans"],
      keepUnusedDataFor: LOOKUP_CACHE_SECONDS,
    }),

    /** Razorpay availability and the GST rate. */
    getPaymentsConfig: build.query<PaymentsConfig, void>({
      query: () => "/finance/payments/config",
      keepUnusedDataFor: LOOKUP_CACHE_SECONDS,
    }),

    /** Platform feature definitions catalog from the master table / constants */
    getPlatformFeatureCatalog: build.query<PlatformFeatureCatalogItem[], void>({
      query: () => "/organizations/features/catalog",
      transformResponse: (res: PlatformFeatureCatalogItem[] | null) => res || [],
      keepUnusedDataFor: LOOKUP_CACHE_SECONDS,
    }),

    /** Records an offline payment; may also apply a plan / seats to the organization. */
    recordManualPayment: build.mutation<
      { paymentId: string; invoiceNumber: string | null },
      ManualPaymentInput
    >({
      query: (body) => ({ url: "/finance/payments/manual", method: "POST", body }),
      invalidatesTags: [...PAYMENT_CHANGE_TAGS],
    }),

    refundPayment: build.mutation<unknown, { paymentId: string; amount: number | undefined; reason: string }>({
      query: ({ paymentId, amount, reason }) => ({
        url: `/finance/payments/${paymentId}/refund`,
        method: "POST",
        body: { amount, reason },
      }),
      invalidatesTags: [...PAYMENT_CHANGE_TAGS],
    }),

    createPlan: build.mutation<Plan, PlanCreateInput>({
      query: (body) => ({ url: "/finance/plans", method: "POST", body }),
      invalidatesTags: ["Plans", "Revenue", "Billing"],
    }),

    updatePlan: build.mutation<Plan, { planTier: PlanTier; input: PlanUpdateInput }>({
      query: ({ planTier, input }) => ({ url: `/finance/plans/${planTier}`, method: "PUT", body: input }),
      invalidatesTags: ["Plans", "Revenue", "Billing"],
    }),
  }),
});

export const {
  useGetPaymentsSummaryQuery,
  useGetSeatsQuery,
  useGetPaymentsQuery,
  useGetPaymentOrganizationOptionsQuery,
  useGetFinancePlansQuery,
  useGetPaymentsConfigQuery,
  useGetPlatformFeatureCatalogQuery,
  useRecordManualPaymentMutation,
  useRefundPaymentMutation,
  useCreatePlanMutation,
  useUpdatePlanMutation,
} = paymentsApi;
