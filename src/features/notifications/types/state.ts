import type { NotificationCategory, NotificationItem } from "@/features/notifications/types/api";

export interface NotificationsState {
  search: string;
  activeCategory: NotificationCategory;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isCreateOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
}
