"use client";

import { AlertTriangle, IndianRupee, Users, UserCheck } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { formatNumber } from "@/utils/format";
import { money } from "@/features/payments/common/constants";
import { usePaymentsContext } from "@/features/payments/context";

const growth = (now: number, before: number) =>
  before > 0 ? Math.round(((now - before) / before) * 100) : null;

export const PaymentsKpis = () => {
  const { state } = usePaymentsContext();
  const summary = state.summary;
  const seats = summary?.seats;
  const change = summary ? growth(summary.collectedThisMonth, summary.collectedLastMonth) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:grid-cols-4">
      <KpiCard
        label="Seats purchased"
        icon={<Users />}
        value={seats?.seatsPurchased ?? 0}
        caption={seats ? `${formatNumber(seats.payingOrganizations)} paying organizations` : "—"}
        tone="primary"
      />
      <KpiCard
        label="Seats in use"
        icon={<UserCheck />}
        value={seats?.seatsUsedOnPaidPlans ?? 0}
        caption={
          seats?.utilisation != null
            ? `${seats.utilisation}% utilisation${seats.organizationsOverLimit ? ` · ${seats.organizationsOverLimit} over limit` : ""}`
            : "No paid seats yet"
        }
        tone="info"
      />
      <KpiCard
        label="Collected this month"
        icon={<IndianRupee />}
        value={summary ? money(summary.collectedThisMonth, summary.currency) : "—"}
        caption={
          summary
            ? `${formatNumber(summary.paymentsThisMonth)} payments · last month ${money(summary.collectedLastMonth, summary.currency)}`
            : undefined
        }
        badge={
          change !== null ? (
            <span className={`text-xs font-medium ${change >= 0 ? "text-[var(--gy-success)]" : "text-[var(--gy-danger)]"}`}>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          ) : undefined
        }
        tone="success"
      />
      <KpiCard
        label="Failed payments"
        icon={<AlertTriangle />}
        value={summary?.failedLast30d ?? 0}
        caption={summary ? `Last 30 days · ${formatNumber(summary.pendingCheckouts)} checkouts not completed` : undefined}
        tone={summary && summary.failedLast30d > 0 ? "danger" : "warning"}
      />
    </div>
  );
};
