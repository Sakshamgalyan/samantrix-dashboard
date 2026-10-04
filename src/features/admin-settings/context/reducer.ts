import type { SettingsAction, SettingsPageState } from "../types";

export const initialSettingsState: SettingsPageState = {
  data: null,
  loading: true,
  refreshing: false,
  loadError: null,
  refreshError: null,
  fetchedAt: null,
  activeTab: "ALL",
  drafts: {},
  savingKeys: [],
  addOpen: false,
  creating: false,
  editTarget: null,
  updatingDetails: false,
  deleteTarget: null,
  deleting: false,
};

export function settingsReducer(
  state: SettingsPageState,
  action: SettingsAction,
): SettingsPageState {
  switch (action.type) {
    case "LOAD_START":
      return action.payload.background
        ? { ...state, refreshing: true }
        : { ...state, loading: state.data === null, refreshing: true, loadError: null };

    case "LOAD_SUCCESS":
      return {
        ...state,
        data: action.payload.data,
        fetchedAt: action.payload.at,
        loading: false,
        refreshing: false,
        loadError: null,
        refreshError: null,
      };

    case "LOAD_FAILURE":
      return state.data
        ? { ...state, refreshing: false, loading: false, refreshError: action.payload }
        : { ...state, refreshing: false, loading: false, loadError: action.payload };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_DRAFT":
      return {
        ...state,
        drafts: { ...state.drafts, [action.payload.key]: action.payload.value },
      };

    case "CLEAR_DRAFT": {
      if (!(action.payload in state.drafts)) return state;
      const drafts = { ...state.drafts };
      delete drafts[action.payload];
      return { ...state, drafts };
    }

    case "SET_SAVING": {
      const others = state.savingKeys.filter((k) => k !== action.payload.key);
      return {
        ...state,
        savingKeys: action.payload.saving ? [...others, action.payload.key] : others,
      };
    }

    case "SET_ADD_OPEN":
      return { ...state, addOpen: action.payload };

    case "SET_CREATING":
      return { ...state, creating: action.payload };

    case "SET_EDIT_TARGET":
      return { ...state, editTarget: action.payload };

    case "SET_UPDATING_DETAILS":
      return { ...state, updatingDetails: action.payload };

    case "SET_DELETE_TARGET":
      return { ...state, deleteTarget: action.payload };

    case "SET_DELETING":
      return { ...state, deleting: action.payload };

    default:
      return state;
  }
}
