"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Banner, Button, Card, Chip, Skeleton, Toggle, useToast } from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { OrgSubscription } from "@/types/dashboard";
import { CheckCircle2, HardDrive, Users, RefreshCw } from "lucide-react";

interface PlanTierCard {
  tier: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  description: string;
  seats: string;
  storage: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanTierCard[] = [
  {
    tier: "FREE",
    name: "Free Trial",
    priceMonthly: "$0",
    priceAnnual: "$0",
    description: "Ideal for testing digital office capabilities with a core team.",
    seats: "Up to 5 seats",
    storage: "5 GB Cloud Storage",
    features: ["Standard 3D Office", "Screen Sharing & Text Chat", "Basic Analytics"],
  },
  {
    tier: "STARTER",
    name: "Starter",
    priceMonthly: "$29",
    priceAnnual: "$24/mo",
    description: "Designed for small agile squads and startup studios.",
    seats: "Up to 15 seats",
    storage: "25 GB Cloud Storage",
    features: ["All Free Features", "AI Virtual Agent", "Custom Office Layouts", "Email Support"],
  },
  {
    tier: "PROFESSIONAL",
    name: "Professional",
    priceMonthly: "$89",
    priceAnnual: "$75/mo",
    description: "For growing organizations requiring analytics and automation.",
    seats: "Up to 50 seats",
    storage: "100 GB Cloud Storage",
    features: [
      "All Starter Features",
      "Real-time Telemetry & Heatmaps",
      "Data Automation Pipelines",
      "API Keys & Webhooks",
      "SOC2 Audit Export",
    ],
    popular: true,
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise",
    priceMonthly: "$249",
    priceAnnual: "$210/mo",
    description: "Unlimited scale with dedicated virtual buildings and custom SSO.",
    seats: "Unlimited seats",
    storage: "1 TB+ Dedicated Storage",
    features: [
      "All Professional Features",
      "Mandatory 2FA Policy Enforcement",
      "Okta/SAML SSO Integration",
      "Slack & Teams Bridge",
      "99.9% Uptime SLA",
      "Dedicated Solutions Architect",
    ],
  },
];

export default function SubscriptionPage() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<OrgSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get<OrgSubscription>("/organizations/me/subscription")
      .then((data) => {
        if (!active) return;
        setSubscription(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Failed to load subscription details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const fetchSubscription = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const currentTier = organization?.planTier || subscription?.planTier || "FREE";
  const currentStatus = organization?.status || subscription?.status || "ACTIVE";

  const handleUpgrade = (plan: PlanTierCard) => {
    toast.info("Payment gateway integration in progress", {
      description: `Your organization request for ${plan.name} has been queued for provisioning.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[var(--gy-text)]">Subscription &amp; plan</h2>
            <Chip variant="soft" size="sm">
              Tier: {currentTier}
            </Chip>
          </div>
          <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
            Review active licensing, plan limits, billing intervals, and available upgrade tiers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="size-4" />}
          onClick={fetchSubscription}
        >
          Refresh details
        </Button>
      </div>

      {error && (
        <Banner
          variant="danger"
          title="Could not load subscription"
          description={error}
          button={
            <Button variant="danger-soft" size="sm" onClick={fetchSubscription}>
              Retry
            </Button>
          }
        />
      )}

      {/* Current plan */}
      <Card variant="elevated" padding="lg" radius="xl" className="border border-[var(--gy-primary)]/30">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--gy-primary)]">Current subscription</span>
              <Chip variant="success" size="sm">
                {currentStatus}
              </Chip>
            </div>

            {loading ? (
              <Skeleton variant="text" width="12rem" height="2rem" />
            ) : (
              <h3 className="text-3xl font-bold text-[var(--gy-text)]">{currentTier} tier</h3>
            )}

            <p className="max-w-lg text-sm text-[var(--gy-text-secondary)]">
              {currentTier === "FREE"
                ? "Your organization is currently on a trial tier. Upgrade to unlock autonomous AI agents, persistent custom layouts, and unlimited telemetry."
                : "Your organization has active full-featured digital workplace capabilities."}
            </p>
          </div>

          <div className="min-w-[240px] space-y-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--gy-text-secondary)]">Billing cycle</span>
              <span className="font-semibold text-[var(--gy-text)]">{organization?.billingCycle || "MONTHLY"}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--gy-text-secondary)]">Next renewal</span>
              <span className="font-semibold text-[var(--gy-primary)]">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "Auto-Renews in 14 days"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--gy-text-secondary)]">Seat allocation</span>
              <span className="font-semibold text-[var(--gy-text)]">{subscription?.maxSeats || 10} Seats</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Cycle toggle */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <span
          className={`text-sm font-semibold ${
            billingCycle === "MONTHLY" ? "text-[var(--gy-text)]" : "text-[var(--gy-text-secondary)]"
          }`}
        >
          Monthly billing
        </span>
        <Toggle
          aria-label="Toggle annual billing"
          checked={billingCycle === "ANNUAL"}
          onChange={() => setBillingCycle(billingCycle === "MONTHLY" ? "ANNUAL" : "MONTHLY")}
        />
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-semibold ${
              billingCycle === "ANNUAL" ? "text-[var(--gy-text)]" : "text-[var(--gy-text-secondary)]"
            }`}
          >
            Annual billing
          </span>
          <Chip variant="success" size="sm">
            Save 20%
          </Chip>
        </div>
      </div>

      {/* Pricing matrix */}
      <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const borderClass = plan.popular
            ? "border-[var(--gy-primary)]/50"
            : isCurrent
              ? "border-[var(--gy-success)]/40"
              : "border-[var(--gy-border)]";
          return (
            <Card
              key={plan.tier}
              variant={plan.popular ? "elevated" : "default"}
              padding="lg"
              radius="xl"
              hoverEffect="lift"
              className={`relative flex flex-col justify-between overflow-visible border ${borderClass}`}
            >
              {plan.popular && (
                <div className="absolute right-6 top-0 -translate-y-1/2">
                  <Chip variant="solid" size="sm">
                    Most popular
                  </Chip>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--gy-text)]">{plan.name}</h3>
                  <p className="mt-1 min-h-[40px] text-sm text-[var(--gy-text-secondary)]">{plan.description}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[var(--gy-text)]">
                      {billingCycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-sm text-[var(--gy-text-subtle)]">
                      {plan.tier === "FREE" ? "forever" : billingCycle === "ANNUAL" ? "" : "/month"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--gy-text-secondary)]">
                    <Users className="size-4 shrink-0 text-[var(--gy-primary)]" />
                    <span>{plan.seats}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-[var(--gy-text-secondary)]">
                    <HardDrive className="size-4 shrink-0 text-[var(--gy-info)]" />
                    <span>{plan.storage}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[var(--gy-divider)] pt-3">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-sm text-[var(--gy-text-secondary)]">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gy-success)]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                {isCurrent ? (
                  <Button variant="success" outline fullWidth disabled leftIcon={<CheckCircle2 className="size-4" />}>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    fullWidth
                    onClick={() => handleUpgrade(plan)}
                  >
                    {plan.tier === "ENTERPRISE" ? "Contact enterprise" : "Upgrade plan"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
