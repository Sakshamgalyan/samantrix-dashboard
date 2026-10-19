"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Banner, Button, Card, Chip, Skeleton, Tabs, Typography } from "@galyan/ui";
import { CreditCard, Lock, RotateCw } from "lucide-react";
import { pageParams } from "@/features/common/pagination";
import { POLL_INTERVAL_MS } from "@/store";
import { useGetMyInvoicesQuery, useGetMyPaymentsQuery } from "@/features/subscription/context/api";
import { useMyBilling } from "@/features/subscription/billing-api";
import { BILLING_TABS } from "@/features/billing/common/constants";
import { useBilling } from "@/features/billing/context";
import { setBillingPageAction, setBillingTabAction } from "@/features/billing/context/action";
import type { BillingTab } from "@/features/billing/types";
import { InvoicesTable } from "@/features/billing/components/invoices-table";
import { PaymentsTable } from "@/features/billing/components/payments-table";

const POLLING = { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true } as const;

export const BillingContent = () => {
  const { state, dispatch } = useBilling();
  const { tab, page } = state;
  const { data: billingData, error: billingError, forbidden, loading, reload } = useMyBilling();

  const queryParams = useMemo(() => pageParams(page), [page]);
  const invoicesQuery = useGetMyInvoicesQuery(queryParams, { ...POLLING, skip: forbidden || tab !== "INVOICES" });
  const paymentsQuery = useGetMyPaymentsQuery(queryParams, { ...POLLING, skip: forbidden || tab !== "PAYMENTS" });

  if (forbidden) {
    return (
      <Card variant="elevated" radius="xl" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-warning)]/15 text-[var(--gy-warning)]">
            <Lock className="size-5" />
          </div>
          <div>
            <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-sm sm:text-base">
              Access Restricted
            </Typography>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
              Only organization owners and administrators can view billing history and tax invoices.
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  if (loading && !billingData) {
    return (
      <div className="space-y-4">
        <Skeleton height="110px" />
        <Skeleton height="360px" />
      </div>
    );
  }

  if (!billingData && billingError) {
    return (
      <div className="space-y-3">
        <Banner variant="danger" size="sm" bannerStyle="subtle" description={billingError} />
        <Button size="sm" variant="secondary" onClick={() => void reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const invoices = invoicesQuery.data?.data ?? [];
  const invoicesMeta = invoicesQuery.data?.meta;
  const payments = paymentsQuery.data?.data ?? [];
  const paymentsMeta = paymentsQuery.data?.meta;

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
                Invoices &amp; Receipts
              </Chip>
              <Chip variant="neutral" size="sm">
                Tax Invoices
              </Chip>
              <Chip variant="success" size="sm">
                Razorpay Verified
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Invoices &amp; Billing History
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Download GST-compliant tax invoices, track historical card and UPI transactions, and reconcile team subscription statements.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />}
              disabled={loading}
              onClick={() => void reload()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>
            <Link href="/organization/subscription" className="flex-1 sm:flex-initial">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CreditCard className="size-3.5" />}
                className="w-full"
              >
                Manage plan &amp; seats
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Tabs
            items={BILLING_TABS}
            activeTab={tab}
            onTabChange={(id) => dispatch(setBillingTabAction(id as BillingTab))}
            variant="card"
            size="sm"
            fullWidth
          />
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        {tab === "INVOICES" ? (
          <InvoicesTable
            invoices={invoices}
            meta={invoicesMeta}
            onPageChange={(p) => dispatch(setBillingPageAction(p))}
          />
        ) : (
          <PaymentsTable
            payments={payments}
            meta={paymentsMeta}
            onPageChange={(p) => dispatch(setBillingPageAction(p))}
          />
        )}
      </Card>
    </div>
  );
};
