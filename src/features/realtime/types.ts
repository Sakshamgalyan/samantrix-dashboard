import type { Socket } from "socket.io-client";

export type RealtimeConnectionStatus =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface RealtimePacketLog {
  id: string;
  type: string;
  payload: unknown;
  timestamp: Date;
}


export type UserPresenceStatus =
  | "ONLINE"
  | "BUSY"
  | "IN_MEETING"
  | "AWAY"
  | "OFFLINE";

export interface UserPresenceState {
  userId: string;
  status: UserPresenceStatus;
  customStatus?: string;
  lastUpdated: number;
}

export interface RealtimeContextValue {
  status: RealtimeConnectionStatus;
  socketId: string | null;
  latencyMs: number;
  onlineUserIds: string[];
  presenceMap: Record<string, UserPresenceState>;
  recentPackets: RealtimePacketLog[];
  reconnect: () => void;
  socket: Socket | null;
}

/** Legacy alias for backwards compatibility */
export type RealtimeContextType = RealtimeContextValue;

export interface RealtimeProviderProps {
  children: React.ReactNode;
}

export interface PresenceUpdatedPayload {
  userId: string;
  status?: UserPresenceStatus;
  customStatus?: string;
  timestamp?: number;
}

export interface SessionRevokedPayload {
  sessionId: string;
  timestamp: number;
}
