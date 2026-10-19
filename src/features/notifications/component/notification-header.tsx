"use client";

import React from "react";
import { Button, Card, Typography } from "@galyan/ui";
import { CheckCheck, Plus, RefreshCw, Radio } from "lucide-react";
import { useNotifications } from "@/features/notifications/context";
import { useSocketStatus } from "@/features/realtime";

export const NotificationHeader: React.FC = () => {
  const { state, refresh, markAllAsRead, toggleCreateModal } = useNotifications();
  const { isConnected, latencyMs } = useSocketStatus();
  const { unreadCount, isLoading } = state;

  return (
    <Card variant="glass" radius="xl" padding="md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Typography variant="h2" className="text-lg font-bold text-[var(--gy-text)]">
              Notifications & Alerts
            </Typography>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <Radio className="size-3" />
              {isConnected
                ? `Live Feed (${latencyMs > 0 ? `${latencyMs}ms` : "Active"})`
                : "Reconnecting..."}
            </span>
          </div>

          <p className="text-xs text-[var(--gy-text-secondary)]">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                } synchronized across all devices in real-time.`
              : "All system and security notifications are caught up."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            leftIcon={
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin text-[var(--gy-primary)]" : ""}`}
              />
            }
            aria-label="Refresh notifications"
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="size-3.5" />}
              onClick={() => void markAllAsRead()}
            >
              Mark all read
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-3.5" />}
            onClick={() => toggleCreateModal(true)}
          >
            Dispatch Alert
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NotificationHeader;
