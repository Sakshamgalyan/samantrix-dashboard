"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Banner,
  Button,
  Card,
  Chip,
  Skeleton,
  Tabs,
  Typography,
} from "@galyan/ui";
import { CreditCard, Lock, RotateCw } from "lucide-react";
import { pageParams } from "@/features/common/pagination";
import {
  LONG_LIVED_QUERY,
  useGetFinancePlansQuery,
  useGetPaymentsConfigQuery,
} from "@/features/payments/context/api";
import { POLL_INTERVAL_MS } from "@/store";
import { useGetMyPaymentsQuery } from "@/features/subscription/context/api";
import { useMyBilling } from "@/features/subscription/billing-api";
import {
  ACTIVE_PLANS,
  CYCLE_TABS,
  RECENT_PAYMENTS,
} from "@/features/subscription/common/constants";
import { useSubscription } from "@/features/subscription/context";
import {
  setCycleAction,
  openCheckoutAction,
  closeCheckoutAction,
} from "@/features/subscription/context/action";
import type { BillingCycle, PlanTier } from "@/features/subscription/types/api";
import { CurrentPlan } from "@/features/subscription/components/current-plan";
import { PlanCard } from "@/features/subscription/components/plan-card";
import { RecentPaymentsCard } from "@/features/subscription/components/recent-payments-card";

const CheckoutModal = dynamic(
  () =>
    import("@/features/subscription/components/checkout-modal").then(
      (m) => m.CheckoutModal,
    ),
  { ssr: false },
);

const POLLING = {
  pollingInterval: POLL_INTERVAL_MS,
  skipPollingIfUnfocused: true,
} as const;

export const SubscriptionContent = () => {
  const { state, dispatch } = useSubscription();
  const { cycle, checkout, checkoutKey } = state;
  const { data, error, forbidden, loading, reload } = useMyBilling();

  const plans =
    useGetFinancePlansQuery(ACTIVE_PLANS, {
      ...LONG_LIVED_QUERY,
      skip: forbidden,
    }).data ?? [];
  const config = useGetPaymentsConfigQuery(undefined, {
    ...LONG_LIVED_QUERY,
    skip: forbidden,
  }).data;
  const firstPage = useMemo(() => pageParams(1), []);
  const payments = useGetMyPaymentsQuery(firstPage, {
    ...POLLING,
    skip: forbidden,
  }).data;
  const paymentsEnabled = config?.enabled ?? false;

  if (forbidden) {
    return (
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-warning)]/15 text-[var(--gy-warning)]">
            <Lock className="size-5" />
          </div>
          <div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-sm sm:text-base"
            >
              Access Restricted
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="text-xs sm:text-sm"
            >
              Only organization owners and administrators can view and change
              the subscription plan.
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton height="110px" />
        <Skeleton height="96px" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="280px" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          description={error ?? "Couldn't load billing."}
        />
        <Button size="sm" variant="secondary" onClick={() => void reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const sub = data.subscription;
  const seatsDefault = 1;
  const choose = (planTier: PlanTier) =>
    dispatch(
      openCheckoutAction({
        purpose: "PLAN",
        planTier,
        billingCycle: cycle,
        seats: seatsDefault,
      }),
    );
  const recent = (payments?.data ?? []).slice(0, RECENT_PAYMENTS);

  return (
    <div className="space-y-5">
      {/* Elevated Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm">
                Subscription &amp; Plans
              </Chip>
              <Chip
                variant={sub?.isActivePaid ? "success" : "neutral"}
                size="sm"
              >
                {sub?.isActivePaid ? "Active subscription" : "Free tier"}
              </Chip>
              <Chip variant="neutral" size="sm">
                {data.seats.used} of {data.seats.purchased || data.seats.used}{" "}
                seats used
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Subscription &amp; Billing Tier
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Manage workplace tiers, expand active collaborator seat capacity,
              review current invoices, and toggle billing cycles.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                <RotateCw
                  className={`size-3.5 ${loading ? "animate-spin" : ""}`}
                />
              }
              disabled={loading}
              onClick={() => void reload()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <CurrentPlan
        data={data}
        onAddSeats={() =>
          dispatch(openCheckoutAction({ purpose: "SEATS", seats: 1 }))
        }
      />

      {/* Plan selection & Billing Cycle tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-[var(--gy-primary)]" />
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-base sm:text-lg"
            >
              Available plans
            </Typography>
          </div>
          <Typography
            variant="p"
            textColor="var(--gy-text-secondary)"
            className="text-xs sm:text-sm"
          >
            Per-seat pricing in INR;{" "}
            {config?.taxPercent
              ? `${config.taxPercent}% GST is applied at checkout.`
              : "taxes included / zero GST at checkout."}
          </Typography>
        </div>
        <div className="w-full sm:w-56 shrink-0">
          <Tabs
            items={CYCLE_TABS}
            activeTab={cycle}
            onTabChange={(id) => dispatch(setCycleAction(id as BillingCycle))}
            variant="card"
            size="sm"
            fullWidth
          />
        </div>
      </div>

      {config && !paymentsEnabled && (
        <Banner
          variant="warning"
          size="sm"
          bannerStyle="subtle"
          description="Online payments are currently paused. To upgrade or modify your workspace plan, contact your Simantrix account representative."
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            current={Boolean(
              sub?.isActivePaid &&
              sub.planTier === plan.planTier &&
              sub.billingCycle === cycle,
            )}
            onChoose={() => choose(plan.planTier)}
          />
        ))}
      </div>

      <RecentPaymentsCard payments={recent} />

      <CheckoutModal
        key={checkoutKey}
        request={checkout}
        paymentsEnabled={paymentsEnabled}
        onClose={() => dispatch(closeCheckoutAction())}
      />
    </div>
  );
};
