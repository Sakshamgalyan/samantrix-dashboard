"use client";

import React, { useMemo } from "react";
import { Card, Typography } from "@galyan/ui";
import { Bell, ShieldAlert, Cpu, Sparkles } from "lucide-react";
import { useNotifications } from "@/features/notifications/context";

export const NotificationStats: React.FC = () => {
  const { state } = useNotifications();
  const { notifications, unreadCount } = state;

  const stats = useMemo(() => {
    const total = notifications.length;
    const security = notifications.filter((n) => n.category === "security").length;
    const system = notifications.filter((n) => n.category === "system").length;
    const workspace = notifications.filter((n) => n.category === "workspace").length;

    return { total, security, system, workspace };
  }, [notifications]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card variant="glass" radius="xl" padding="md" className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--gy-text-secondary)]">Total Alerts</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
            <Bell className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <Typography variant="h3" className="text-xl font-bold text-[var(--gy-text)]">
            {stats.total}
          </Typography>
          <span className="text-[11px] text-[var(--gy-text-subtle)]">Recorded</span>
        </div>
      </Card>

      <Card variant="glass" radius="xl" padding="md" className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--gy-text-secondary)]">Unread Action</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <Typography variant="h3" className="text-xl font-bold text-amber-500">
            {unreadCount}
          </Typography>
          <span className="text-[11px] text-[var(--gy-text-subtle)]">
            {unreadCount > 0 ? "Needs review" : "All clear"}
          </span>
        </div>
      </Card>

      <Card variant="glass" radius="xl" padding="md" className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--gy-text-secondary)]">Security</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <ShieldAlert className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <Typography variant="h3" className="text-xl font-bold text-[var(--gy-text)]">
            {stats.security}
          </Typography>
          <span className="text-[11px] text-[var(--gy-text-subtle)]">2FA & RBAC</span>
        </div>
      </Card>

      <Card variant="glass" radius="xl" padding="md" className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--gy-text-secondary)]">Core System</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
            <Cpu className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <Typography variant="h3" className="text-xl font-bold text-[var(--gy-text)]">
            {stats.system}
          </Typography>
          <span className="text-[11px] text-[var(--gy-text-subtle)]">WebRTC & API</span>
        </div>
      </Card>
    </div>
  );
};

export default NotificationStats;
