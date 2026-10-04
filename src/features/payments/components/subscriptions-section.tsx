"use client";

import { Chip, Input, Table, Tabs, type Column } from "@galyan/ui";
import { CreditCard, Search } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { formatDate, relativeTime } from "@/lib/format";
import {
  PLAN_LABELS,
  SUBSCRIPTION_STATUS_ORDER,
  money,
  orderStatuses,
  statusLabel,
  subscriptionChip,
} from "../common/constants";
import { usePaymentsContext } from "../context";
import type { SubscriptionRow } from "../types";

const columns: Column<SubscriptionRow>[] = [
  {
    key: "organization",
    header: "Organization",
    accessor: (row) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-[var(--gy-text)]">
          {row.organization.name}
        </span>
        <span className="truncate text-xs text-[var(--gy-text-secondary)]">
          {row.organization.slug}
        </span>
      </div>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    width: "130px",
    accessor: (row) => (
      <div className="flex flex-col">
        <span className="text-sm text-[var(--gy-text)]">
          {PLAN_LABELS[row.planTier] ?? row.planTier}
        </span>
        <span className="text-xs text-[var(--gy-text-secondary)]">
          {row.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}
        </span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "190px",
    accessor: (row) => (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Chip size="sm" variant={subscriptionChip(row.status)}>
          {statusLabel(row.status)}
        </Chip>
        {row.cancelAtPeriodEnd && row.status !== "canceled" && (
          <Chip size="sm" variant="warning">
            Cancels
          </Chip>
        )}
      </div>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    width: "140px",
    align: "right",
    accessor: (row) => (
      <div className="flex flex-col items-end whitespace-nowrap">
        <span className="text-sm font-medium text-[var(--gy-text)]">
          {money(row.amount, row.currency)}
          <span className="text-xs font-normal text-[var(--gy-text-secondary)]">
            {row.billingCycle === "YEARLY" ? " / yr" : " / mo"}
          </span>
        </span>
        {row.billingCycle === "YEARLY" && row.monthlyAmount > 0 && (
          <span className="text-xs text-[var(--gy-text-secondary)]">
            {money(row.monthlyAmount, row.currency)} / mo
          </span>
        )}
      </div>
    ),
  },
  {
    key: "periodEnd",
    header: "Period ends",
    width: "160px",
    accessor: (row) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="text-sm text-[var(--gy-text)]">
          {formatDate(row.currentPeriodEnd)}
        </span>
        <span className="text-xs text-[var(--gy-text-secondary)]">
          {relativeTime(row.currentPeriodEnd)}
        </span>
      </div>
    ),
  },
  {
    key: "createdAt",
    header: "Started",
    width: "130px",
    accessor: (row) => (
      <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

/** Every organization's subscription, filterable by status and searchable. */
export function SubscriptionsSection() {
  const {
    state,
    visibleSubscriptions,
    setSubscriptionTab,
    setSubscriptionSearch,
  } = usePaymentsContext();
  if (!state.data) return null;
  const { subscriptions, subscriptionStatuses, organizations } = state.data;

  const tabs = [
    { id: "ALL", label: `All · ${subscriptions.length}` },
    ...orderStatuses(subscriptionStatuses, SUBSCRIPTION_STATUS_ORDER).map(
      (s) => ({ id: s.status, label: `${statusLabel(s.status)} · ${s.count}` }),
    ),
  ];

  return (
    <GlassSection
      title="Subscriptions"
      subtitle={
        organizations.withoutSubscription > 0
          ? `${organizations.withSubscription} organizations with a subscription · ${organizations.withoutSubscription} without`
          : "Plan, status and billing period for every organization"
      }
    >
      {subscriptions.length === 0 ? (
        <SectionEmpty
          icon={<CreditCard className="size-5" />}
          title="No subscriptions yet"
          description="Organizations get a trial subscription when they register."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <Tabs
              items={tabs}
              activeTab={state.subscriptionTab}
              onTabChange={setSubscriptionTab}
              variant="button"
              size="sm"
            />
            <div className="w-full lg:w-72">
              <Input
                size="sm"
                placeholder="Search organization or plan…"
                value={state.subscriptionSearch}
                onChange={(e) => setSubscriptionSearch(e.target.value)}
                leftIcon={<Search className="size-3.5" />}
                clearable
                onClear={() => setSubscriptionSearch("")}
                fullWidth
                aria-label="Search subscriptions"
              />
            </div>
          </div>
          <Table<SubscriptionRow>
            columns={columns}
            data={visibleSubscriptions}
            rowKey={(row) => row.id}
            hoverable
            size="md"
            emptyStateLabel="No subscriptions match your filters"
          />
        </div>
      )}
    </GlassSection>
  );
}
