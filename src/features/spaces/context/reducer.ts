import type { SpacesState } from "../types/state";
import type { SpacesAction } from "../types/actions";
import { ROOM_TYPE_META } from "../common/constants";

export function spacesReducer(
  state: SpacesState,
  action: SpacesAction,
): SpacesState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_TYPE_FILTER":
      return { ...state, typeFilter: action.payload };

    case "RESET_FILTERS":
      return { ...state, searchQuery: "", typeFilter: "ALL" };

    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        isCreateModalOpen: true,
        editingRoom: null,
        actionError: null,
        formName: "",
        formType: "MEETING",
        formCapacity: ROOM_TYPE_META.MEETING.defaultCapacity,
        formIsPrivate: false,
      };

    case "CLOSE_CREATE_MODAL":
      return { ...state, isCreateModalOpen: false, actionError: null };

    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        editingRoom: action.payload,
        isCreateModalOpen: false,
        actionError: null,
        formName: action.payload.name,
        formType: action.payload.type,
        formCapacity: action.payload.capacity,
        formIsPrivate: action.payload.isPrivate,
      };

    case "CLOSE_EDIT_MODAL":
      return { ...state, editingRoom: null, actionError: null };

    case "OPEN_DELETE_MODAL":
      return { ...state, deletingRoom: action.payload, actionError: null };

    case "CLOSE_DELETE_MODAL":
      return { ...state, deletingRoom: null, actionError: null };

    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.payload };

    case "SET_IS_SAVING":
      return { ...state, isSaving: action.payload };

    case "SET_FORM_NAME":
      return { ...state, formName: action.payload };

    case "SET_FORM_TYPE":
      return {
        ...state,
        formType: action.payload,
        // Only set default capacity if creating a new room
        formCapacity: state.editingRoom
          ? state.formCapacity
          : (ROOM_TYPE_META[action.payload]?.defaultCapacity ?? state.formCapacity),
      };

    case "SET_FORM_CAPACITY":
      return { ...state, formCapacity: action.payload };

    case "SET_FORM_IS_PRIVATE":
      return { ...state, formIsPrivate: action.payload };

    case "OPEN_CONFIG_MODAL": {
      const office = action.payload;
      const oc = office?.layoutSettings?.officeConfig || {};
      return {
        ...state,
        isConfigModalOpen: true,
        actionError: null,
        configName: office?.name || state.configName || "Simantrix Digital Campus",
        configMapAssetKey: office?.mapAssetKey || state.configMapAssetKey || "default_office_map",
        configMaxCapacity: office?.maxCapacity || state.configMaxCapacity || 100,
        configDefaultDimension: oc.defaultDimension || state.configDefaultDimension || "3d",
        configAllow2dMode: oc.allow2dMode !== undefined ? oc.allow2dMode : state.configAllow2dMode,
        configProximityRadius: oc.proximityVoiceRadius || state.configProximityRadius || 120,
        configAmbientSound: oc.ambientSound || state.configAmbientSound || "lofi_work",
        configAmbientVolume: oc.ambientSoundVolume !== undefined ? oc.ambientSoundVolume : state.configAmbientVolume,
        configCollisionPhysics: oc.collisionPhysics !== undefined ? oc.collisionPhysics : state.configCollisionPhysics,
        configWelcomeMessage: oc.welcomeBroadcast || state.configWelcomeMessage || "Welcome to our digital headquarters!",
        configEnableGuestAccess: oc.enableGuestAccess !== undefined ? oc.enableGuestAccess : state.configEnableGuestAccess,
      };
    }

    case "CLOSE_CONFIG_MODAL":
      return { ...state, isConfigModalOpen: false, actionError: null };

    case "SET_CONFIG_NAME":
      return { ...state, configName: action.payload };

    case "SET_CONFIG_MAP_ASSET_KEY":
      return { ...state, configMapAssetKey: action.payload };

    case "SET_CONFIG_MAX_CAPACITY":
      return { ...state, configMaxCapacity: action.payload };

    case "SET_CONFIG_DEFAULT_DIMENSION":
      return { ...state, configDefaultDimension: action.payload };

    case "SET_CONFIG_ALLOW_2D_MODE":
      return { ...state, configAllow2dMode: action.payload };

    case "SET_CONFIG_PROXIMITY_RADIUS":
      return { ...state, configProximityRadius: action.payload };

    case "SET_CONFIG_AMBIENT_SOUND":
      return { ...state, configAmbientSound: action.payload };

    case "SET_CONFIG_AMBIENT_VOLUME":
      return { ...state, configAmbientVolume: action.payload };

    case "SET_CONFIG_COLLISION_PHYSICS":
      return { ...state, configCollisionPhysics: action.payload };

    case "SET_CONFIG_WELCOME_MESSAGE":
      return { ...state, configWelcomeMessage: action.payload };

    case "SET_CONFIG_ENABLE_GUEST_ACCESS":
      return { ...state, configEnableGuestAccess: action.payload };

    default:
      return state;
  }
}
