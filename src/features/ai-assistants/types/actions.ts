import type { OrgAiAssistant } from "./api";

export type AiAssistantsAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_ARCHETYPE_FILTER"; payload: string }
  | { type: "RESET_FILTERS" }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "CLOSE_CREATE_MODAL" }
  | { type: "OPEN_EDIT_MODAL"; payload: OrgAiAssistant }
  | { type: "CLOSE_EDIT_MODAL" }
  | { type: "OPEN_DELETE_MODAL"; payload: OrgAiAssistant }
  | { type: "CLOSE_DELETE_MODAL" }
  | { type: "SET_TOGGLING_ID"; payload: string | null }
  | { type: "SET_IS_SAVING"; payload: boolean }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "SET_FORM_NAME"; payload: string }
  | { type: "SET_FORM_ARCHETYPE"; payload: string }
  | { type: "SET_FORM_DESCRIPTION"; payload: string }
  | { type: "SET_FORM_MODEL"; payload: string }
  | { type: "SET_FORM_SYSTEM_PROMPT"; payload: string }
  | { type: "SET_FORM_AUTO_JOIN"; payload: boolean }
  | { type: "SET_FORM_ASSIGNED_ROOMS"; payload: string[] };
