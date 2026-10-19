"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { money, PLAN_LABELS } from "@/features/payments/common/constants";
import { useTopOrganizations } from "@/features/revenue/use-revenue";

export function TopOrganizations() {
  const top = useTopOrganizations();
  if (!top) return null;
  const max = Math.max(1, ...top.organizations.map((o) => o.lifetimePaid));

  return (
    <GlassSection title="Top organizations" subtitle="Lifetime payments, net of refunds">
      {top.organizations.length === 0 ? (
        <SectionEmpty icon={<Trophy className="size-5" />} title="No payments yet" />
      ) : (
        <div className="space-y-2">
          {top.organizations.map((o, i) => (
            <div key={o.organization.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-4 text-[var(--gy-text-subtle)]">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium text-[var(--gy-text)]">{o.organization.name}</span>
                {o.planTier && <span className="text-[var(--gy-text-subtle)]">{PLAN_LABELS[o.planTier]} · {o.seats} seats</span>}
                <span className="w-24 text-right font-semibold text-[var(--gy-text)]">{money(o.lifetimePaid, top.currency)}</span>
              </div>
              <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-[var(--gy-border)]/50">
                <div className="h-full rounded-full bg-[var(--gy-primary)]" style={{ width: `${(o.lifetimePaid / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassSection>
  );
}
