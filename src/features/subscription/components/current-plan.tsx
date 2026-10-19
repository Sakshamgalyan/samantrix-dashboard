"use client";

import { Card, Chip, ProgressBar, Button, Typography } from "@galyan/ui";
import { Plus, Users, Sparkles } from "lucide-react";
import { formatDate } from "@/utils/format";
import { money, PLAN_LABELS } from "@/features/payments/common/constants";
import type { MyBilling } from "@/features/subscription/types/api";

export interface CurrentPlanProps {
  data: MyBilling;
  onAddSeats: () => void;
}

export const CurrentPlan = ({ data, onAddSeats }: CurrentPlanProps) => {
  const sub = data.subscription;
  const purchased = data.seats.purchased;
  const used = data.seats.used;
  const pct = purchased > 0 ? Math.min(100, Math.round((used / purchased) * 100)) : 0;
  const planTier = sub?.planTier ?? data.planTier;

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--gy-primary)]/15 text-[var(--gy-primary)]">
            <Sparkles className="size-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base sm:text-lg">
                {PLAN_LABELS[planTier]} plan
              </Typography>
              <Chip variant={sub?.isActivePaid ? "success" : "soft"} size="xs">
                {sub?.isActivePaid ? "Active" : sub?.status === "trialing" ? "Trial" : (sub?.status ?? "No subscription")}
              </Chip>
              {sub?.isActivePaid && (
                <Chip variant="neutral" size="xs">
                  {sub.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}
                </Chip>
              )}
            </div>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm leading-relaxed">
              {sub?.isActivePaid
                ? `${money(sub.amount, sub.currency)} + GST per ${sub.billingCycle === "YEARLY" ? "year" : "month"} · renews ${formatDate(sub.currentPeriodEnd)}`
                : sub?.status === "trialing"
                  ? `Trial ends ${formatDate(sub.currentPeriodEnd)}. Choose a plan below to keep your workspace.`
                  : "Choose a plan below to unlock paid features."}
            </Typography>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:shrink-0">
          <div className="w-full sm:w-64 space-y-1.5 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[var(--gy-text-secondary)]">
                <Users className="size-3.5" />
                <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs">
                  Seats
                </Typography>
              </span>
              <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="text-xs">
                {used} used{purchased > 0 ? ` of ${purchased}` : ""}
              </Typography>
            </div>
            <ProgressBar progress={pct} size="sm" variant={pct >= 90 ? "warning" : "primary"} showLabel={false} />
          </div>

          {sub?.isActivePaid && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
              onClick={onAddSeats}
              className="w-full sm:w-auto"
            >
              Add seats
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
