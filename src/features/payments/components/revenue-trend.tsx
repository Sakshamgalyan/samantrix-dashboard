"use client";

import { useMemo } from "react";
import { AreaChart, Chip } from "@galyan/ui";
import { LineChart } from "lucide-react";
import { GLASS_ROW, GlassSection, SectionEmpty } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { formatMonth, money } from "../common/constants";
import { usePaymentsContext } from "../context";

/** Collected revenue per month (paid invoices + completed payments, net of refunds). */
export function RevenueTrend({ className }: { className?: string }) {
  const { state } = usePaymentsContext();
  const data = state.data;

  const chartData = useMemo(
    () =>
      (data?.monthlyRevenue ?? []).map((m) => ({
        label: formatMonth(m.month),
        collected: m.collected,
      })),
    [data],
  );

  if (!data) return null;
  const { revenue, monthlyRevenue, currency } = data;
  const payments12m = monthlyRevenue.reduce((sum, m) => sum + m.payments, 0);
  const hasRevenue = monthlyRevenue.some((m) => m.collected !== 0);

  const totals = [
    {
      label: "Collected · 30 days",
      value: money(revenue.collectedLast30d, currency),
    },
    {
      label: "Collected · 12 months",
      value: money(revenue.collectedLast12m, currency),
    },
    { label: "Payments · 12 months", value: formatNumber(payments12m) },
  ];

  return (
    <GlassSection
      className={className}
      title="Revenue collected"
      subtitle={`Paid invoices and completed payments per month, net of refunds (${currency})`}
      aside={
        <Chip variant="neutral" size="sm">
          Last 12 months
        </Chip>
      }
    >
      {hasRevenue ? (
        <div className="h-[280px] w-full">
          <AreaChart
            data={chartData}
            xAxisKey="label"
            height={270}
            series={[
              {
                key: "collected",
                name: `Collected (${currency})`,
                color: "var(--gy-success)",
              },
            ]}
          />
        </div>
      ) : (
        <SectionEmpty
          icon={<LineChart className="size-5" />}
          title="No revenue collected yet"
          description={
            revenue.payingOrganizations === 0
              ? "No organization is on a paid plan yet. Paid invoices and completed payments will appear here month by month."
              : "No paid invoices or completed payments in the last 12 months."
          }
        />
      )}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {totals.map((t) => (
          <div key={t.label} className={`${GLASS_ROW} px-3 py-2`}>
            <div className="text-lg font-semibold text-[var(--gy-text)]">
              {t.value}
            </div>
            <div className="text-xs text-[var(--gy-text-secondary)]">
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </GlassSection>
  );
}
