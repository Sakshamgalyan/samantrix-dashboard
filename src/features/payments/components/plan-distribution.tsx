"use client";

import { useMemo } from "react";
import { DonutChart } from "@galyan/ui";
import { Layers } from "lucide-react";
import { GLASS_ROW, GlassSection, SectionEmpty } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { PLAN_COLORS, PLAN_LABELS, money } from "../common/constants";
import { usePaymentsContext } from "../context";

/** Organizations per plan tier, with each tier's MRR. */
export function PlanDistribution({ className }: { className?: string }) {
  const { state } = usePaymentsContext();
  const data = state.data;

  const donutData = useMemo(
    () =>
      (data?.planDistribution ?? [])
        .filter((p) => p.organizations > 0)
        .map((p) => ({
          name: PLAN_LABELS[p.planTier] ?? p.planTier,
          value: p.organizations,
          color: PLAN_COLORS[p.planTier],
        })),
    [data],
  );

  if (!data) return null;
  const { planDistribution, organizations, currency } = data;

  return (
    <GlassSection
      className={className}
      title="Plan distribution"
      subtitle={`${formatNumber(organizations.total)} organization${organizations.total === 1 ? "" : "s"} by plan tier`}
    >
      {donutData.length === 0 ? (
        <SectionEmpty
          icon={<Layers className="size-5" />}
          title="No organizations yet"
          description="Organizations appear here once they register."
        />
      ) : (
        <div className="flex h-[200px] w-full items-center justify-center">
          <DonutChart
            data={donutData}
            height={190}
            variant="standard"
            showCenterMetric
            centerMetric={{
              label: "Organizations",
              value: organizations.total,
            }}
          />
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {planDistribution.map((p) => (
          <div key={p.planTier} className={`${GLASS_ROW} px-3 py-2`}>
            <div className="flex items-center gap-1.5 text-xs text-[var(--gy-text-secondary)]">
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ background: PLAN_COLORS[p.planTier] }}
              />
              {PLAN_LABELS[p.planTier] ?? p.planTier}
            </div>
            <div className="mt-0.5 text-lg font-semibold text-[var(--gy-text)]">
              {formatNumber(p.organizations)}
            </div>
            <div className="text-[11px] text-[var(--gy-text-subtle)]">
              {money(p.mrr, currency)} MRR
            </div>
          </div>
        ))}
      </div>
    </GlassSection>
  );
}
