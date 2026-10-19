import type { AiAssistantsState } from "../types/state";
import type { AiAssistantsAction } from "../types/actions";

export function aiAssistantsReducer(
  state: AiAssistantsState,
  action: AiAssistantsAction,
): AiAssistantsState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_ARCHETYPE_FILTER":
      return { ...state, archetypeFilter: action.payload };

    case "RESET_FILTERS":
      return { ...state, searchQuery: "", archetypeFilter: "ALL" };

    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        isCreateModalOpen: true,
        editingAssistant: null,
        actionError: null,
        formName: "",
        formArchetype: "CUSTOM",
        formDescription: "",
        formModel: "gpt-4o",
        formSystemPrompt: "You are an intelligent workspace bot in the virtual office.",
        formAutoJoin: false,
        formAssignedRoomIds: [],
      };

    case "CLOSE_CREATE_MODAL":
      return { ...state, isCreateModalOpen: false, actionError: null };

    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        editingAssistant: action.payload,
        isCreateModalOpen: false,
        actionError: null,
        formName: action.payload.name,
        formArchetype: action.payload.archetype,
        formDescription: action.payload.description,
        formModel: action.payload.model,
        formSystemPrompt: action.payload.systemPrompt,
        formAutoJoin: action.payload.autoJoinMeetings,
        formAssignedRoomIds: action.payload.assignedRoomIds || [],
      };

    case "CLOSE_EDIT_MODAL":
      return { ...state, editingAssistant: null, actionError: null };

    case "OPEN_DELETE_MODAL":
      return { ...state, deletingAssistant: action.payload, actionError: null };

    case "CLOSE_DELETE_MODAL":
      return { ...state, deletingAssistant: null, actionError: null };

    case "SET_TOGGLING_ID":
      return { ...state, togglingId: action.payload };

    case "SET_IS_SAVING":
      return { ...state, isSaving: action.payload };

    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.payload };

    case "SET_FORM_NAME":
      return { ...state, formName: action.payload };

    case "SET_FORM_ARCHETYPE":
      return { ...state, formArchetype: action.payload };

    case "SET_FORM_DESCRIPTION":
      return { ...state, formDescription: action.payload };

    case "SET_FORM_MODEL":
      return { ...state, formModel: action.payload };

    case "SET_FORM_SYSTEM_PROMPT":
      return { ...state, formSystemPrompt: action.payload };

    case "SET_FORM_AUTO_JOIN":
      return { ...state, formAutoJoin: action.payload };

    case "SET_FORM_ASSIGNED_ROOMS":
      return { ...state, formAssignedRoomIds: action.payload };

    default:
      return state;
  }
}
