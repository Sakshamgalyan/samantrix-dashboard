export type RoomType =
  | "LOBBY"
  | "OPEN_WORKSPACE"
  | "MEETING"
  | "CONFERENCE"
  | "BREAK_ROOM"
  | "FOCUS_ROOM"
  | "CABIN"
  | "CAFETERIA";

export interface OrgRoomItem {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  occupantCount: number;
  isPrivate: boolean;
  allowedRoleIds?: string[];
  officeId: string;
  createdAt: string;
}

export interface CreateRoomPayload {
  name: string;
  type: RoomType;
  capacity?: number;
  isPrivate?: boolean;
  allowedRoleIds?: string[];
}

export interface UpdateRoomPayload {
  name?: string;
  type?: RoomType;
  capacity?: number;
  isPrivate?: boolean;
  allowedRoleIds?: string[];
}

export interface OfficeLayoutSettings {
  theme?: string;
  defaultDimension?: "3d" | "2d";
  allow2dMode?: boolean;
  allow3dMode?: boolean;
  proximityVoiceRadius?: number;
  ambientSound?: string;
  ambientSoundVolume?: number;
  collisionPhysics?: boolean;
  welcomeBroadcast?: string;
  enableGuestAccess?: boolean;
  [key: string]: unknown;
}

export interface OrgOfficeConfig {
  id: string;
  name: string;
  mapAssetKey: string;
  maxCapacity: number;
  layoutSettings?: {
    officeConfig?: OfficeLayoutSettings;
    [key: string]: unknown;
  } | null;
  roomCount: number;
  occupantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrgOfficePayload {
  name?: string;
  mapAssetKey?: string;
  maxCapacity?: number;
  layoutSettings?: Record<string, unknown>;
}
