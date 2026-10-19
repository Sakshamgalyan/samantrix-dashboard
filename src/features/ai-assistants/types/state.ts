import type { OrgAiAssistant } from "./api";

export interface AiAssistantsState {
  searchQuery: string;
  archetypeFilter: string;
  isCreateModalOpen: boolean;
  editingAssistant: OrgAiAssistant | null;
  deletingAssistant: OrgAiAssistant | null;
  togglingId: string | null;
  isSaving: boolean;
  actionError: string | null;
  formName: string;
  formArchetype: string;
  formDescription: string;
  formModel: string;
  formSystemPrompt: string;
  formAutoJoin: boolean;
  formAssignedRoomIds: string[];
}

export const INITIAL_AI_ASSISTANTS_STATE: AiAssistantsState = {
  searchQuery: "",
  archetypeFilter: "ALL",
  isCreateModalOpen: false,
  editingAssistant: null,
  deletingAssistant: null,
  togglingId: null,
  isSaving: false,
  actionError: null,
  formName: "",
  formArchetype: "CUSTOM",
  formDescription: "",
  formModel: "gpt-4o",
  formSystemPrompt: "",
  formAutoJoin: false,
  formAssignedRoomIds: [],
};
