"use client";

import React from "react";
import Link from "next/link";
import { Button, Card, Chip, Toggle, Typography } from "@galyan/ui";
import { Lock, ArrowRight } from "lucide-react";
import type { OrgFeatureState } from "@/features/features/types/api";
import { getFeatureIcon } from "@/features/features/common/constants";

export interface FeatureCardProps {
  feature: OrgFeatureState;
  canEdit: boolean;
  isToggling: boolean;
  onToggle: (key: string, enabled: boolean) => void;
}

export const FeatureCard = ({
  feature,
  canEdit,
  isToggling,
  onToggle,
}: FeatureCardProps) => {
  const isAllowed = feature.isAllowed;
  const isEnabled = feature.isEnabled;

  const displayName =
    feature.name ||
    feature.key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const displayDescription =
    feature.description ||
    "Organization workspace feature capability and integration module.";

  const minTierName = feature.minTier || "STARTER";

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className={`group relative flex flex-col justify-between transition-all duration-200 border bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] hover:shadow-md ${
        !isAllowed
          ? "opacity-85 border-dashed border-[var(--gy-border)] bg-[var(--gy-surface-subtle)]"
          : "border-[var(--gy-border)]"
      }`}
    >
      <div className="space-y-3">
        {/* Top bar: Icon + Category + Status Chip */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] transition-transform duration-200 group-hover:scale-105 shrink-0">
              {React.createElement(getFeatureIcon(feature.key, feature.category), {
                className: "size-4.5",
              })}
            </div>
            {feature.category && (
              <Chip size="xs" variant="neutral">
                {feature.category}
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isAllowed ? (
              <Chip
                size="xs"
                variant="warning"
                icon={<Lock className="size-2.5" />}
              >
                {minTierName} Plan
              </Chip>
            ) : isEnabled ? (
              <Chip
                size="xs"
                variant="success"
                icon={
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                }
              >
                Active
              </Chip>
            ) : (
              <Chip
                size="xs"
                variant="neutral"
                icon={
                  <span className="inline-block size-1.5 rounded-full bg-neutral-400" />
                }
              >
                Disabled
              </Chip>
            )}
          </div>
        </div>

        {/* Feature Information */}
        <div className="space-y-1">
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text)"
            className="text-base tracking-tight truncate"
          >
            {displayName}
          </Typography>

          <Typography
            variant="small"
            textColor="var(--gy-text-subtle)"
            className="font-mono text-[10px] uppercase tracking-wider block"
          >
            {feature.key}
          </Typography>

          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs line-clamp-2 leading-relaxed min-h-[2.25rem]"
          >
            {displayDescription}
          </Typography>
        </div>
      </div>

      {/* Card Footer: Toggle or Upgrade action */}
      <div className="mt-3.5 border-t border-[var(--gy-border)] pt-2.5">
        {isAllowed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full transition-colors ${
                  isEnabled ? "bg-emerald-500" : "bg-neutral-400"
                }`}
              />
              <Typography
                variant="small"
                weight="medium"
                textColor={isEnabled ? "var(--gy-text)" : "var(--gy-text-secondary)"}
                className="text-xs"
              >
                {isEnabled ? "Enabled in workspace" : "Disabled"}
              </Typography>
            </div>
            <Toggle
              checked={isEnabled}
              disabled={!canEdit || isToggling}
              onChange={(e) => onToggle(feature.key, e.target.checked)}
              aria-label={`Toggle ${displayName}`}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              Requires plan upgrade
            </Typography>
            <Button
              variant="link"
              size="xs"
              href="/organization/subscription"
              as={Link}
              rightIcon={<ArrowRight className="size-3" />}
            >
              Upgrade
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
