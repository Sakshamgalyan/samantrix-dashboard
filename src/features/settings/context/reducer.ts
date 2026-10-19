import type { SettingsState } from "@/features/settings/types/state";
import type { SettingsAction } from "@/features/settings/types/actions";

export const initialSettingsState: SettingsState = {
  profileForm: {
    name: "",
    legalName: "",
    website: "",
    industry: "",
    companySize: "",
    businessEmail: "",
    secondaryEmail: "",
    businessPhone: "",
    address: "",
    city: "",
    state: "",
    country: "",
  },
  settingsForm: {
    id: "",
    organizationId: "",
    timezone: "UTC",
    locale: "en-US",
    defaultRole: "MEMBER",
    allowMemberInvites: false,
    retentionDays: 365,
  },
  savingProfile: false,
  savingSettings: false,
  error: null,
  confirmName: "",
  deactivating: false,
};

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "SET_PROFILE_FORM":
      return {
        ...state,
        profileForm: action.payload,
      };
    case "UPDATE_PROFILE_FIELD":
      return {
        ...state,
        profileForm: {
          ...state.profileForm,
          [action.payload.field]: action.payload.value,
        },
      };
    case "SET_SETTINGS_FORM":
      return {
        ...state,
        settingsForm: action.payload,
      };
    case "UPDATE_SETTINGS_FIELD":
      return {
        ...state,
        settingsForm: {
          ...state.settingsForm,
          [action.payload.field]: action.payload.value,
        },
      };
    case "SET_SAVING_PROFILE":
      return {
        ...state,
        savingProfile: action.payload,
      };
    case "SET_SAVING_SETTINGS":
      return {
        ...state,
        savingSettings: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "SET_CONFIRM_NAME":
      return {
        ...state,
        confirmName: action.payload,
      };
    case "SET_DEACTIVATING":
      return {
        ...state,
        deactivating: action.payload,
      };
    default:
      return state;
  }
}
