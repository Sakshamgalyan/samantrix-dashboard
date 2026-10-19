import type { UsersAction } from "@/features/users/types/actions";
import type { UsersUiState } from "@/features/users/types/state";

export const initialUsersUiState: UsersUiState = {
  search: "",
  appliedSearch: "",
  roleFilter: "ALL",
  statusFilter: "ALL",
  page: 1,
  refreshing: false,
  actionError: null,
  inviteDialog: {
    isOpen: false,
    tab: "link",
    email: "",
    fullName: "",
    password: "",
    showPassword: false,
    role: "MEMBER",
    department: "Engineering",
    isInviting: false,
    inviteResult: null,
    directResult: null,
    copiedLink: false,
    error: null,
  },
  settingsDialog: {
    member: null,
    role: "MEMBER",
    status: "ACTIVE",
    isSaving: false,
    error: null,
  },
  removeDialog: null,
};

export function usersReducer(
  state: UsersUiState,
  action: UsersAction,
): UsersUiState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "APPLY_SEARCH":
      return action.payload === state.appliedSearch
        ? state
        : { ...state, appliedSearch: action.payload, page: 1 };

    case "SET_ROLE_FILTER":
      return { ...state, roleFilter: action.payload, page: 1 };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, page: 1 };

    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.payload };

    case "OPEN_INVITE_DIALOG":
      return {
        ...state,
        inviteDialog: {
          ...state.inviteDialog,
          isOpen: true,
          error: null,
          inviteResult: null,
          directResult: null,
          email: "",
          fullName: "",
          password: "",
          showPassword: false,
          copiedLink: false,
        },
      };

    case "CLOSE_INVITE_DIALOG":
      return {
        ...state,
        inviteDialog: {
          ...state.inviteDialog,
          isOpen: false,
          error: null,
          inviteResult: null,
          directResult: null,
          email: "",
          fullName: "",
          password: "",
          showPassword: false,
          copiedLink: false,
        },
      };

    case "SET_INVITE_TAB":
      return {
        ...state,
        inviteDialog: {
          ...state.inviteDialog,
          tab: action.payload,
          error: null,
        },
      };

    case "SET_INVITE_EMAIL":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, email: action.payload },
      };

    case "SET_DIRECT_NAME":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, fullName: action.payload },
      };

    case "SET_DIRECT_PASSWORD":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, password: action.payload },
      };

    case "TOGGLE_INVITE_SHOW_PASSWORD":
      return {
        ...state,
        inviteDialog: {
          ...state.inviteDialog,
          showPassword: !state.inviteDialog.showPassword,
        },
      };

    case "SET_INVITE_ROLE":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, role: action.payload },
      };

    case "SET_INVITE_DEPARTMENT":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, department: action.payload },
      };

    case "SET_INVITING":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, isInviting: action.payload },
      };

    case "SET_INVITE_RESULT":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, inviteResult: action.payload },
      };

    case "SET_DIRECT_RESULT":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, directResult: action.payload },
      };

    case "SET_COPIED_LINK":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, copiedLink: action.payload },
      };

    case "SET_INVITE_ERROR":
      return {
        ...state,
        inviteDialog: { ...state.inviteDialog, error: action.payload },
      };

    case "OPEN_SETTINGS_DIALOG":
      return {
        ...state,
        settingsDialog: {
          member: action.payload,
          role: action.payload.role,
          status: action.payload.status,
          isSaving: false,
          error: null,
        },
      };

    case "CLOSE_SETTINGS_DIALOG":
      return {
        ...state,
        settingsDialog: {
          member: null,
          role: "MEMBER",
          status: "ACTIVE",
          isSaving: false,
          error: null,
        },
      };

    case "SET_SETTINGS_ROLE":
      return {
        ...state,
        settingsDialog: { ...state.settingsDialog, role: action.payload },
      };

    case "SET_SETTINGS_STATUS":
      return {
        ...state,
        settingsDialog: { ...state.settingsDialog, status: action.payload },
      };

    case "SET_SAVING_SETTINGS":
      return {
        ...state,
        settingsDialog: { ...state.settingsDialog, isSaving: action.payload },
      };

    case "SET_SETTINGS_ERROR":
      return {
        ...state,
        settingsDialog: { ...state.settingsDialog, error: action.payload },
      };

    case "OPEN_REMOVE_DIALOG":
      return {
        ...state,
        removeDialog: action.payload,
      };

    case "CLOSE_REMOVE_DIALOG":
      return {
        ...state,
        removeDialog: null,
      };

    default:
      return state;
  }
}
