"use client";

import React, { useCallback } from "react";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  Textarea,
  Toggle,
  Typography,
  useToast,
} from "@galyan/ui";
import { Bot } from "lucide-react";
import { queryErrorMessage } from "@/store";
import { useAiAssistants } from "../context";
import {
  closeCreateModalAction,
  closeEditModalAction,
  setActionErrorAction,
  setFormArchetypeAction,
  setFormAutoJoinAction,
  setFormDescriptionAction,
  setFormModelAction,
  setFormNameAction,
  setFormSystemPromptAction,
  setIsSavingAction,
} from "../context/action";
import {
  useCreateOrgAiAssistantMutation,
  useUpdateOrgAiAssistantMutation,
} from "../context/api";
import {
  ARCHETYPE_OPTIONS,
  MODEL_OPTIONS,
  getArchetypeMeta,
} from "../common/constants";

export function AssistantModal() {
  const { state, dispatch } = useAiAssistants();
  const {
    isCreateModalOpen,
    editingAssistant,
    isSaving,
    formName,
    formArchetype,
    formDescription,
    formModel,
    formSystemPrompt,
    formAutoJoin,
  } = state;

  const isOpen = isCreateModalOpen || editingAssistant !== null;
  const isEditing = editingAssistant !== null;

  const { toast } = useToast();
  const [createAssistant] = useCreateOrgAiAssistantMutation();
  const [updateAssistant] = useUpdateOrgAiAssistantMutation();

  const handleClose = useCallback(() => {
    if (isSaving) return;
    if (isEditing) {
      dispatch(closeEditModalAction());
    } else {
      dispatch(closeCreateModalAction());
    }
  }, [isSaving, isEditing, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formName.trim()) {
        toast.error("Please enter an assistant name.");
        return;
      }

      dispatch(setIsSavingAction(true));
      dispatch(setActionErrorAction(null));

      try {
        if (isEditing && editingAssistant) {
          await updateAssistant({
            assistantId: editingAssistant.id,
            data: {
              name: formName.trim(),
              description: formDescription.trim(),
              model: formModel,
              systemPrompt: formSystemPrompt.trim(),
              autoJoinMeetings: formAutoJoin,
            },
          }).unwrap();

          toast.success(`Assistant '${formName}' updated successfully.`);
          dispatch(closeEditModalAction());
        } else {
          await createAssistant({
            name: formName.trim(),
            archetype: formArchetype,
            description: formDescription.trim(),
            model: formModel,
            systemPrompt: formSystemPrompt.trim(),
            autoJoinMeetings: formAutoJoin,
          }).unwrap();

          toast.success(`Assistant '${formName}' deployed successfully.`);
          dispatch(closeCreateModalAction());
        }
      } catch (err) {
        const msg = queryErrorMessage(
          err,
          isEditing
            ? "Failed to update assistant."
            : "Failed to deploy assistant.",
        );
        dispatch(setActionErrorAction(msg));
        toast.error(msg);
      } finally {
        dispatch(setIsSavingAction(false));
      }
    },
    [
      formName,
      formArchetype,
      formDescription,
      formModel,
      formSystemPrompt,
      formAutoJoin,
      isEditing,
      editingAssistant,
      createAssistant,
      updateAssistant,
      dispatch,
      toast,
    ],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      icon={
        <div className="grid size-8 place-items-center rounded-lg bg-[var(--gy-primary-soft,#e0e7ff)] text-[var(--gy-primary,#4f46e5)]">
          <Bot className="size-4" />
        </div>
      }
      title={isEditing ? "Configure AI Assistant" : "Deploy New AI Assistant"}
      subtitle="Tune the autonomous instructions, model parameters, and meeting behavior ahead of launch."
      closable={!isSaving}
      preventBackdropClose={isSaving}
      footer={
        <div className="flex flex-col-reverse sm:flex-row w-full items-stretch sm:items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="assistant-form"
            isLoading={isSaving}
            loadingText={isEditing ? "Saving..." : "Deploying..."}
            className="w-full sm:w-auto"
          >
            {isEditing ? "Save Configuration" : "Deploy Bot"}
          </Button>
        </div>
      }
    >
      <form id="assistant-form" onSubmit={handleSubmit} className="space-y-4 py-1 max-h-[calc(82vh-8rem)] overflow-y-auto pr-1">
        {/* Name & Archetype Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Input
              label="Assistant Name"
              placeholder="e.g. Sprint Scribe, Dev Guide"
              value={formName}
              onChange={(e) => dispatch(setFormNameAction(e.target.value))}
              required
              autoFocus
              fullWidth
            />
          </div>

          <div>
            <Dropdown
              label="Bot Archetype"
              disabled={isEditing}
              options={ARCHETYPE_OPTIONS}
              value={formArchetype}
              onChange={(val) => {
                if (typeof val === "string") {
                  dispatch(setFormArchetypeAction(val));
                  const meta = getArchetypeMeta(val);
                  if (
                    !formSystemPrompt ||
                    formSystemPrompt === getArchetypeMeta(formArchetype).defaultPrompt
                  ) {
                    dispatch(setFormSystemPromptAction(meta.defaultPrompt));
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <Dropdown
            label="Intelligence Engine (LLM Model)"
            options={MODEL_OPTIONS}
            value={formModel}
            onChange={(val) => {
              if (typeof val === "string") {
                dispatch(setFormModelAction(val));
              }
            }}
          />
        </div>

        {/* Description */}
        <div>
          <Input
            label="Description"
            placeholder="Brief summary of what this bot handles..."
            value={formDescription}
            onChange={(e) => dispatch(setFormDescriptionAction(e.target.value))}
            fullWidth
          />
        </div>

        {/* System Prompt Textarea */}
        <div className="space-y-1.5">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text)"
            className="text-xs block"
          >
            System Instructions &amp; Behavior Prompt
          </Typography>
          <Textarea
            rows={4}
            placeholder="Describe how the assistant should interact, answer queries, or format meeting notes..."
            value={formSystemPrompt}
            onChange={(e) => dispatch(setFormSystemPromptAction(e.target.value))}
            className="font-mono text-xs"
          />
        </div>

        {/* Auto Join Meetings Switch */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--gy-border)] p-3 bg-[var(--gy-surface-subtle)]">
          <div className="space-y-0.5">
            <Typography
              variant="p"
              weight="medium"
              textColor="var(--gy-text)"
              className="text-xs font-medium"
            >
              Auto-Join Video Meetings
            </Typography>
            <Typography
              variant="small"
              textColor="var(--gy-text-secondary)"
              className="text-xs block"
            >
              Automatically join meeting rooms when team members start a call to capture summaries.
            </Typography>
          </div>
          <Toggle
            size="sm"
            checked={formAutoJoin}
            onChange={(e) => dispatch(setFormAutoJoinAction(e.target.checked))}
          />
        </div>
      </form>
    </Modal>
  );
}
