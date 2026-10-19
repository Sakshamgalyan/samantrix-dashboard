"use client";

import React, { useEffect, useReducer, useCallback, type ReactNode } from "react";
import { useRealtime } from "@/features/realtime";
import { NotificationsContext } from "@/features/notifications/context/context-definition";
import {
  initialNotificationsState,
  notificationsReducer,
} from "@/features/notifications/context/reducer";
import {
  setLoadingAction,
  setSubmittingAction,
  setErrorAction,
  setNotificationsAction,
  addNotificationAction,
  markReadAction,
  markAllReadAction,
  deleteNotificationAction,
  setCreateOpenAction,
} from "@/features/notifications/context/action";
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  createNotificationApi,
  mapBackendNotification,
} from "@/features/notifications/context/api";
import type {
  BackendNotificationDto,
  CreateNotificationDto,
} from "@/features/notifications/types/api";

export * from "@/features/notifications/context/hooks";

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    notificationsReducer,
    initialNotificationsState,
  );
  const { socket } = useRealtime();

  const loadNotifications = useCallback(async () => {
    dispatch(setLoadingAction(true));
    dispatch(setErrorAction(null));
    try {
      const data = await fetchNotificationsApi();
      dispatch(setNotificationsAction(data));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load notifications";
      dispatch(setErrorAction(message));
      dispatch(setLoadingAction(false));
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (payload: BackendNotificationDto) => {
      const item = mapBackendNotification(payload);
      dispatch(addNotificationAction(item));
    };

    const handleReadNotification = (payload: { id: string }) => {
      if (payload?.id) {
        dispatch(markReadAction(payload.id));
      }
    };

    const handleReadAll = () => {
      dispatch(markAllReadAction());
    };

    const handleDelete = (payload: { id: string }) => {
      if (payload?.id) {
        dispatch(deleteNotificationAction(payload.id));
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read", handleReadNotification);
    socket.on("notification:read_all", handleReadAll);
    socket.on("notification:deleted", handleDelete);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read", handleReadNotification);
      socket.off("notification:read_all", handleReadAll);
      socket.off("notification:deleted", handleDelete);
    };
  }, [socket]);

  const markAsRead = useCallback(async (id: string) => {
    dispatch(markReadAction(id));
    try {
      await markNotificationReadApi(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    dispatch(markAllReadAction());
    try {
      await markAllNotificationsReadApi();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    dispatch(deleteNotificationAction(id));
    try {
      await deleteNotificationApi(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const createNotification = useCallback(
    async (dto: CreateNotificationDto) => {
      dispatch(setSubmittingAction(true));
      try {
        const item = await createNotificationApi(dto);
        dispatch(addNotificationAction(item));
        dispatch(setCreateOpenAction(false));
      } catch (err) {
        console.error("Failed to create notification:", err);
        throw err;
      } finally {
        dispatch(setSubmittingAction(false));
      }
    },
    [],
  );

  const toggleCreateModal = useCallback((open: boolean) => {
    dispatch(setCreateOpenAction(open));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        state,
        dispatch,
        refresh: loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
        toggleCreateModal,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
