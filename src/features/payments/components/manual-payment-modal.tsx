"use client";

import { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Banner, Button, Dropdown, Input, Modal, Textarea, Toggle, useToast } from "@galyan/ui";
import { Banknote } from "lucide-react";
import { CYCLE_OPTIONS, MANUAL_METHODS, money, PLAN_OPTIONS } from "@/features/payments/common/constants";
import { pageParams } from "@/features/common/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { errorMessage, useGetPaymentOrganizationOptionsQuery, usePaymentsContext } from "@/features/payments/context";
import type { BillingCycle, PlanTier } from "@/features/payments/types";

interface Form {
  organizationId: string;
  amount: string;
  method: string;
  reference: string;
  paidAt: string;
  apply: boolean;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  seats: string;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY: Form = {
  organizationId: "",
  amount: "",
  method: "bank_transfer",
  reference: "",
  paidAt: today(),
  apply: true,
  planTier: "STARTER",
  billingCycle: "YEARLY",
  seats: "10",
  notes: "",
};

/** Managers/superadmins: record money received offline; optionally apply it as the subscription. */
export const ManualPaymentModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { state, recordManualPayment } = usePaymentsContext();
  const { toast } = useToast();
  // The parent re-keys this modal on every open, so each opening starts blank
  const [form, setForm] = useState<Form>(() => ({ ...EMPTY, paidAt: today() }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  // Organizations are searched on the server (first page by name); only while the modal is open
  const [orgSearch, setOrgSearch] = useState("");
  const [picked, setPicked] = useState<{ value: string; label: string } | null>(null);
  const debouncedOrgSearch = useDebounce(orgSearch, 300);
  const orgArgs = useMemo(() => pageParams(1, { search: debouncedOrgSearch }), [debouncedOrgSearch]);
  const orgQuery = useGetPaymentOrganizationOptionsQuery(isOpen ? orgArgs : skipToken);
  const orgOptions = useMemo(() => {
    const options = (orgQuery.data?.data ?? []).map((o) => ({ value: o.id, label: o.name }));
    // Keep the chosen organization listed after the search changes
    return picked && !options.some((o) => o.value === picked.value) ? [picked, ...options] : options;
  }, [orgQuery.data, picked]);

  // Suggested amount from the price list, GST included
  const plan = state.plans.find((p) => p.planTier === form.planTier);
  const taxPercent = state.config?.taxPercent ?? 18;
  const seats = Number(form.seats);
  const suggested =
    form.apply && plan && Number.isInteger(seats) && seats > 0
      ? Math.round(
          (form.billingCycle === "YEARLY" ? plan.pricePerSeatYearly : plan.pricePerSeatMonthly) * seats * (1 + taxPercent / 100) * 100,
        ) / 100
      : null;

  const submit = async () => {
    const amount = Number(form.amount);
    if (!form.organizationId) return setError("Choose the organization that paid.");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Enter the amount received.");
    if (form.apply && (!Number.isInteger(seats) || seats < 1)) return setError("Seats must be a whole number of at least 1.");
    setBusy(true);
    setError(null);
    try {
      const res = await recordManualPayment({
        organizationId: form.organizationId,
        amount,
        method: form.method,
        reference: form.reference.trim() || undefined,
        paidAt: form.paidAt ? new Date(`${form.paidAt}T12:00:00`).toISOString() : undefined,
        applyToSubscription: form.apply,
        ...(form.apply ? { planTier: form.planTier, billingCycle: form.billingCycle, seats } : {}),
        notes: form.notes.trim() || undefined,
      });
      toast.success(res.invoiceNumber ? `Payment recorded · ${res.invoiceNumber}` : "Payment recorded");
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Couldn't record the payment."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? undefined : onClose}
      size="md"
      icon={<Banknote className="size-4" />}
      title="Record a payment"
      subtitle="For money received outside Razorpay: bank transfer, UPI, cheque. An invoice is created automatically."
      preventBackdropClose={busy}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => void submit()} isLoading={busy}>
            Record payment
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error && <Banner variant="danger" size="sm" bannerStyle="subtle" description={error} />}
        <Dropdown
          label="Organization"
          size="sm"
          searchable
          options={orgOptions}
          value={form.organizationId}
          onChange={(v) => {
            set("organizationId", v as string);
            setPicked(orgOptions.find((o) => o.value === v) ?? null);
          }}
          onSearch={setOrgSearch}
          filterOption={() => true}
          placeholder="Choose organization"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount received (₹, incl. GST)"
            size="sm"
            type="number"
            min={1}
            step="0.01"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
          <Input label="Date received" size="sm" type="date" max={today()} value={form.paidAt} onChange={(e) => set("paidAt", e.target.value)} />
          <Dropdown label="Method" size="sm" options={MANUAL_METHODS} value={form.method} onChange={(v) => set("method", v as string)} />
          <Input label="Reference (UTR / cheque no.)" size="sm" value={form.reference} onChange={(e) => set("reference", e.target.value)} />
        </div>

        <Toggle size="sm" label="Apply as the organization's subscription" checked={form.apply} onChange={(e) => set("apply", e.target.checked)} />
        {form.apply && (
          <div className="grid grid-cols-3 gap-3">
            <Dropdown
              label="Plan"
              size="sm"
              options={PLAN_OPTIONS.filter((p) => p.value !== "FREE")}
              value={form.planTier}
              onChange={(v) => set("planTier", v as PlanTier)}
            />
            <Dropdown label="Cycle" size="sm" options={CYCLE_OPTIONS} value={form.billingCycle} onChange={(v) => set("billingCycle", v as BillingCycle)} />
            <Input label="Seats" size="sm" type="number" min={1} value={form.seats} onChange={(e) => set("seats", e.target.value)} />
          </div>
        )}
        {suggested !== null && (
          <p className="text-xs text-[var(--gy-text-subtle)]">
            Price list: {money(suggested, "INR", 2)} incl. {taxPercent}% GST.{" "}
            <button type="button" className="font-medium text-[var(--gy-primary)] hover:underline" onClick={() => set("amount", String(suggested))}>
              Use this amount
            </button>
          </p>
        )}
        <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
    </Modal>
  );
}
