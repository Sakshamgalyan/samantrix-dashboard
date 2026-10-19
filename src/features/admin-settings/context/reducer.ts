import type { SettingsAction } from "@/features/admin-settings/types/actions";
import type { SettingsUiState } from "@/features/admin-settings/types/state";

/** UI state only; the settings themselves live in the RTK Query cache. */
export const initialSettingsState: SettingsUiState = {
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

export const settingsReducer = (
  state: SettingsUiState,
  action: SettingsAction,
): SettingsUiState => {
  switch (action.type) {
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
};
