"use client";

import { useCallback } from "react";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import type { Paginated } from "@/features/common/pagination";
import type { BillingCycle, PaymentPurpose, PaymentStatus, PlanTier } from "@/features/payments/types";
import {
  useCreateCheckoutOrderMutation,
  useGetMyBillingQuery,
  useReportCheckoutFailureMutation,
  useVerifyCheckoutMutation,
} from "@/features/subscription/context/api";

/** GET /finance/current/billing (organization OWNER / ADMIN): the billing summary. */
export interface MyBilling {
  /** The organization's plan (used when there is no subscription) */
  planTier: PlanTier;
  subscription: {
    planTier: PlanTier;
    status: string;
    billingCycle: BillingCycle;
    amount: number;
    currency: string;
    currentPeriodEnd: string;
    isActivePaid: boolean;
  } | null;
  seats: { purchased: number; used: number };
  invoices: { count: number; paidTotal: number; currency: string };
}

/** One row of GET /finance/current/invoices */
export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  invoicePdfUrl: string | null;
  createdAt: string;
}

/** One row of GET /finance/current/payments */
export interface MyPaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  planTier: PlanTier | null;
  billingCycle: BillingCycle | null;
  seats: number | null;
  failureReason: string | null;
  refundedAmount: number;
  paidAt: string | null;
  createdAt: string;
}

export type MyInvoicesResponse = Paginated<InvoiceRow>;
export type MyPaymentsResponse = Paginated<MyPaymentRow>;

export type CheckoutPurpose = "PLAN" | "SEATS";

export interface CheckoutRequest {
  purpose: CheckoutPurpose;
  planTier?: PlanTier;
  billingCycle?: BillingCycle;
  seats: number;
}

export interface CheckoutQuote {
  billingCycle: BillingCycle;
  seats: number;
  currency: string;
  recurringAmount: number;
  subtotal: number;
  taxPercent: number;
  tax: number;
  total: number;
  prorationFactor: number;
}

export interface CheckoutOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
}

/**
 * The caller's billing summary, shared by the Plan & Usage and Invoices pages (one cached request)
 * and refreshed every minute; a failed refresh keeps the last data. `forbidden` when their
 * organization role can't see billing.
 */
export function useMyBilling() {
  const { data, error, isLoading, refetch } = useGetMyBillingQuery(undefined, {
    pollingInterval: POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });
  const forbidden = !data && (error as { status?: number } | undefined)?.status === 403;

  return {
    data: data ?? null,
    error: data || !error || forbidden ? null : queryErrorMessage(error, "Couldn't load billing."),
    forbidden,
    loading: isLoading,
    reload: refetch,
  };
}

// ── Razorpay Checkout ────────────────────────────────────────────────────

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load Razorpay Checkout. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export type CheckoutOutcome =
  | { status: "paid"; invoiceNumber: string | null }
  | { status: "dismissed" }
  | { status: "failed"; reason: string };

/**
 * Returns `run(req)`: creates the order on the backend, opens Razorpay Checkout and verifies
 * the result; resolves once the payer finishes, fails, or closes the checkout. Verification
 * and reported failures invalidate the shared `Billing` cache, so callers never reload.
 */
export function useRunCheckout() {
  const [createOrder] = useCreateCheckoutOrderMutation();
  const [verifyCheckout] = useVerifyCheckoutMutation();
  const [reportFailure] = useReportCheckoutFailureMutation();

  return useCallback(
    async (req: CheckoutRequest): Promise<CheckoutOutcome> => {
      await loadCheckoutScript();
      const order = await createOrder(req).unwrap();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");

      return new Promise<CheckoutOutcome>((resolve, reject) => {
        let settled = false;
        const finish = (outcome: CheckoutOutcome) => {
          if (!settled) {
            settled = true;
            resolve(outcome);
          }
        };

        const rzp = new Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: order.name,
          description: order.description,
          prefill: order.prefill,
          theme: { color: "#6366f1" },
          handler: async (resp: RazorpaySuccess) => {
            try {
              const result = await verifyCheckout(resp).unwrap();
              finish({ status: "paid", invoiceNumber: result.invoiceNumber ?? null });
            } catch (err) {
              settled = true;
              reject(err);
            }
          },
          // Closing after a failed attempt reports the failure; closing before paying is a dismissal
          modal: {
            ondismiss: () => finish(lastFailure ? { status: "failed", reason: lastFailure } : { status: "dismissed" }),
          },
        });

        // Checkout stays open after a failure so the payer can retry with another method
        let lastFailure: string | null = null;
        rzp.on("payment.failed", (resp) => {
          lastFailure = resp.error?.description || "The payment failed.";
          reportFailure({ razorpay_order_id: order.orderId, reason: lastFailure })
            .unwrap()
            .catch(() => undefined);
        });
        rzp.open();
      });
    },
    [createOrder, verifyCheckout, reportFailure],
  );
}
