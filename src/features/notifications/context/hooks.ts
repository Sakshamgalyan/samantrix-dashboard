import { useContext } from "react";
import { NotificationsContext } from "@/features/notifications/context/context-definition";
import type { NotificationsContextValue } from "@/features/notifications/types";

export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
