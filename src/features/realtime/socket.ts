import { io, Socket } from "socket.io-client";

export const SOCKET_CONFIG = {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
  reconnectionDelay: 1500,
  reconnectionDelayMax: 8000,
  timeout: 10000,
  heartbeatIntervalMs: 10000,
} as const;

export const MAX_PACKET_HISTORY = 50;

/**
 * Resolves the Socket.IO server gateway URL for real-time telemetry and state replication.
 */
export function getRealtimeSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isDev) {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return window.location.origin;
  }
  return "http://localhost:5000";
}

/**
 * Factory creating an authenticated Socket.IO instance. The handshake uses a short-lived
 * socket ticket fetched through the BFF; the `auth` callback runs on every (re)connect,
 * so each attempt gets a fresh ticket and no token ever reaches page JavaScript.
 */
export function createRealtimeSocket(getTicket: () => Promise<string>): Socket {
  const wsUrl = getRealtimeSocketUrl();
  return io(wsUrl, {
    transports: [...SOCKET_CONFIG.transports],
    auth: (cb) => {
      getTicket()
        .then((token) => cb({ token }))
        // No ticket (signed out or offline): the gateway rejects the handshake as unauthorized
        .catch(() => cb({}));
    },
    reconnectionAttempts: SOCKET_CONFIG.reconnectionAttempts,
    reconnectionDelay: SOCKET_CONFIG.reconnectionDelay,
    reconnectionDelayMax: SOCKET_CONFIG.reconnectionDelayMax,
    timeout: SOCKET_CONFIG.timeout,
  });
}
