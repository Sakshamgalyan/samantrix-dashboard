"use client";

import { useMemo, useState } from "react";
import { Button, Dropdown, Input, Modal, Textarea, Typography } from "@galyan/ui";
import { FileText, Plus, Send, Trash2 } from "lucide-react";
import { useLeadsContext } from "@/features/leads/context";
import { PLAN_LABEL, formatInr, fromDateInput, toDateInput } from "@/features/leads/common/constants";
import {
  leadQuoteSchema,
  type BillingCycle,
  type LeadDetail,
  type PlanTier,
  type PricePlan,
} from "@/features/leads/types";

interface DraftItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const planLine = (plan: PricePlan, seats: number, cycle: BillingCycle): DraftItem => {
  const yearly = cycle === "YEARLY";
  return {
    description: `${plan.name} plan — ${seats} seat${seats === 1 ? "" : "s"} (${yearly ? "yearly" : "monthly"})`,
    quantity: String(seats),
    unitPrice: String(yearly ? plan.pricePerSeatYearly : plan.pricePerSeatMonthly),
  };
};

/** Seats from the lead's team size ("51 – 200 people" → 51), else 10. */
const suggestedSeats = (teamSize: string | null): number => {
  const n = Number(teamSize?.match(/\d+/)?.[0]);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000) : 10;
};

/**
 * Quote builder: pick a plan, seats and cycle to price the main line from the price list,
 * add extra lines, discount and tax, then save as draft or send straight away.
 */
