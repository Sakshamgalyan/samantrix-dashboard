export interface OrgAiAssistant {
  id: string;
  name: string;
  archetype: string;
  description: string;
  model: string;
  systemPrompt: string;
  isEnabled: boolean;
  assignedRoomIds: string[];
  autoJoinMeetings: boolean;
  capabilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiAssistantPayload {
  name: string;
  archetype: string;
  description: string;
  model: string;
  systemPrompt: string;
  isEnabled?: boolean;
  assignedRoomIds?: string[];
  autoJoinMeetings?: boolean;
  capabilities?: string[];
}

export interface UpdateAiAssistantPayload {
  name?: string;
  description?: string;
  model?: string;
  systemPrompt?: string;
  isEnabled?: boolean;
  assignedRoomIds?: string[];
  autoJoinMeetings?: boolean;
  capabilities?: string[];
}
