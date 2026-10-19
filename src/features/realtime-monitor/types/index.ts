export interface RoomBreakdown {
  office: number;
  org: number;
  conversation: number;
  meeting: number;
  user: number;
}

export interface TopRoom {
  name: string;
  type: string;
  memberCount: number;
}

export interface ConnectedSocket {
  socketId: string;
  userId?: string;
  fullName: string;
  organizationId?: string;
  officeId?: string;
  connectedAt: number;
  transport: string;
}

export interface RealtimeGatewayStats {
  connectedClients: number;
  activeRooms: number;
  roomBreakdown: RoomBreakdown;
  topRooms: TopRoom[];
  connectedSockets: ConnectedSocket[];
  redisAdapterConnected: boolean;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  severity?: "info" | "warning" | "urgent";
  organizationId?: string;
}
