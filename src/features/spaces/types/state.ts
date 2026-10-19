import type { OrgRoomItem, RoomType } from "./api";

export interface SpacesState {
  searchQuery: string;
  typeFilter: string;
  isCreateModalOpen: boolean;
  editingRoom: OrgRoomItem | null;
  deletingRoom: OrgRoomItem | null;
  actionError: string | null;
  isSaving: boolean;
  formName: string;
  formType: RoomType;
  formCapacity: number;
  formIsPrivate: boolean;

  // Office Space Global Configuration
  isConfigModalOpen: boolean;
  configName: string;
  configMapAssetKey: string;
  configMaxCapacity: number;
  configDefaultDimension: "3d" | "2d";
  configAllow2dMode: boolean;
  configProximityRadius: number;
  configAmbientSound: string;
  configAmbientVolume: number;
  configCollisionPhysics: boolean;
  configWelcomeMessage: string;
  configEnableGuestAccess: boolean;
}

export const INITIAL_SPACES_STATE: SpacesState = {
  searchQuery: "",
  typeFilter: "ALL",
  isCreateModalOpen: false,
  editingRoom: null,
  deletingRoom: null,
  actionError: null,
  isSaving: false,
  formName: "",
  formType: "MEETING",
  formCapacity: 10,
  formIsPrivate: false,

  isConfigModalOpen: false,
  configName: "Simantrix Digital Campus",
  configMapAssetKey: "default_office_map",
  configMaxCapacity: 100,
  configDefaultDimension: "3d",
  configAllow2dMode: true,
  configProximityRadius: 120,
  configAmbientSound: "lofi_work",
  configAmbientVolume: 40,
  configCollisionPhysics: true,
  configWelcomeMessage: "Welcome to our digital headquarters!",
  configEnableGuestAccess: true,
};
