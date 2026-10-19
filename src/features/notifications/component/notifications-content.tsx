"use client";

import React, { lazy, Suspense, useMemo } from "react";
import { Card, EmptyState, Typography } from "@galyan/ui";
import { Bell, Sparkles } from "lucide-react";
import { useNotifications } from "@/features/notifications/context";
import { NotificationHeader } from "@/features/notifications/component/notification-header";
import { NotificationStats } from "@/features/notifications/component/notification-stats";
import { NotificationFilters } from "@/features/notifications/component/notification-filters";
import { NotificationRow } from "@/features/notifications/component/notification-row";

const CreateNotificationDialog = lazy(
  () => import("@/features/notifications/component/create-notification-dialog"),
);

export const NotificationsContent: React.FC = () => {
  const { state, markAsRead, deleteNotification } = useNotifications();
  const { search, activeCategory, notifications, isLoading, isCreateOpen } = state;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeCategory === "unread") return !item.read;
      if (activeCategory === "security") return item.category === "security";
      if (activeCategory === "system") return item.category === "system";
      if (activeCategory === "workspace") return item.category === "workspace";
      return true;
    });
  }, [notifications, search, activeCategory]);

  return (
    <div className="space-y-4">
      <NotificationHeader />

      <NotificationStats />

      <NotificationFilters />

      {isLoading && notifications.length === 0 ? (
        <Card variant="glass" radius="xl" padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-8 rounded-full border-2 border-[var(--gy-primary)] border-t-transparent animate-spin" />
            <Typography variant="small" className="text-xs text-[var(--gy-text-secondary)]">
              Connecting to real-time notification service...
            </Typography>
          </div>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card variant="glass" radius="xl" padding="lg">
          <EmptyState
            size="md"
            icon={<Bell className="size-10 text-[var(--gy-text-subtle)]" />}
            title={
              search
                ? `No alerts matching "${search}"`
                : activeCategory === "unread"
                  ? "All caught up! No unread notifications"
                  : "No notifications found"
            }
            description={
              search
                ? "Try searching for a different keyword or clear the search input."
                : activeCategory === "unread"
                  ? "New activity across user sessions, security alerts, and system broadcasts will appear here in real-time."
                  : "Incoming alerts for this category will be broadcasted live as events occur."
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onMarkRead={(id) => void markAsRead(id)}
              onDelete={(id) => void deleteNotification(id)}
            />
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Suspense fallback={null}>
          <CreateNotificationDialog />
        </Suspense>
      )}
    </div>
  );
};

export default NotificationsContent;
