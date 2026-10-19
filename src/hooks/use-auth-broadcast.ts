"use client";

import { useEffect, useRef } from "react";
import {
  AUTH_BROADCAST_CHANNEL,
  AUTH_LOGOUT_STORAGE_KEY,
  type AuthBroadcastMessage,
} from "@/utils/broadcast-auth-logout";

/**
 * Listens for cross-tab authentication events (e.g. LOGOUT from another tab)
 * and triggers the provided callback when a remote logout occurs.
 */
export const useAuthBroadcast = (onRemoteLogout: () => void): void => {
  const onRemoteLogoutRef = useRef(onRemoteLogout);

  useEffect(() => {
    onRemoteLogoutRef.current = onRemoteLogout;
  }, [onRemoteLogout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;

    if ("BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
        channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
          if (event.data?.type === "LOGOUT") {
            onRemoteLogoutRef.current();
          }
        };
      } catch (err) {
        console.warn("[useAuthBroadcast] BroadcastChannel error:", err);
        channel = null;
      }
    }

    const handleStorage = (event: StorageEvent): void => {
      if (event.key === AUTH_LOGOUT_STORAGE_KEY && event.newValue) {
        onRemoteLogoutRef.current();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
};
