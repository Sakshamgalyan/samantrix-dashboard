import { createContext } from "react";
import type { NotificationsContextValue } from "@/features/notifications/types";

export const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);
