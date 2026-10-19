"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/features/auth";
import { getSocketTicket } from "@/lib/api-client/apiClient";
import type {
  RealtimeConnectionStatus,
  RealtimePacketLog,
  UserPresenceState,
  RealtimeContextValue,
  RealtimeProviderProps,
  PresenceUpdatedPayload,
  SessionRevokedPayload,
} from "@/features/realtime/types";
import { createRealtimeSocket, SOCKET_CONFIG } from "@/features/realtime/socket";
import {
  createPacketLog,
  appendPacketLog,
  updatePresenceMap,
  updateOnlineUserList,
} from "@/features/realtime/handlers";

export const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined,
);

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { isAuthenticated, clearLocalSession } = useAuth();
  const [status, setStatus] = useState<RealtimeConnectionStatus>("disconnected");
  const [socketId, setSocketId] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresenceState>>({});
  const [recentPackets, setRecentPackets] = useState<RealtimePacketLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const packetsRef = useRef<RealtimePacketLog[]>([]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pushPacket = useCallback((type: string, payload: unknown) => {
    const packet = createPacketLog(type, payload);
    packetsRef.current = appendPacketLog(packetsRef.current, packet);
    // SAM-065: Buffer high-frequency telemetry without triggering render storms across all consumers
    if (type !== "telemetry:pulse" && type !== "player:moved") {
      setRecentPackets((prev) => appendPacketLog(prev, packet));
    }
  }, []);

  const connectSocket = useCallback(() => {
    if (typeof window === "undefined") return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const s = createRealtimeSocket(getSocketTicket);
    socketRef.current = s;

    // Defer state update to avoid synchronous cascading renders during effect mount
    queueMicrotask(() => {
      setStatus("connecting");
      setSocket(s);
    });

    // socket.io does not retry a rejected handshake by itself; tickets are single use and
    // short-lived, so try a few fresh ones before giving up
    let unauthorizedRetries = 0;

    s.on("connect", () => {
      unauthorizedRetries = 0;
      setStatus("connected");
      setSocketId(s.id || null);
      pushPacket("gateway:connect", { socketId: s.id, transport: "websocket" });

      // Start ping heartbeat to gauge latency
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        const start = Date.now();
        s.emit("ping", () => {
          const next = Date.now() - start;
          setLatencyMs((prev) =>
            Math.abs(next - prev) > 20 || prev === 0 ? next : prev,
          );
        });
      }, SOCKET_CONFIG.heartbeatIntervalMs);
    });

    s.on("disconnect", (reason) => {
      setStatus(reason === "io client disconnect" ? "disconnected" : "reconnecting");
      setSocketId(null);
      pushPacket("gateway:disconnect", { reason });
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    });

    s.on("connect_error", (err) => {
      console.warn("[RealtimeGateway] connection error:", err.message);
      setStatus("error");
      pushPacket("gateway:error", { message: err.message });
      if (err.message === "unauthorized" && unauthorizedRetries < 3) {
        unauthorizedRetries += 1;
        setTimeout(() => {
          if (socketRef.current === s) s.connect();
        }, SOCKET_CONFIG.reconnectionDelay * unauthorizedRetries);
      }
    });

    // This device was signed out from another device (or the login screen)
    s.on("session:revoked", (event: SessionRevokedPayload) => {
      pushPacket("session:revoked", event);
      clearLocalSession();
    });

    // Handle Presence updates
    s.on("presence:updated", (event: PresenceUpdatedPayload) => {
      pushPacket("presence:updated", event);
      if (event?.userId) {
        setPresenceMap((prev) => updatePresenceMap(prev, event));
        setOnlineUserIds((prev) =>
          updateOnlineUserList(prev, event.userId, event.status !== "OFFLINE"),
        );
      }
    });

    s.on("user:online", (event: { userId?: string }) => {
      pushPacket("user:online", event);
      if (event?.userId) {
        setOnlineUserIds((prev) => updateOnlineUserList(prev, event.userId, true));
      }
    });

    s.on("user:offline", (event: { userId?: string }) => {
      pushPacket("user:offline", event);
      if (event?.userId) {
        setOnlineUserIds((prev) => updateOnlineUserList(prev, event.userId, false));
      }
    });

    // Handle Office and Telemetry events
    s.on("player:joined", (event: unknown) => {
      pushPacket("player:joined", event);
    });

    s.on("player:left", (event: unknown) => {
      pushPacket("player:left", event);
    });

    s.on("telemetry:pulse", (event: unknown) => {
      pushPacket("telemetry:pulse", event);
    });
  }, [pushPacket, clearLocalSession]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      queueMicrotask(() => {
        setSocket(null);
        setStatus("disconnected");
        setSocketId(null);
      });
    }

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, connectSocket]);

  const reconnect = useCallback(() => {
    connectSocket();
  }, [connectSocket]);

  const contextValue = useMemo<RealtimeContextValue>(
    () => ({
      status,
      socketId,
      latencyMs,
      onlineUserIds,
      presenceMap,
      recentPackets,
      reconnect,
      socket,
    }),
    [
      status,
      socketId,
      latencyMs,
      onlineUserIds,
      presenceMap,
      recentPackets,
      reconnect,
      socket,
    ],
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}
