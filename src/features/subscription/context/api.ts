import { dashboardApi } from "@/store";
import type { PageQueryParams } from "@/features/common/pagination";
import type {
  CheckoutOrder,
  CheckoutQuote,
  CheckoutRequest,
  MyBilling,
  MyInvoicesResponse,
  MyPaymentsResponse,
  RazorpaySuccess,
} from "@/features/subscription/billing-api";

/**
 * Workspace billing. The `GET /finance/current/billing` summary (plan, seats, invoice totals) is
 * shared by the Plan & Usage and Invoices pages; invoices and payments are paginated lists.
 * Any checkout step that records a payment or a failed attempt invalidates all of them.
 */
export const subscriptionApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** The caller's plan, subscription, seats and invoice totals (OWNER / ADMIN). */
    getMyBilling: build.query<MyBilling, void>({
      query: () => "/finance/current/billing",
      providesTags: ["Billing"],
    }),

    /** One page of the caller's invoices (`pageParams(page)`). */
    getMyInvoices: build.query<MyInvoicesResponse, PageQueryParams>({
      query: (params) => ({ url: "/finance/current/invoices", params }),
      providesTags: ["Billing"],
    }),

    /** One page of the caller's payments (`pageParams(page)`); page 1 also feeds "Recent payments". */
    getMyPayments: build.query<MyPaymentsResponse, PageQueryParams>({
      query: (params) => ({ url: "/finance/current/payments", params }),
      providesTags: ["Billing"],
    }),

    /** Server-side price for a purchase; read-only, so it is a cached query keyed by the request. */
    getCheckoutQuote: build.query<CheckoutQuote, CheckoutRequest>({
      query: (body) => ({ url: "/finance/checkout/quote", method: "POST", body }),
      // Proration changes over time: drop quotes soon after the checkout modal closes
      keepUnusedDataFor: 30,
    }),

    /** Creates the Razorpay order; billing is refreshed once the attempt is verified or fails. */
    createCheckoutOrder: build.mutation<CheckoutOrder, CheckoutRequest>({
      query: (body) => ({ url: "/finance/checkout/order", method: "POST", body }),
    }),

    /** Verifies the Razorpay signature; activates the plan / seats and issues the invoice. */
    verifyCheckout: build.mutation<{ invoiceNumber?: string | null }, RazorpaySuccess>({
      query: (body) => ({ url: "/finance/checkout/verify", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),

    /** Records a failed payment attempt so it shows in the payment history. */
    reportCheckoutFailure: build.mutation<void, { razorpay_order_id: string; reason: string }>({
      query: (body) => ({ url: "/finance/checkout/failed", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),
  }),
});

export const {
  useGetMyBillingQuery,
  useGetMyInvoicesQuery,
  useGetMyPaymentsQuery,
  useGetCheckoutQuoteQuery,
  useCreateCheckoutOrderMutation,
  useVerifyCheckoutMutation,
  useReportCheckoutFailureMutation,
} = subscriptionApi;
