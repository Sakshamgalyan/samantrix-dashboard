"use client";

import { Chip } from "@galyan/ui";
import {
  AdminHero,
  AdminLoadError,
  AdminPageSkeleton,
  StaleDataBanner,
} from "@/components/admin";
import { usePaymentsContext } from "../context";
import { RevenueKpis } from "./revenue-kpis";
import { RevenueTrend } from "./revenue-trend";
import { PlanDistribution } from "./plan-distribution";
import { SubscriptionsSection } from "./subscriptions-section";
import { InvoicesSection } from "./invoices-section";

export function PaymentsContent() {
  const { state, refresh } = usePaymentsContext();
  const { data, error, refreshing } = state;

  if (!data) {
    return error ? (
      <AdminLoadError
        title="Billing data unavailable"
        message={error}
        onRetry={refresh}
      />
    ) : (
      <AdminPageSkeleton />
    );
  }

  const { revenue, currency } = data;

  return (
    <div className="space-y-6">
      {error && <StaleDataBanner error={error} />}

      <AdminHero
        title="Payments & services"
        description={`Recurring revenue, collected payments, subscriptions and invoices across every organization. Totals are in ${currency}; MRR counts active and past-due plans with yearly plans divided by 12.`}
        chips={
          <>
            <Chip variant="soft" size="sm">
              Platform billing
            </Chip>
            {revenue.pastDueSubscriptions > 0 && (
              <Chip variant="danger" size="sm">
                {revenue.pastDueSubscriptions} past due
              </Chip>
            )}
            {revenue.otherCurrencySubscriptions > 0 && (
              <Chip variant="neutral" size="sm">
                {revenue.otherCurrencySubscriptions} billed in other currencies
                (not in totals)
              </Chip>
            )}
          </>
        }
        onRefresh={refresh}
        refreshing={refreshing}
        updatedAt={data.generatedAt}
      />

      <RevenueKpis />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RevenueTrend className="lg:col-span-2" />
        <PlanDistribution />
      </div>

      <SubscriptionsSection />
      <InvoicesSection />
    </div>
  );
}
