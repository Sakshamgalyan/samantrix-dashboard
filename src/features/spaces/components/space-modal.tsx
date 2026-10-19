"use client";

import React, { useCallback } from "react";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  Toggle,
  Typography,
  useToast,
} from "@galyan/ui";
import { Boxes } from "lucide-react";
import { queryErrorMessage } from "@/store";
import { useSpaces } from "../context";
import {
  closeCreateModalAction,
  closeEditModalAction,
  setActionErrorAction,
  setFormCapacityAction,
  setFormIsPrivateAction,
  setFormNameAction,
  setFormTypeAction,
  setIsSavingAction,
} from "../context/action";
import {
  useCreateOrgRoomMutation,
  useUpdateOrgRoomMutation,
} from "../context/api";
import { ROOM_TYPE_OPTIONS } from "../common/constants";
import type { RoomType } from "../types/api";

export function SpaceModal() {
  const { state, dispatch } = useSpaces();
  const {
    isCreateModalOpen,
    editingRoom,
    isSaving,
    formName,
    formType,
    formCapacity,
    formIsPrivate,
  } = state;

  const isOpen = isCreateModalOpen || editingRoom !== null;
  const isEditing = editingRoom !== null;

  const { toast } = useToast();
  const [createRoom] = useCreateOrgRoomMutation();
  const [updateRoom] = useUpdateOrgRoomMutation();

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
        toast.error("Please enter a space name.");
        return;
      }

      dispatch(setIsSavingAction(true));
      dispatch(setActionErrorAction(null));

      try {
        if (isEditing && editingRoom) {
          await updateRoom({
            roomId: editingRoom.id,
            data: {
              name: formName.trim(),
              type: formType,
              capacity: Number(formCapacity) || 10,
              isPrivate: formIsPrivate,
            },
          }).unwrap();

          toast.success(`Space '${formName}' updated successfully.`);
          dispatch(closeEditModalAction());
        } else {
          await createRoom({
            name: formName.trim(),
            type: formType,
            capacity: Number(formCapacity) || 10,
            isPrivate: formIsPrivate,
          }).unwrap();

          toast.success(`Space '${formName}' created successfully.`);
          dispatch(closeCreateModalAction());
        }
      } catch (err) {
        const msg = queryErrorMessage(
          err,
          isEditing ? "Failed to update space." : "Failed to create space.",
        );
        dispatch(setActionErrorAction(msg));
        toast.error(msg);
      } finally {
        dispatch(setIsSavingAction(false));
      }
    },
    [
      formName,
      formType,
      formCapacity,
      formIsPrivate,
      isEditing,
      editingRoom,
      createRoom,
      updateRoom,
      dispatch,
      toast,
    ],
  );

  const dropdownOptions = ROOM_TYPE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      icon={
        <div className="grid size-8 place-items-center rounded-lg bg-[var(--gy-primary-soft,#e0e7ff)] text-[var(--gy-primary,#4f46e5)]">
          <Boxes className="size-4" />
        </div>
      }
      title={isEditing ? "Edit Office Space" : "Create New Space"}
      subtitle="Configure virtual room dimensions, proximity boundaries, and capacity."
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
            form="space-form"
            isLoading={isSaving}
            loadingText={isEditing ? "Saving..." : "Creating..."}
            className="w-full sm:w-auto"
          >
            {isEditing ? "Save Changes" : "Create Space"}
          </Button>
        </div>
      }
    >
      <form id="space-form" onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Name Input */}
        <Input
          label="Space Name"
          placeholder="e.g. Apollo Huddle, Studio Alpha, Quiet Pod"
          value={formName}
          onChange={(e) => dispatch(setFormNameAction(e.target.value))}
          required
          autoFocus
          fullWidth
        />

        {/* Room Type Dropdown */}
        <Dropdown
          label="Space Archetype & Zone"
          options={dropdownOptions}
          value={formType}
          onChange={(val) => {
            if (typeof val === "string") {
              dispatch(setFormTypeAction(val as RoomType));
            }
          }}
        />

        {/* Capacity Input */}
        <Input
          label="Max Capacity (Seats)"
          type="number"
          min={1}
          max={200}
          placeholder="e.g. 10"
          value={formCapacity.toString()}
          onChange={(e) =>
            dispatch(setFormCapacityAction(Math.max(1, Number(e.target.value) || 1)))
          }
          helperText="Virtual 3D desks and spatial audio boundaries scale according to this capacity."
          required
          fullWidth
        />

        {/* Privacy Switch */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--gy-border)] p-3 bg-[var(--gy-surface-subtle)]">
          <div className="space-y-0.5">
            <Typography
              variant="p"
              weight="medium"
              textColor="var(--gy-text)"
              className="text-xs font-medium"
            >
              Private Space
            </Typography>
            <Typography
              variant="small"
              textColor="var(--gy-text-secondary)"
              className="text-xs block"
            >
              Only workspace members with assigned roles can enter.
            </Typography>
          </div>
          <Toggle
            size="sm"
            checked={formIsPrivate}
            onChange={(e) => dispatch(setFormIsPrivateAction(e.target.checked))}
          />
        </div>
      </form>
    </Modal>
  );
}
