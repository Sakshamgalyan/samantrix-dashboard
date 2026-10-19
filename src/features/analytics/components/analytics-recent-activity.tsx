"use client";

import { Card, CardHeader, CardBody, Skeleton, EmptyState, Typography } from "@galyan/ui";
import { Clock } from "lucide-react";
import type { AuditLogItem } from "@/features/audit-logs/types/api";

export interface AnalyticsRecentActivityProps {
  activity: AuditLogItem[];
  loading: boolean;
}

export function AnalyticsRecentActivity({ activity, loading }: AnalyticsRecentActivityProps) {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
    >
      <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
            <Clock className="size-4.5" />
          </div>
          <div>
            <Typography
              variant="h4"
              weight="semibold"
              textColor="var(--gy-text)"
              className="text-base tracking-tight"
            >
              Recent Audit Stream
            </Typography>
            <Typography
              variant="small"
              textColor="var(--gy-text-secondary)"
              className="text-xs"
            >
              Live event logs from members and automated background tasks
            </Typography>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 pt-4">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="3rem" className="rounded-xl" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            size="sm"
            variant="glass"
            icon={<Clock className="size-6" />}
            title="No activity recorded"
            description="No telemetry events recorded yet in this workspace."
          />
        ) : (
          <div className="divide-y divide-[var(--gy-border)] overflow-hidden rounded-2xl border border-[var(--gy-border)]">
            {activity.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between gap-3 bg-[var(--gy-surface)] hover:bg-[var(--gy-surface-hover)] transition-colors px-3.5 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <Typography
                    variant="span"
                    weight="medium"
                    textColor="var(--gy-text)"
                    className="truncate block capitalize text-xs"
                  >
                    {act.action.replace(/_/g, " ").toLowerCase()}
                  </Typography>
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-secondary)"
                    className="truncate block text-[11px]"
                  >
                    {act.actorEmail || "System"} {act.target ? `· ${act.target}` : ""}
                  </Typography>
                </div>
                <Typography
                  variant="small"
                  textColor="var(--gy-text-subtle)"
                  className="shrink-0 font-mono text-[11px]"
                >
                  {new Date(act.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