export const LeadQuoteModal = ({ lead }: { lead: LeadDetail }) => {
  const { state, setDialog, createQuote } = useLeadsContext();
  const plans = state.plans.filter((p) => p.planTier !== "FREE");
  const defaultPlan = plans.find((p) => p.planTier === "PROFESSIONAL") ?? plans[0];
  const initialSeats = Math.max(suggestedSeats(lead.teamSize), defaultPlan?.minSeats ?? 1);

  const [planTier, setPlanTier] = useState<PlanTier | "">(defaultPlan?.planTier ?? "");
  const [cycle, setCycle] = useState<BillingCycle>("YEARLY");
  const [seats, setSeats] = useState(String(initialSeats));
  const [items, setItems] = useState<DraftItem[]>(() =>
    defaultPlan ? [planLine(defaultPlan, initialSeats, "YEARLY")] : [{ description: "", quantity: "1", unitPrice: "0" }],
  );
  const [discount, setDiscount] = useState("0");
  const [taxPercent, setTaxPercent] = useState("18");
  const [validUntil, setValidUntil] = useState(() =>
    toDateInput(new Date(Date.now() + 30 * 86_400_000).toISOString()),
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  /** Re-prices the first line when plan / seats / cycle change. */
  const reprice = (tier: PlanTier | "", seatCount: number, c: BillingCycle) => {
    const plan = plans.find((p) => p.planTier === tier);
    if (!plan || !Number.isFinite(seatCount) || seatCount < 1) return;
    setItems((prev) => [planLine(plan, seatCount, c), ...prev.slice(1)]);
  };

  const totals = useMemo(() => {
    const lines = items.map((i) => round2((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)));
    const subtotal = round2(lines.reduce((a, b) => a + b, 0));
    const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const tax = round2(((subtotal - disc) * (Number(taxPercent) || 0)) / 100);
    return { lines, subtotal, discount: disc, tax, total: round2(subtotal - disc + tax) };
  }, [items, discount, taxPercent]);

  const updateItem = (index: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const submit = async (send: boolean) => {
    const parsed = leadQuoteSchema.safeParse({
      planTier: planTier || undefined,
      billingCycle: cycle,
      seats: Number(seats),
      items: items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
      validUntil,
      notes: notes.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the quote");
      return;
    }
    setError(null);
    const v = parsed.data;
    await createQuote(
      {
        planTier: v.planTier,
        billingCycle: v.billingCycle,
        seats: v.seats,
        items: v.items,
        discount: v.discount,
        taxPercent: v.taxPercent,
        validUntil: fromDateInput(v.validUntil) ?? undefined,
        notes: v.notes,
      },
      send,
    );
  };

  const currency = plans.find((p) => p.planTier === planTier)?.currency ?? "INR";
  const money = (n: number) => formatInr(n, currency);

  return (
    <Modal
      isOpen
      onClose={state.saving ? undefined : () => setDialog(null)}
      size="xl"
      icon={<FileText className="size-4" />}
      title="Create quote"
      subtitle={`For ${lead.name || lead.email}${lead.company ? ` · ${lead.company}` : ""}`}
      preventBackdropClose={state.saving}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography variant="small" textColor="var(--gy-text-secondary)">
            Total{" "}
            <Typography variant="small" as="span" weight="bold" textColor="var(--gy-text)">
              {money(totals.total)}
            </Typography>
          </Typography>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDialog(null)} disabled={state.saving}>
              Cancel
            </Button>
            <Button variant="outline" size="sm" disabled={state.saving} onClick={() => void submit(false)}>
              Save draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="size-3.5" />}
              isLoading={state.saving}
              onClick={() => void submit(true)}
            >
              Save & send
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Dropdown
            label="Plan"
            size="sm"
            options={[
              { value: "", label: "Custom (no plan)" },
              ...plans.map((p) => ({
                value: p.planTier,
                label: PLAN_LABEL[p.planTier],
                description: `${formatInr(p.pricePerSeatMonthly, p.currency)}/seat/mo · ${formatInr(p.pricePerSeatYearly, p.currency)}/seat/yr`,
              })),
            ]}
            value={planTier}
            onChange={(v) => {
              const tier = v as PlanTier | "";
              setPlanTier(tier);
              reprice(tier, Number(seats), cycle);
            }}
          />
          <Dropdown
            label="Billing"
            size="sm"
            options={[
              { value: "YEARLY", label: "Yearly" },
              { value: "MONTHLY", label: "Monthly" },
            ]}
            value={cycle}
            onChange={(v) => {
              const c = v as BillingCycle;
              setCycle(c);
              reprice(planTier, Number(seats), c);
            }}
          />
          <Input
            label="Seats"
            size="sm"
            type="number"
            min={1}
            value={seats}
            onChange={(e) => {
              setSeats(e.target.value);
              reprice(planTier, Number(e.target.value), cycle);
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="overflow-x-auto w-full pb-1">
            <div className="min-w-[480px] space-y-2">
              <div className="grid grid-cols-[1fr_80px_120px_110px_32px] gap-2 text-xs font-medium text-[var(--gy-text-secondary)]">
                <Typography variant="small" textColor="var(--gy-text-secondary)">Item</Typography>
                <Typography variant="small" textColor="var(--gy-text-secondary)">Qty</Typography>
                <Typography variant="small" textColor="var(--gy-text-secondary)">Unit price</Typography>
                <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-right">Amount</Typography>
                <span />
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_120px_110px_32px] items-center gap-2">
                  <Input
                    size="sm"
                    value={item.description}
                    placeholder="Description"
                    aria-label={`Item ${i + 1} description`}
                    onChange={(e) => updateItem(i, { description: e.target.value })}
                  />
                  <Input
                    size="sm"
                    type="number"
                    min={0}
                    value={item.quantity}
                    aria-label={`Item ${i + 1} quantity`}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                  />
                  <Input
                    size="sm"
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    aria-label={`Item ${i + 1} unit price`}
                    onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                  />
                  <Typography variant="small" textColor="var(--gy-text)" className="text-right tabular-nums">
                    {money(totals.lines[i] ?? 0)}
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    aria-label={`Remove item ${i + 1}`}
                    leftIcon={<Trash2 className="size-3.5" />}
                    disabled={items.length === 1}
                    onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Plus className="size-3.5" />}
            onClick={() => setItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "0" }])}
          >
            Add line
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Discount (amount)"
                size="sm"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <Input
                label="Tax %"
                size="sm"
                type="number"
                min={0}
                max={100}
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
              <Input
                label="Valid until"
                size="sm"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <Textarea
              label="Notes on the quote (optional)"
              size="sm"
              rows={3}
              placeholder="Payment terms, onboarding, inclusions…"
              value={notes}
              maxCharCount={4000}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <dl className="space-y-1 self-end rounded-lg border border-[var(--gy-border)] p-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--gy-text-secondary)]">Subtotal</dt>
              <dd>{money(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--gy-text-secondary)]">Discount</dt>
                <dd>− {money(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[var(--gy-text-secondary)]">Tax ({Number(taxPercent) || 0}%)</dt>
              <dd>{money(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--gy-border)] pt-1 font-semibold">
              <dt>Total</dt>
              <dd>{money(totals.total)}</dd>
            </div>
          </dl>
        </div>

        {error && <Typography variant="p" textColor="var(--gy-danger)" className="text-sm">{error}</Typography>}
      </div>
    </Modal>
  );
};
