"use client";

import React from "react";
import { Chip } from "@galyan/ui";
import { Wallet } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { money, PAYMENT_STATUS, PURPOSE_LABELS } from "@/features/payments/common/constants";
import { relativeTime } from "@/utils/format";
import { useLatestPayments } from "@/features/revenue/use-revenue";

export function RecentPayments() {
  const payments = useLatestPayments();
  if (!payments) return null;

  return (
    <GlassSection title="Latest payments">
      {payments.length === 0 ? (
        <SectionEmpty icon={<Wallet className="size-5" />} title="No payments yet" />
      ) : (
        <div className="space-y-1.5">
          {payments.map((p) => (
            <div key={p.id} className={`${GLASS_ROW} flex items-center gap-2 px-2.5 py-1.5`}>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-[var(--gy-text)]">{p.organization.name}</div>
                <div className="truncate text-xs text-[var(--gy-text-subtle)]">
                  {PURPOSE_LABELS[p.purpose]} · {relativeTime(p.paidAt ?? p.createdAt)}
                </div>
              </div>
              {p.status !== "PAID" && (
                <Chip variant={PAYMENT_STATUS[p.status].chip} size="xs">
                  {PAYMENT_STATUS[p.status].label}
                </Chip>
              )}
              <span className="text-xs font-semibold text-[var(--gy-text)]">{money(p.amount, p.currency)}</span>
            </div>
          ))}
        </div>
      )}
    </GlassSection>
  );
}
