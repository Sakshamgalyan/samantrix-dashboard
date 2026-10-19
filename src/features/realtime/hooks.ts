"use client";

import { useContext, useMemo } from "react";
import { RealtimeContext } from "@/features/realtime/context";
import type {
  RealtimeContextValue,
  RealtimeConnectionStatus,
  UserPresenceState,
  RealtimePacketLog,
} from "@/features/realtime/types";

/**
 * Access the core real-time context.
 * Throws an error if used outside a RealtimeProvider.
 */
export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

/**
 * Access real-time socket connection status and latency.
 */
export function useSocketStatus(): {
  status: RealtimeConnectionStatus;
  socketId: string | null;
  latencyMs: number;
  isConnected: boolean;
  reconnect: () => void;
} {
  const { status, socketId, latencyMs, reconnect } = useRealtime();
  return useMemo(
    () => ({
      status,
      socketId,
      latencyMs,
      isConnected: status === "connected",
      reconnect,
    }),
    [status, socketId, latencyMs, reconnect],
  );
}

/**
 * Access online users and presence states across the workspace.
 */
export function usePresence(): {
  onlineUserIds: string[];
  presenceMap: Record<string, UserPresenceState>;
  getPresence: (userId: string) => UserPresenceState | undefined;
  isUserOnline: (userId: string) => boolean;
} {
  const { onlineUserIds, presenceMap } = useRealtime();

  return useMemo(
    () => ({
      onlineUserIds,
      presenceMap,
      getPresence: (userId: string) => presenceMap[userId],
      isUserOnline: (userId: string) => onlineUserIds.includes(userId),
    }),
    [onlineUserIds, presenceMap],
  );
}

/**
 * Access recent incoming/outgoing telemetry packets.
 */
export function usePacketLogs(): RealtimePacketLog[] {
  const { recentPackets } = useRealtime();
  return recentPackets;
}
