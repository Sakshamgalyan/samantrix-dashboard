import type { OrgAiAssistant } from "../types/api";
import type { AiAssistantsAction } from "../types/actions";

export const setSearchQueryAction = (query: string): AiAssistantsAction => ({
  type: "SET_SEARCH_QUERY",
  payload: query,
});

export const setArchetypeFilterAction = (filter: string): AiAssistantsAction => ({
  type: "SET_ARCHETYPE_FILTER",
  payload: filter,
});

export const resetFiltersAction = (): AiAssistantsAction => ({
  type: "RESET_FILTERS",
});

export const openCreateModalAction = (): AiAssistantsAction => ({
  type: "OPEN_CREATE_MODAL",
});

export const closeCreateModalAction = (): AiAssistantsAction => ({
  type: "CLOSE_CREATE_MODAL",
});

export const openEditModalAction = (
  assistant: OrgAiAssistant,
): AiAssistantsAction => ({
  type: "OPEN_EDIT_MODAL",
  payload: assistant,
});

export const closeEditModalAction = (): AiAssistantsAction => ({
  type: "CLOSE_EDIT_MODAL",
});

export const openDeleteModalAction = (
  assistant: OrgAiAssistant,
): AiAssistantsAction => ({
  type: "OPEN_DELETE_MODAL",
  payload: assistant,
});

export const closeDeleteModalAction = (): AiAssistantsAction => ({
  type: "CLOSE_DELETE_MODAL",
});

export const setTogglingIdAction = (
  id: string | null,
): AiAssistantsAction => ({
  type: "SET_TOGGLING_ID",
  payload: id,
});

export const setIsSavingAction = (isSaving: boolean): AiAssistantsAction => ({
  type: "SET_IS_SAVING",
  payload: isSaving,
});

export const setActionErrorAction = (
  error: string | null,
): AiAssistantsAction => ({
  type: "SET_ACTION_ERROR",
  payload: error,
});

export const setFormNameAction = (name: string): AiAssistantsAction => ({
  type: "SET_FORM_NAME",
  payload: name,
});

export const setFormArchetypeAction = (
  archetype: string,
): AiAssistantsAction => ({
  type: "SET_FORM_ARCHETYPE",
  payload: archetype,
});

export const setFormDescriptionAction = (
  desc: string,
): AiAssistantsAction => ({
  type: "SET_FORM_DESCRIPTION",
  payload: desc,
});

export const setFormModelAction = (model: string): AiAssistantsAction => ({
  type: "SET_FORM_MODEL",
  payload: model,
});

export const setFormSystemPromptAction = (
  prompt: string,
): AiAssistantsAction => ({
  type: "SET_FORM_SYSTEM_PROMPT",
  payload: prompt,
});

export const setFormAutoJoinAction = (
  autoJoin: boolean,
): AiAssistantsAction => ({
  type: "SET_FORM_AUTO_JOIN",
  payload: autoJoin,
});

export const setFormAssignedRoomsAction = (
  rooms: string[],
): AiAssistantsAction => ({
  type: "SET_FORM_ASSIGNED_ROOMS",
  payload: rooms,
});
