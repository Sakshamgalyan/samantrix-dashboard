"use client";

import React from "react";
import { Card, Chip, Button, Typography } from "@galyan/ui";
import { UserPlus, RotateCw } from "lucide-react";
import { useUsersContext } from "@/features/users/context";

export function UsersHeader() {
  const { state, refresh, openInviteDialog } = useUsersContext();
  const { suspendedCount, refreshing, canManageTeam, totalMembers } = state;

  return (
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
              Team directory &amp; roles
            </Chip>
            <Chip variant="neutral" size="sm">
              {totalMembers} licensed seats
            </Chip>
            {suspendedCount > 0 && (
              <Chip variant="danger" size="sm">
                {suspendedCount} suspended
              </Chip>
            )}
          </div>
          <Typography
            variant="h3"
            weight="bold"
            textColor="var(--gy-text)"
            className="text-lg sm:text-xl xl:text-2xl tracking-tight"
          >
            Team members &amp; seats
          </Typography>
          <Typography
            variant="p"
            textColor="var(--gy-text-secondary)"
            className="max-w-2xl text-xs sm:text-sm leading-relaxed"
          >
            Manage organization licenses, invite collaborators, adjust role
            privileges, and activate or suspend user access.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}
            disabled={refreshing}
            onClick={refresh}
            className="flex-1 sm:flex-initial"
          >
            Refresh
          </Button>

          {canManageTeam && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="size-3.5" />}
              onClick={openInviteDialog}
              className="flex-1 sm:flex-initial"
            >
              Invite member
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
