import type { Dispatch } from "react";
import type { NotificationsState } from "@/features/notifications/types/state";
import type { NotificationsAction } from "@/features/notifications/types/actions";
import type { CreateNotificationDto } from "@/features/notifications/types/api";

export interface NotificationsContextValue {
  state: NotificationsState;
  dispatch: Dispatch<NotificationsAction>;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (dto: CreateNotificationDto) => Promise<void>;
  toggleCreateModal: (open: boolean) => void;
}
