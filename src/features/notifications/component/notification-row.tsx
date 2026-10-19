"use client";

import React from "react";
import { Button, Card, Chip, Typography } from "@galyan/ui";
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import type { NotificationItem } from "@/features/notifications/types/api";
import { formatRelativeTime } from "@/features/notifications/common/format-time";

export interface NotificationRowProps {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({
  item,
  onMarkRead,
  onDelete,
}) => {
  const getCategoryConfig = (category: NotificationItem["category"]) => {
    switch (category) {
      case "security":
        return {
          icon: <ShieldAlert className="size-4.5 text-amber-500" />,
          bg: "bg-amber-500/10 border-amber-500/25 text-amber-500",
          chipVariant: "warning" as const,
          label: "Security",
        };
      case "system":
        return {
          icon: <Cpu className="size-4.5 text-cyan-500" />,
          bg: "bg-cyan-500/10 border-cyan-500/25 text-cyan-500",
          chipVariant: "neutral" as const,
          label: "System",
        };
      case "workspace":
        return {
          icon: <Sparkles className="size-4.5 text-emerald-500" />,
          bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-500",
          chipVariant: "soft" as const,
          label: "Workplace",
        };
      default:
        return {
          icon: <Bell className="size-4.5 text-[var(--gy-primary)]" />,
          bg: "bg-[var(--gy-primary)]/10 border-[var(--gy-primary)]/25 text-[var(--gy-primary)]",
          chipVariant: "primary" as const,
          label: "General",
        };
    }
  };

  const config = getCategoryConfig(item.category);
  const formattedTime = formatRelativeTime(item.createdAt);

  return (
    <Card
      variant="glass"
      radius="xl"
      padding="md"
      className={`group relative overflow-hidden transition-all duration-200 hover:border-[var(--gy-primary)]/40 hover:shadow-md ${
        !item.read
          ? "border-l-4 border-l-[var(--gy-primary)] bg-[color-mix(in_srgb,var(--gy-primary)_3%,var(--gy-surface))]"
          : "opacity-90"
      }`}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-105 ${config.bg}`}
          >
            {config.icon}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Typography
                variant="span"
                weight="semibold"
                className="text-sm text-[var(--gy-text)]"
              >
                {item.title}
              </Typography>

              {!item.read && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gy-primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--gy-primary)] ring-1 ring-[var(--gy-primary)]/30">
                  <span className="size-1.5 rounded-full bg-[var(--gy-primary)] animate-pulse" />
                  New
                </span>
              )}

              <Chip size="xs" variant={config.chipVariant}>
                {config.label}
              </Chip>
            </div>

            <Typography
              variant="small"
              className="text-xs text-[var(--gy-text-secondary)] leading-relaxed break-words"
            >
              {item.description}
            </Typography>

            <div className="flex items-center gap-2 pt-0.5 text-[11px] text-[var(--gy-text-subtle)]">
              <Clock className="size-3 shrink-0" />
              <span>{formattedTime}</span>
              {item.readAt && (
                <>
                  <span>•</span>
                  <span>Read</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 self-end sm:self-start shrink-0">
          {item.actionLabel && item.actionUrl && (
            <Button
              variant="outline"
              size="xs"
              href={item.actionUrl}
              rightIcon={<ExternalLink className="size-3" />}
              className="rounded-lg text-xs"
            >
              {item.actionLabel}
            </Button>
          )}

          {!item.read && (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<CheckCheck className="size-3.5 text-[var(--gy-primary)]" />}
              onClick={() => onMarkRead(item.id)}
              className="rounded-lg text-xs hover:bg-[var(--gy-primary)]/10"
              aria-label="Mark as read"
            >
              Mark read
            </Button>
          )}

          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Trash2 className="size-3.5 text-rose-500" />}
            onClick={() => onDelete(item.id)}
            className="rounded-lg text-xs hover:bg-rose-500/10 hover:text-rose-600"
            aria-label="Delete notification"
          />
        </div>
      </div>
    </Card>
  );
};

export default NotificationRow;
