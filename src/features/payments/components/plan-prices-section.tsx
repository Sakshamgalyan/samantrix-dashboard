"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Chip, Table, type Column } from "@galyan/ui";
import { CheckCircle2, Pencil, Plus, Tags } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { getYearlySavings, money, PLAN_COLORS, PLAN_LABELS } from "@/features/payments/common/constants";
import { usePaymentsContext } from "@/features/payments/context";
import type { Plan } from "@/features/payments/types";

const PlanEditModal = dynamic(
  () => import("@/features/payments/components/plan-edit-modal").then((m) => m.PlanEditModal),
  { ssr: false },
);

/** Subscription plans table with live configuration for superadmins. */
export const PlanPricesSection = ({ editable }: { editable: boolean }) => {
  const { state } = usePaymentsContext();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const plans = state.plans;

  const columns = useMemo<Column<Plan>[]>(() => {
    const cols: Column<Plan>[] = [
      {
        key: "plan",
        header: "Plan & Tier",
        width: "280px",
        accessor: (row) => (
          <div className="flex items-center gap-2.5 min-w-0 max-w-full overflow-hidden">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: PLAN_COLORS[row.planTier] }}
            />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="truncate text-sm font-semibold text-[var(--gy-text)]"
                  title={row.name}
                >
                  {row.name}
                </span>
                <Chip variant="soft" size="xs" className="shrink-0">
                  {PLAN_LABELS[row.planTier] ?? row.planTier}
                </Chip>
              </div>
              {row.description && (
                <span
                  className="truncate text-xs text-[var(--gy-text-subtle)]"
                  title={row.description}
                >
                  {row.description}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "monthlyPrice",
        header: "Monthly (per seat)",
        width: "160px",
        accessor: (row) => (
          <span className="whitespace-nowrap text-sm font-semibold text-[var(--gy-text)]">
            {row.pricePerSeatMonthly === 0
              ? "Free"
              : `${money(row.pricePerSeatMonthly, row.currency)}/mo`}
          </span>
        ),
      },
      {
        key: "yearlyPrice",
        header: "Yearly (per seat)",
        width: "180px",
        accessor: (row) => {
          const saving = getYearlySavings(
            row.pricePerSeatMonthly,
            row.pricePerSeatYearly,
          );
          return (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-sm font-semibold text-[var(--gy-text)]">
                {row.pricePerSeatYearly === 0
                  ? "Free"
                  : `${money(row.pricePerSeatYearly, row.currency)}/yr`}
              </span>
              {saving > 0 && (
                <span className="text-[11px] font-medium text-[var(--gy-success)]">
                  Save {saving}% vs monthly
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "seats",
        header: "Seat Quota",
        width: "140px",
        accessor: (row) => (
          <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
            {row.minSeats}
            {row.maxSeats ? `–${row.maxSeats}` : "+"} seats
          </span>
        ),
      },
      {
        key: "features",
        header: "Included Features",
        width: "280px",
        accessor: (row) => {
          const feats = row.features || [];
          if (feats.length === 0) {
            return (
              <span className="text-xs italic text-[var(--gy-text-subtle)]">
                No features specified
              </span>
            );
          }
          return (
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {feats.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded bg-[var(--gy-bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--gy-text-secondary)]"
                >
                  <CheckCircle2 className="size-3 text-[var(--gy-success)] shrink-0" />
                  <span className="max-w-[120px] truncate" title={f}>{f}</span>
                </span>
              ))}
              {feats.length > 3 && (
                <Chip variant="neutral" size="xs" className="shrink-0">
                  +{feats.length - 3} more
                </Chip>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        width: "110px",
        accessor: (row) => (
          <Chip variant={row.isActive ? "success" : "neutral"} size="xs" className="shrink-0">
            {row.isActive ? "Active" : "Hidden"}
          </Chip>
        ),
      },
    ];

    if (editable) {
      cols.push({
        key: "actions",
        header: "",
        width: "90px",
        align: "right",
        accessor: (row) => (
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Pencil className="size-3" />}
            onClick={() => setEditing(row)}
          >
            Edit
          </Button>
        ),
      });
    }

    return cols;
  }, [editable]);

  return (
    <GlassSection
      title="Subscription Plans & Pricing"
      subtitle="Per seat prices in INR (excl. GST) · Edit plans, seat limits & toggle active features"
      aside={
        editable ? (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setIsCreating(true)}
          >
            Add Plan
          </Button>
        ) : undefined
      }
    >
      {plans.length === 0 ? (
        <SectionEmpty
          icon={<Tags className="size-5" />}
          title="No subscription plans configured"
          description="Create plans to display pricing tiers here."
        />
      ) : (
        <div className="w-full overflow-x-auto">
          <Table<Plan>
            columns={columns}
            data={plans}
            rowKey={(row) => row.id}
            size="sm"
            hoverable
            responsive="scroll"
          />
        </div>
      )}

      {editable && (
        <PlanEditModal
          key={editing ? editing.id : isCreating ? "create-new-plan" : "modal-closed"}
          isOpen={editing !== null || isCreating}
          plan={editing}
          existingTiers={plans.map((p) => p.planTier)}
          onClose={() => {
            setEditing(null);
            setIsCreating(false);
          }}
        />
      )}
    </GlassSection>
  );
};
