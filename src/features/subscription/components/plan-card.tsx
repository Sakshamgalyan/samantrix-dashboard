"use client";

import { Button, Card, Chip, Typography } from "@galyan/ui";
import { CheckCircle2 } from "lucide-react";
import { money } from "@/features/payments/common/constants";
import type { BillingCycle, Plan } from "@/features/subscription/types/api";

export interface PlanCardProps {
  plan: Plan;
  cycle: BillingCycle;
  current: boolean;
  onChoose: () => void;
}

export const PlanCard = ({ plan, cycle, current, onChoose }: PlanCardProps) => {
  const price = cycle === "YEARLY" ? plan.pricePerSeatYearly : plan.pricePerSeatMonthly;
  const free = plan.pricePerSeatMonthly === 0 && plan.pricePerSeatYearly === 0;
  const yearlySaving =
    plan.pricePerSeatMonthly > 0 ? Math.round((1 - plan.pricePerSeatYearly / (plan.pricePerSeatMonthly * 12)) * 100) : 0;

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className={`border transition-shadow flex flex-col justify-between ${
        current
          ? "border-[var(--gy-primary)] ring-2 ring-[var(--gy-primary)] bg-[var(--gy-surface)] shadow-md"
          : "border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-hover)]"
      }`}
    >
      <div className="flex h-full flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-sm sm:text-base">
              {plan.name}
            </Typography>
            {current && (
              <Chip variant="primary" size="xs">
                Current
              </Chip>
            )}
          </div>
          {plan.description && (
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="mt-1 text-xs leading-relaxed">
              {plan.description}
            </Typography>
          )}
        </div>

        <div className="space-y-1 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3">
          <div className="flex items-baseline gap-1">
            <Typography variant="h2" weight="bold" textColor="var(--gy-text)" className="text-xl sm:text-2xl">
              {free ? "Free" : money(price, plan.currency)}
            </Typography>
            {!free && (
              <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
                / seat / {cycle === "YEARLY" ? "year" : "month"}
              </Typography>
            )}
          </div>
          {!free && cycle === "YEARLY" && yearlySaving > 0 && (
            <Typography variant="p" weight="medium" textColor="var(--gy-success)" className="text-xs">
              Save {yearlySaving}% vs monthly
            </Typography>
          )}
          <Typography variant="p" textColor="var(--gy-text-subtle)" className="text-xs">
            {plan.minSeats}
            {plan.maxSeats ? `–${plan.maxSeats}` : "+"} seats included
          </Typography>
        </div>

        <ul className="flex-1 space-y-2 py-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--gy-success)]" />
              <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs leading-tight">
                {f}
              </Typography>
            </li>
          ))}
        </ul>

        {!free && (
          <Button
            variant={current ? "secondary" : "primary"}
            size="sm"
            fullWidth
            onClick={onChoose}
            className="mt-2"
          >
            {current ? "Renew / change seats" : "Choose plan"}
          </Button>
        )}
      </div>
    </Card>
  );
};
