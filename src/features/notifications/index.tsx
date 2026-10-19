"use client";

import React from "react";
import { NotificationsProvider } from "@/features/notifications/context";
import { NotificationsContent } from "@/features/notifications/component/notifications-content";

export const NotificationsFeature: React.FC = () => {
  return (
    <NotificationsProvider>
      <NotificationsContent />
    </NotificationsProvider>
  );
};

export default NotificationsFeature;
