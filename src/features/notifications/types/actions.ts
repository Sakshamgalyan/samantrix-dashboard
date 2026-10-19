import type { NotificationCategory, NotificationItem } from "@/features/notifications/types/api";

export type NotificationsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CATEGORY"; payload: NotificationCategory }
  | {
      type: "SET_NOTIFICATIONS";
      payload: { notifications: NotificationItem[]; unreadCount: number };
    }
  | { type: "ADD_NOTIFICATION"; payload: NotificationItem }
  | { type: "MARK_READ"; payload: string }
  | { type: "MARK_ALL_READ" }
  | { type: "DELETE_NOTIFICATION"; payload: string }
  | { type: "SET_CREATE_OPEN"; payload: boolean };
