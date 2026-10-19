"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@galyan/ui";
import { CreditCard, Receipt } from "lucide-react";
import { formatDate } from "@/utils/format";
import { money, PAYMENT_STATUS, PLAN_LABELS } from "@/features/payments/common/constants";
import type { MyPaymentRow } from "@/features/subscription/types/api";

export interface RecentPaymentsCardProps {
  payments: MyPaymentRow[];
}

export const RecentPaymentsCard = ({ payments }: RecentPaymentsCardProps) => {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--gy-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
            <CreditCard className="size-4" />
          </div>
          <div>
            <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-sm sm:text-base">
              Recent payments
            </Typography>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs">
              Latest transactions processed for this tenant
            </Typography>
          </div>
        </div>
        <Link
          href="/organization/billing"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--gy-primary)] hover:underline"
        >
          <Receipt className="size-3.5" />
          <Typography variant="span" weight="medium" textColor="var(--gy-primary)" className="text-xs">
            All invoices
          </Typography>
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="py-6 text-center">
          <Typography variant="p" textColor="var(--gy-text-subtle)" className="text-xs">
            No payments recorded yet.
          </Typography>
        </div>
      ) : (
        <div className="divide-y divide-[var(--gy-border)] overflow-x-auto">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 text-xs hover:bg-[var(--gy-surface-hover)] px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Typography variant="span" textColor="var(--gy-text-secondary)" className="w-28 shrink-0 text-xs font-mono">
                  {formatDate(p.paidAt ?? p.createdAt)}
                </Typography>
                <Typography variant="span" textColor="var(--gy-text)" weight="medium" className="truncate text-xs">
                  {p.planTier ? PLAN_LABELS[p.planTier] : "Payment"}
                  {p.seats ? ` · ${p.seats} seat${p.seats === 1 ? "" : "s"}` : ""}
                </Typography>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <Chip variant={PAYMENT_STATUS[p.status].chip} size="xs">
                  {PAYMENT_STATUS[p.status].label}
                </Chip>
                <Typography variant="span" weight="bold" textColor="var(--gy-text)" className="w-24 text-right text-xs">
                  {money(p.amount, p.currency, 2)}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
