import type {
  RealtimePacketLog,
  UserPresenceState,
  UserPresenceStatus,
  PresenceUpdatedPayload,
} from "@/features/realtime/types";
import { MAX_PACKET_HISTORY } from "@/features/realtime/socket";

/**
 * Builds a standardized telemetry packet log with unique ID and timestamp.
 */
export function createPacketLog(type: string, payload: unknown): RealtimePacketLog {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    id: `${Date.now()}-${randomSuffix}`,
    type,
    payload,
    timestamp: new Date(),
  };
}

/**
 * Appends a packet log to the history buffer, retaining the most recent MAX_PACKET_HISTORY entries.
 */
export function appendPacketLog(
  history: RealtimePacketLog[],
  packet: RealtimePacketLog,
  max: number = MAX_PACKET_HISTORY,
): RealtimePacketLog[] {
  return [packet, ...history.slice(0, max - 1)];
}

/**
 * Reduces a presence update event into the user presence map.
 */
export function updatePresenceMap(
  prevMap: Record<string, UserPresenceState>,
  event: PresenceUpdatedPayload,
): Record<string, UserPresenceState> {
  if (!event?.userId) return prevMap;

  const currentStatus: UserPresenceStatus = event.status || "ONLINE";
  return {
    ...prevMap,
    [event.userId]: {
      userId: event.userId,
      status: currentStatus,
      customStatus: event.customStatus,
      lastUpdated: event.timestamp || Date.now(),
    },
  };
}

/**
 * Updates the list of online user IDs based on an online/offline event or status update.
 */
export function updateOnlineUserList(
  prevList: string[],
  userId?: string | null,
  isOnline: boolean = true,
): string[] {
  if (!userId) return prevList;

  if (!isOnline) {
    return prevList.filter((id) => id !== userId);
  }

  return prevList.includes(userId) ? prevList : [...prevList, userId];
}
