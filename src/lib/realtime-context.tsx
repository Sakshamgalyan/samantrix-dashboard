"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { getStoredToken } from "./api";

export type RealtimeConnectionStatus =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface RealtimePacketLog {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
}

export interface UserPresenceState {
  userId: string;
  status: "ONLINE" | "BUSY" | "IN_MEETING" | "AWAY" | "OFFLINE";
  customStatus?: string;
  lastUpdated: number;
}

interface RealtimeContextType {
  status: RealtimeConnectionStatus;
  socketId: string | null;
  latencyMs: number;
  onlineUserIds: string[];
  presenceMap: Record<string, UserPresenceState>;
  recentPackets: RealtimePacketLog[];
  reconnect: () => void;
  socket: Socket | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined,
);

const WS_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "https:" : "http:"}//${window.location.hostname}:5000`
    : "http://localhost:5000");

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, clearLocalSession } = useAuth();
  const [status, setStatus] = useState<RealtimeConnectionStatus>("disconnected");
  const [socketId, setSocketId] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresenceState>>({});
  const [recentPackets, setRecentPackets] = useState<RealtimePacketLog[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pushPacket = useCallback((type: string, payload: any) => {
    setRecentPackets((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type,
        payload,
        timestamp: new Date(),
      },
      ...prev.slice(0, 49), // retain last 50 events
    ]);
  }, []);

  const connectSocket = useCallback(() => {
    if (typeof window === "undefined") return;

    const token = getStoredToken();
    if (!token) {
      setStatus("disconnected");
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus("connecting");

    const s = io(WS_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
      timeout: 10000,
    });

    s.on("connect", () => {
      setStatus("connected");
      setSocketId(s.id || null);
      pushPacket("gateway:connect", { socketId: s.id, transport: "websocket" });

      // Start ping heartbeat to gauge latency
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        const start = Date.now();
        s.emit("ping", () => {
          setLatencyMs(Date.now() - start);
        });
      }, 10000);
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
    });

    // This device was signed out from another device (or the login screen)
    s.on("session:revoked", (event: { sessionId: string; timestamp: number }) => {
      pushPacket("session:revoked", event);
      clearLocalSession();
    });

    // Handle Presence updates
    s.on("presence:updated", (event: any) => {
      pushPacket("presence:updated", event);
      if (event?.userId) {
        setPresenceMap((prev) => ({
          ...prev,
          [event.userId]: {
            userId: event.userId,
            status: event.status || "ONLINE",
            customStatus: event.customStatus,
            lastUpdated: event.timestamp || Date.now(),
          },
        }));

        setOnlineUserIds((prev) => {
          if (event.status === "OFFLINE") {
            return prev.filter((id) => id !== event.userId);
          }
          return prev.includes(event.userId) ? prev : [...prev, event.userId];
        });
      }
    });

    s.on("user:online", (event: any) => {
      pushPacket("user:online", event);
      if (event?.userId) {
        setOnlineUserIds((prev) =>
          prev.includes(event.userId) ? prev : [...prev, event.userId],
        );
      }
    });

    s.on("user:offline", (event: any) => {
      pushPacket("user:offline", event);
      if (event?.userId) {
        setOnlineUserIds((prev) => prev.filter((id) => id !== event.userId));
      }
    });

    // Handle Office and Telemetry events
    s.on("player:joined", (event: any) => {
      pushPacket("player:joined", event);
    });

    s.on("player:left", (event: any) => {
      pushPacket("player:left", event);
    });

    s.on("telemetry:pulse", (event: any) => {
      pushPacket("telemetry:pulse", event);
    });

    socketRef.current = s;
  }, [pushPacket, clearLocalSession]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setStatus("disconnected");
      setSocketId(null);
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

  return (
    <RealtimeContext.Provider
      value={{
        status,
        socketId,
        latencyMs,
        onlineUserIds,
        presenceMap,
        recentPackets,
        reconnect,
        socket: socketRef.current,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
