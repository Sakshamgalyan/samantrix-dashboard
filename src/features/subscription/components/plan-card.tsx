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
  const isEnterprise = plan.planTier === "ENTERPRISE";
  const isStarter = plan.planTier === "STARTER";
  const isPro = plan.planTier === "PROFESSIONAL";
  const free = plan.pricePerSeatMonthly === 0 && plan.pricePerSeatYearly === 0;

  // Strikethrough promotional cut prices
  const originalMonthly = isStarter ? 499 : isPro ? 999 : null;
  const originalYearly = isStarter ? 4990 : isPro ? 9990 : null;
  const originalPrice = cycle === "YEARLY" ? originalYearly : originalMonthly;

  const price = isStarter
    ? cycle === "YEARLY"
      ? plan.pricePerSeatYearly > 0
        ? plan.pricePerSeatYearly
        : 2490
      : plan.pricePerSeatMonthly > 0
        ? plan.pricePerSeatMonthly
        : 249
    : isPro
      ? cycle === "YEARLY"
        ? plan.pricePerSeatYearly > 0
          ? plan.pricePerSeatYearly
          : 5490
        : plan.pricePerSeatMonthly > 0
          ? plan.pricePerSeatMonthly
          : 549
      : cycle === "YEARLY"
        ? plan.pricePerSeatYearly
        : plan.pricePerSeatMonthly;

  const yearlySaving =
    plan.pricePerSeatMonthly > 0
      ? Math.round(
          (1 - plan.pricePerSeatYearly / (plan.pricePerSeatMonthly * 12)) * 100,
        )
      : 0;

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
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-sm sm:text-base"
            >
              {plan.name}
            </Typography>
            {current ? (
              <Chip variant="primary" size="xs">
                Current
              </Chip>
            ) : isStarter ? (
              <Chip variant="primary" size="xs">
                50% OFF
              </Chip>
            ) : isPro ? (
              <Chip variant="success" size="xs">
                45% OFF
              </Chip>
            ) : null}
          </div>
          {plan.description && (
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="mt-1 text-xs leading-relaxed"
            >
              {plan.description}
            </Typography>
          )}
        </div>

        <div className="space-y-1 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3">
          {isEnterprise ? (
            <div className="py-0.5">
              <Typography
                variant="h2"
                weight="bold"
                textColor="var(--gy-text)"
                className="text-xl sm:text-2xl"
              >
                Contact Sales
              </Typography>
              <Typography
                variant="p"
                textColor="var(--gy-text-subtle)"
                className="text-xs"
              >
                Custom dedicated deployment & SLA
              </Typography>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-1.5">
                {originalPrice ? (
                  <span className="text-sm font-semibold line-through text-[var(--gy-text-subtle)] opacity-70">
                    {money(originalPrice, plan.currency)}
                  </span>
                ) : null}
                <Typography
                  variant="h2"
                  weight="bold"
                  textColor="var(--gy-text)"
                  className="text-xl sm:text-2xl"
                >
                  {free ? "Free" : money(price, plan.currency)}
                </Typography>
                {!free && (
                  <Typography
                    variant="span"
                    textColor="var(--gy-text-subtle)"
                    className="text-xs"
                  >
                    / seat / {cycle === "YEARLY" ? "year" : "month"}
                  </Typography>
                )}
              </div>
              {!free && cycle === "YEARLY" && yearlySaving > 0 && (
                <Typography
                  variant="p"
                  weight="medium"
                  textColor="var(--gy-success)"
                  className="text-xs"
                >
                  Save {yearlySaving}% vs monthly
                </Typography>
              )}
            </>
          )}
          <Typography
            variant="p"
            textColor="var(--gy-text-subtle)"
            className="text-xs"
          >
            {plan.minSeats}
            {plan.maxSeats ? `–${plan.maxSeats}` : "+"} seats included
          </Typography>
        </div>

        <ul className="flex-1 space-y-2 py-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--gy-success)]" />
              <Typography
                variant="span"
                textColor="var(--gy-text-secondary)"
                className="text-xs leading-tight"
              >
                {f}
              </Typography>
            </li>
          ))}
        </ul>

        {isEnterprise ? (
          <Button
            as="a"
            href="mailto:sales@simantrix.com?subject=Enterprise%20Plan%20Inquiry"
            variant="outline"
            size="sm"
            fullWidth
            className="mt-2 text-center"
          >
            Contact Sales
          </Button>
        ) : !free ? (
          <Button
            variant={current ? "secondary" : "primary"}
            size="sm"
            fullWidth
            onClick={onChoose}
            className="mt-2"
          >
            {current ? "Renew / change seats" : "Choose plan"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
