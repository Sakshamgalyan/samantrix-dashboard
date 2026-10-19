"use client";

import { useState } from "react";
import { Button, Dropdown, Input, Modal, Skeleton, Textarea } from "@galyan/ui";
import { CreditCard } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { formatMoney } from "@/utils/format";
import { useOrganizationsContext } from "@/features/organizations/context";
import type {
  AdminOrganization,
  BillingCycle,
  OrgPlanTier,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/features/organizations/types";
import {
  BILLING_OPTIONS,
  PLAN_META,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "@/features/organizations/common/constants";

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

/** End of a period that starts on `start` (yyyy-mm-dd). */
const periodEnd = (start: string, cycle: BillingCycle): string => {
  const d = new Date(`${start}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  if (cycle === "YEARLY") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return toDateInput(d);
};

const SubscriptionForm = ({
  org,
  plans,
}: {
  org: AdminOrganization;
  plans: SubscriptionPlan[];
}) => {
  const { closeSubscription, submitSubscription } = useOrganizationsContext();
  const current = org.subscription;

  const [planTier, setPlanTier] = useState<OrgPlanTier>(
    current?.planTier ?? org.planTier,
  );
  const [cycle, setCycle] = useState<BillingCycle>(
    current?.billingCycle ?? org.billingCycle,
  );
  const [seats, setSeats] = useState(String(current?.seats ?? org.maxMembers));
  const [start, setStart] = useState(toDateInput(new Date()));
  const [end, setEnd] = useState(() => periodEnd(toDateInput(new Date()), cycle));
  const [endTouched, setEndTouched] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [notes, setNotes] = useState("");
  /** null = use the calculated price; a string once the amount is edited by hand */
  const [customAmount, setCustomAmount] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = plans.find((p) => p.planTier === planTier);
  const seatCount = Number(seats);
  const unitPrice = plan
    ? cycle === "YEARLY"
      ? plan.pricePerSeatYearly
      : plan.pricePerSeatMonthly
    : 0;
  const currency = plan?.currency ?? "INR";
  const calculated =
    Number.isFinite(seatCount) && seatCount > 0
      ? Math.round(unitPrice * seatCount * 100) / 100
      : 0;
  const amountText = customAmount ?? String(calculated);

  const seatHint = !plan
    ? undefined
    : plan.maxSeats
      ? `${plan.minSeats}–${plan.maxSeats} seats on ${plan.name}`
      : `At least ${plan.minSeats} seat${plan.minSeats === 1 ? "" : "s"} on ${plan.name}`;

  const changeCycle = (next: BillingCycle) => {
    setCycle(next);
    if (!endTouched) setEnd(periodEnd(start, next));
  };
  const changeStart = (next: string) => {
    setStart(next);
    if (!endTouched) setEnd(periodEnd(next, cycle));
  };

  const submit = async () => {
    setError(null);
    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setError("Seats must be a whole number, 1 or more.");
      return;
    }
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!start || !end || end <= start) {
      setError("The period must end after it starts.");
      return;
    }
    setSubmitting(true);
    const ok = await submitSubscription(org.id, {
      planTier,
      billingCycle: cycle,
      seats: seatCount,
      amount,
      currency,
      currentPeriodStart: new Date(`${start}T00:00:00`).toISOString(),
      currentPeriodEnd: new Date(`${end}T00:00:00`).toISOString(),
      status,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    if (!ok) setSubmitting(false);
  };

  return (
    <Modal
      isOpen
      onClose={submitting ? () => undefined : closeSubscription}
      size="md"
      icon={<CreditCard className="size-4" />}
      title="Assign subscription"
      subtitle={`${org.name} · ${org.memberCount} member${org.memberCount === 1 ? "" : "s"} today`}
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={closeSubscription} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            isLoading={submitting}
            onClick={() => void submit()}
          >
            Assign subscription
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Dropdown
            label="Plan"
            size="sm"
            options={plans.map((p) => ({
              value: p.planTier,
              label: PLAN_META[p.planTier]?.label ?? p.name,
              description: `${formatMoney(p.pricePerSeatMonthly, p.currency)}/seat/mo`,
            }))}
            value={planTier}
            onChange={(v) => setPlanTier(v as OrgPlanTier)}
          />
          <Dropdown
            label="Billing cycle"
            size="sm"
            options={BILLING_OPTIONS}
            value={cycle}
            onChange={(v) => changeCycle(v as BillingCycle)}
          />
          <Input
            label="Seats (users)"
            size="sm"
            type="number"
            min={1}
            fullWidth
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            helperText={seatHint}
          />
          <Input
            label={`Amount (${currency})`}
            size="sm"
            type="number"
            min={0}
            step="0.01"
            fullWidth
            value={amountText}
            onChange={(e) => setCustomAmount(e.target.value)}
            helperText={
              customAmount === null
                ? `${formatMoney(unitPrice, currency)} × ${Number.isFinite(seatCount) ? seatCount : 0} seats`
                : "Custom amount"
            }
          />
          <Input
            label="Period starts"
            size="sm"
            type="date"
            fullWidth
            value={start}
            onChange={(e) => changeStart(e.target.value)}
          />
          <Input
            label="Period ends"
            size="sm"
            type="date"
            fullWidth
            value={end}
            onChange={(e) => {
              setEndTouched(true);
              setEnd(e.target.value);
            }}
          />
          <Dropdown
            label="Subscription status"
            size="sm"
            options={SUBSCRIPTION_STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as SubscriptionStatus)}
          />
        </div>

        {customAmount !== null && (
          <button
            type="button"
            className="text-xs text-[var(--gy-primary)] hover:underline"
            onClick={() => setCustomAmount(null)}
          >
            Use the plan price ({formatMoney(calculated, currency, 2)})
          </button>
        )}

        <Textarea
          label="Notes (optional)"
          size="sm"
          rows={2}
          fullWidth
          maxLength={1000}
          placeholder="e.g. Paid by bank transfer, annual contract"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div
          className={`${GLASS_ROW} px-3 py-2 text-xs text-[var(--gy-text-secondary)]`}
        >
          Sets the plan and seat limit on the organization and records the
          amount as a manual payment.
        </div>

        {error && (
          <p className="text-xs text-[var(--gy-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

export const SubscriptionModal = () => {
  const { state, closeSubscription } = useOrganizationsContext();
  const org = state.subscriptionDialog;
  if (!org) return null;

  if (!state.plans) {
    return (
      <Modal isOpen onClose={closeSubscription} size="md" title="Assign subscription">
        <div className="space-y-3">
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </div>
      </Modal>
    );
  }
  return <SubscriptionForm key={org.id} org={org} plans={state.plans} />;
};
