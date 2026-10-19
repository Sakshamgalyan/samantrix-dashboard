export type NotificationCategory =
  | "all"
  | "unread"
  | "security"
  | "system"
  | "workspace";

export interface BackendNotificationDto {
  id: string;
  userId: string;
  organizationId?: string;
  type: string;
  title: string;
  body: string;
  data?: {
    category?: NotificationCategory;
    actionLabel?: string;
    actionUrl?: string;
    [key: string]: unknown;
  };
  isRead: boolean;
  readAt?: string;
  channel: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  type: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface CreateNotificationDto {
  title: string;
  body: string;
  type?: string;
  category?: NotificationCategory;
  actionLabel?: string;
  actionUrl?: string;
}
