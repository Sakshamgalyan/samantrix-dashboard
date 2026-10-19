import { apiClient } from "@/lib/api-client/apiClient";
import type {
  BackendNotificationDto,
  CreateNotificationDto,
  NotificationItem,
} from "@/features/notifications/types/api";

interface NotificationsResponseData {
  notifications: BackendNotificationDto[];
  unreadCount: number;
}

export const mapBackendNotification = (
  dto: BackendNotificationDto,
): NotificationItem => {
  const category = (dto.data?.category as NotificationItem["category"]) || "system";

  return {
    id: dto.id,
    title: dto.title,
    description: dto.body,
    category,
    type: dto.type,
    createdAt: dto.createdAt,
    read: dto.isRead,
    readAt: dto.readAt,
    actionLabel: dto.data?.actionLabel,
    actionUrl: dto.data?.actionUrl,
  };
};

export const fetchNotificationsApi = async (): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> => {
  const data = (await apiClient.get(
    "/notifications",
  )) as NotificationsResponseData;

  const notifications = (data?.notifications || []).map(mapBackendNotification);
  const unreadCount =
    typeof data?.unreadCount === "number"
      ? data.unreadCount
      : notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount };
};

export const markNotificationReadApi = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsReadApi = async (): Promise<void> => {
  await apiClient.post("/notifications/read-all");
};

export const deleteNotificationApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

export const createNotificationApi = async (
  dto: CreateNotificationDto,
): Promise<NotificationItem> => {
  const payload = {
    title: dto.title,
    body: dto.body,
    type: dto.type || "admin_alert",
    channel: "IN_APP",
    data: {
      category: dto.category || "system",
      actionLabel: dto.actionLabel,
      actionUrl: dto.actionUrl,
    },
  };

  const created = (await apiClient.post(
    "/notifications",
    payload,
  )) as BackendNotificationDto;

  return mapBackendNotification(created);
};
