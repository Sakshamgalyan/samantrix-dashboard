"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody, Chip, ProgressBar, Typography } from "@galyan/ui";
import { Sparkles } from "lucide-react";
import type { AnalyticsOverview } from "@/features/analytics/types/api";

export interface AnalyticsModuleAdoptionProps {
  data?: AnalyticsOverview | null;
}

export function AnalyticsModuleAdoption({ data }: AnalyticsModuleAdoptionProps) {
  const featureRatio = data?.totalEntitledFeatures
    ? ((data.featuresEnabledCount || 0) / data.totalEntitledFeatures) * 100
    : 0;

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
    >
      <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <Typography
                variant="h4"
                weight="semibold"
                textColor="var(--gy-text)"
                className="text-base tracking-tight"
              >
                Module &amp; Feature Adoption
              </Typography>
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs"
              >
                Enterprise modules deployed across your workplace
              </Typography>
            </div>
          </div>
          <Chip variant="soft" size="sm">
            {data?.featuresEnabledCount ?? 0} of {data?.totalEntitledFeatures ?? 0} active
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="p-0 pt-4">
        <div className="space-y-3.5 rounded-2xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs"
              >
                Feature enablement ratio
              </Typography>
              <Typography
                variant="span"
                weight="semibold"
                textColor="var(--gy-text)"
                className="text-xs font-mono"
              >
                {Math.round(featureRatio)}%
              </Typography>
            </div>
            <ProgressBar
              progress={Math.min(100, featureRatio)}
              size="md"
              variant="gradient"
              showLabel={false}
            />
          </div>

          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs leading-relaxed"
          >
            Enable advanced capabilities on the{" "}
            <Link
              href="/organization/features"
              className="font-medium text-[var(--gy-primary)] underline underline-offset-2 hover:opacity-80"
            >
              Feature Management
            </Link>{" "}
            page to empower your team with autonomous AI agents, spatial audio, and workflow automations.
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}
