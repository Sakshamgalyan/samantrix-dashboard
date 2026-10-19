"use client";

import { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Banner, Button, Input, Modal, Skeleton, Typography, useToast } from "@galyan/ui";
import { CreditCard, ShieldCheck } from "lucide-react";
import { money, PLAN_LABELS } from "@/features/payments/common/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { queryErrorMessage } from "@/store";
import { useGetCheckoutQuoteQuery } from "@/features/subscription/context/api";
import { useRunCheckout, type CheckoutRequest } from "@/features/subscription/billing-api";

interface CheckoutModalProps {
  /** What is being bought; null closes the modal. For SEATS the seat count is editable here. */
  request: CheckoutRequest | null;
  paymentsEnabled: boolean;
  onClose: () => void;
}

/**
 * Shows the server-side price (subtotal, GST, total) and runs Razorpay Checkout. A successful
 * payment invalidates the shared billing cache, so the pages behind the modal refresh themselves.
 */
export const CheckoutModal = ({ request, paymentsEnabled, onClose }: CheckoutModalProps) => {
  const { toast } = useToast();
  // Mounted with a fresh key per purchase, so state starts from `request`
  const [seats, setSeats] = useState(() => String(request?.seats ?? 1));
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const runCheckout = useRunCheckout();

  const seatCount = Number(seats);
  const seatsValid = Number.isInteger(seatCount) && seatCount >= 1;

  // Re-price whenever the seat count changes (debounced); each priced request is cached
  const debouncedSeats = useDebounce(seatsValid ? seatCount : null, 300);
  const quoteArgs = useMemo<CheckoutRequest | null>(
    () => (request && debouncedSeats !== null ? { ...request, seats: debouncedSeats } : null),
    [request, debouncedSeats],
  );
  const quoteQuery = useGetCheckoutQuoteQuery(quoteArgs ?? skipToken);
  const quoting = quoteQuery.isFetching;
  const quote = seatsValid && quoteQuery.currentData?.seats === seatCount ? quoteQuery.currentData : null;
  const quoteError =
    quoteQuery.isError && !quoting ? queryErrorMessage(quoteQuery.error, "Couldn't price this purchase.") : null;
  const error = payError ?? quoteError;

  const pay = async () => {
    if (!request || !quote) return;
    setPaying(true);
    setPayError(null);
    try {
      const outcome = await runCheckout({ ...request, seats: Number(seats) });
      if (outcome.status === "paid") {
        toast.success(outcome.invoiceNumber ? `Payment successful · invoice ${outcome.invoiceNumber}` : "Payment successful");
        onClose();
      } else if (outcome.status === "failed") {
        setPayError(`${outcome.reason} No money was taken; you can try again.`);
      }
    } catch (err) {
      setPayError(queryErrorMessage(err, "The payment could not be completed."));
    } finally {
      setPaying(false);
    }
  };

  const isSeats = request?.purpose === "SEATS";
  const title = isSeats
    ? "Add seats"
    : `${request?.planTier ? PLAN_LABELS[request.planTier] : ""} · ${request?.billingCycle === "YEARLY" ? "yearly" : "monthly"}`;

  return (
    <Modal
      isOpen={request !== null}
      onClose={paying ? undefined : onClose}
      size="sm"
      icon={<CreditCard className="size-4" />}
      title={title}
      subtitle={isSeats ? "Extra seats are charged for the rest of the current billing period." : "Charged now for a full billing period."}
      preventBackdropClose={paying}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1.5 text-xs text-[var(--gy-text-subtle)] justify-center sm:justify-start">
            <ShieldCheck className="size-3.5" />
            <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
              Secured by Razorpay
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={paying} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void pay()}
              isLoading={paying}
              disabled={!quote || quoting || !paymentsEnabled}
              className="flex-1 sm:flex-initial"
            >
              {quote ? `Pay ${money(quote.total, quote.currency, 2)}` : "Pay"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Banner variant="danger" size="sm" bannerStyle="subtle" description={error} />}
        {!paymentsEnabled && (
          <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs">
            Online payments are not available right now. Contact your Simantrix account manager to complete this purchase.
          </Typography>
        )}
        <Input
          label={isSeats ? "Extra seats" : "Seats"}
          size="sm"
          type="number"
          min={1}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
        />
        {quoting && !quote ? (
          <Skeleton height="96px" />
        ) : quote ? (
          <div className="space-y-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3.5 text-sm">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <Typography variant="span" textColor="var(--gy-text-secondary)">
                {quote.seats} seat{quote.seats === 1 ? "" : "s"}
                {quote.prorationFactor < 1 ? ` · ${Math.round(quote.prorationFactor * 100)}% of period` : ""}
              </Typography>
              <Typography variant="span" weight="medium" textColor="var(--gy-text)">
                {money(quote.subtotal, quote.currency, 2)}
              </Typography>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <Typography variant="span" textColor="var(--gy-text-secondary)">
                GST {quote.taxPercent}%
              </Typography>
              <Typography variant="span" weight="medium" textColor="var(--gy-text)">
                {money(quote.tax, quote.currency, 2)}
              </Typography>
            </div>
            <div className="flex justify-between items-center border-t border-[var(--gy-border)] pt-2 font-semibold">
              <Typography variant="span" weight="bold" textColor="var(--gy-text)">
                Total today
              </Typography>
              <Typography variant="span" weight="bold" textColor="var(--gy-text)" className="text-base">
                {money(quote.total, quote.currency, 2)}
              </Typography>
            </div>
            <Typography variant="p" textColor="var(--gy-text-subtle)" className="pt-1 text-xs">
              Then {money(quote.recurringAmount, quote.currency)} + GST per {quote.billingCycle === "YEARLY" ? "year" : "month"}.
            </Typography>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
