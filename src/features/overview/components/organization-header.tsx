"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Chip, Typography } from "@galyan/ui";
import { Radio, Plus, RotateCw } from "lucide-react";

export interface OrganizationHeaderProps {
  orgName: string;
  planTier: string;
  socketStatus: string;
  latencyMs: number;
  canInvite: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function OrganizationHeader({
  orgName,
  planTier,
  socketStatus,
  latencyMs,
  canInvite,
  isRefreshing = false,
  onRefresh,
}: OrganizationHeaderProps) {
  const router = useRouter();

  return (
    <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Chip variant="soft" size="sm">
              Organization workspace
            </Chip>
            <Chip variant="success" size="sm">
              {planTier}
            </Chip>
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] px-2.5 py-0.5 text-xs font-medium text-[var(--gy-success)]">
              <Radio className="size-3 animate-pulse" />
              <span>
                Realtime {socketStatus} {latencyMs > 0 ? `(${latencyMs}ms)` : ""}
              </span>
            </div>
          </div>
          <Typography
            variant="h3"
            weight="bold"
            textColor="var(--gy-text)"
            className="text-lg sm:text-xl xl:text-2xl tracking-tight"
          >
            {orgName} Workplace Intelligence
          </Typography>
          <Typography
            variant="p"
            textColor="var(--gy-text-secondary)"
            className="max-w-2xl text-xs sm:text-sm leading-relaxed"
          >
            Virtual workplace capacity, member presence, departmental collaboration metrics, and real-time office
            floor activity.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              disabled={isRefreshing}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
          {canInvite && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
              onClick={() => router.push("/organization/users")}
            >
              Invite teammates
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
