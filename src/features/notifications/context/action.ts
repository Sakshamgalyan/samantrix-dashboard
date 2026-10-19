import type {
  NotificationCategory,
  NotificationItem,
  NotificationsAction,
} from "@/features/notifications/types";

export const setLoadingAction = (payload: boolean): NotificationsAction => ({
  type: "SET_LOADING",
  payload,
});

export const setSubmittingAction = (payload: boolean): NotificationsAction => ({
  type: "SET_SUBMITTING",
  payload,
});

export const setErrorAction = (payload: string | null): NotificationsAction => ({
  type: "SET_ERROR",
  payload,
});

export const setSearchAction = (payload: string): NotificationsAction => ({
  type: "SET_SEARCH",
  payload,
});

export const setCategoryAction = (
  payload: NotificationCategory,
): NotificationsAction => ({
  type: "SET_CATEGORY",
  payload,
});

export const setNotificationsAction = (payload: {
  notifications: NotificationItem[];
  unreadCount: number;
}): NotificationsAction => ({
  type: "SET_NOTIFICATIONS",
  payload,
});

export const addNotificationAction = (
  payload: NotificationItem,
): NotificationsAction => ({
  type: "ADD_NOTIFICATION",
  payload,
});

export const markAllReadAction = (): NotificationsAction => ({
  type: "MARK_ALL_READ",
});

export const markReadAction = (payload: string): NotificationsAction => ({
  type: "MARK_READ",
  payload,
});

export const deleteNotificationAction = (
  payload: string,
): NotificationsAction => ({
  type: "DELETE_NOTIFICATION",
  payload,
});

export const setCreateOpenAction = (payload: boolean): NotificationsAction => ({
  type: "SET_CREATE_OPEN",
  payload,
});
