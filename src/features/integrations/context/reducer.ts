import type { IntegrationsState } from "@/features/integrations/types/state";
import type { IntegrationsAction } from "@/features/integrations/types/actions";

export const initialIntegrationsState: IntegrationsState = {
  page: 1,
  isCreateOpen: false,
  keyName: "",
  creating: false,
  newKeySecret: null,
  copiedKey: false,
  revokeTarget: null,
  revoking: false,
  actionError: null,
  deleteRepoTarget: null,
  deletingRepo: false,
  showSecret: false,
  copiedWebhook: false,
  copiedSecret: false,
  confirmRotateOpen: false,
  rotatingSecret: false,
  activeTab: "all",
};

export function integrationsReducer(
  state: IntegrationsState,
  action: IntegrationsAction,
): IntegrationsState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        isCreateOpen: true,
        keyName: "",
        newKeySecret: null,
        copiedKey: false,
        actionError: null,
      };
    case "CLOSE_CREATE_MODAL":
      return {
        ...state,
        isCreateOpen: false,
        keyName: "",
        newKeySecret: null,
        copiedKey: false,
        actionError: null,
      };
    case "SET_CREATE_OPEN":
      return {
        ...state,
        isCreateOpen: action.payload,
        keyName: action.payload ? "" : "",
        newKeySecret: action.payload ? null : null,
        copiedKey: false,
        actionError: null,
      };
    case "SET_KEY_NAME":
      return { ...state, keyName: action.payload };
    case "SET_CREATING":
      return { ...state, creating: action.payload };
    case "SET_NEW_KEY_SECRET":
      return { ...state, newKeySecret: action.payload };
    case "SET_COPIED_KEY":
      return { ...state, copiedKey: action.payload };
    case "SET_REVOKE_TARGET":
      return { ...state, revokeTarget: action.payload, actionError: null };
    case "SET_REVOKING":
      return { ...state, revoking: action.payload };
    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.payload };
    case "SET_DELETE_REPO_TARGET":
      return { ...state, deleteRepoTarget: action.payload, actionError: null };
    case "SET_DELETING_REPO":
      return { ...state, deletingRepo: action.payload };
    case "SET_SHOW_SECRET":
      return { ...state, showSecret: action.payload };
    case "SET_COPIED_WEBHOOK":
      return { ...state, copiedWebhook: action.payload };
    case "SET_COPIED_SECRET":
      return { ...state, copiedSecret: action.payload };
    case "SET_CONFIRM_ROTATE_OPEN":
      return { ...state, confirmRotateOpen: action.payload };
    case "SET_ROTATING_SECRET":
      return { ...state, rotatingSecret: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
}
