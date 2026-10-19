"use client";

import React from "react";
import { Card, Chip, AnimatedNumber, ProgressBar, Typography } from "@galyan/ui";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { useUsersContext } from "@/features/users/context";

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export function UsersKpis() {
  const { state } = useUsersContext();
  const {
    totalMembers,
    seatLimit,
    activeCount,
    suspendedCount,
    pendingInvites,
    seatUtilizationPercent,
  } = state;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Total team seats
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]`}>
            <Users className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
            <AnimatedNumber value={totalMembers} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
            / {seatLimit} seats
          </Typography>
        </div>
        <div className="mt-2.5">
          <ProgressBar
            progress={seatUtilizationPercent}
            variant="primary"
            size="sm"
            showLabel={false}
          />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
          {seatUtilizationPercent}% utilized
        </Typography>
      </Card>

      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Active teammates
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-success)]/10 text-[var(--gy-success)]`}>
            <UserCheck className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-success)]">
            <AnimatedNumber value={activeCount} />
          </div>
          <Chip variant="success" size="sm">
            Active
          </Chip>
        </div>
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div
            className="h-full bg-[var(--gy-success)] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(10, (activeCount / (totalMembers || 1)) * 100))}%` }}
          />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
          Full digital workplace access
        </Typography>
      </Card>

      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Suspended
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-danger)]/10 text-[var(--gy-danger)]`}>
            <UserX className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-danger)]">
            <AnimatedNumber value={suspendedCount} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs truncate">
            access revoked
          </Typography>
        </div>
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div
            className="h-full bg-[var(--gy-danger)] transition-all duration-500"
            style={{ width: `${Math.min(100, (suspendedCount / (totalMembers || 1)) * 100)}%` }}
          />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
          Temporarily blocked
        </Typography>
      </Card>

      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Pending invites
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]`}>
            <Clock className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-warning)]">
            <AnimatedNumber value={pendingInvites} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs truncate">
            awaiting response
          </Typography>
        </div>
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div
            className="h-full bg-[var(--gy-warning)] transition-all duration-500"
            style={{ width: `${Math.min(100, (pendingInvites / (totalMembers || 1)) * 100)}%` }}
          />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
          Invited team members
        </Typography>
      </Card>
    </div>
  );
}
