"use client";

import React, { useCallback } from "react";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Modal,
  Typography,
  useToast,
} from "@galyan/ui";
import { Briefcase } from "lucide-react";
import { queryErrorMessage } from "@/store";
import { useDepartments } from "../context";
import {
  closeReassignModalAction,
  setActionErrorAction,
  setFormDepartmentAction,
  setFormJobTitleAction,
  setIsSavingAction,
} from "../context/action";
import { useUpdateMemberDepartmentMutation } from "../context/api";
import { DEPARTMENT_OPTIONS } from "../common/constants";

export function ReassignModal() {
  const { state, dispatch } = useDepartments();
  const { editingMember, formDepartment, formJobTitle, isSaving } = state;
  const isOpen = editingMember !== null;

  const { toast } = useToast();
  const [updateMember] = useUpdateMemberDepartmentMutation();

  const handleClose = useCallback(() => {
    if (isSaving) return;
    dispatch(closeReassignModalAction());
  }, [isSaving, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMember) return;

      dispatch(setIsSavingAction(true));
      dispatch(setActionErrorAction(null));

      try {
        await updateMember({
          memberId: editingMember.id,
          data: {
            department: formDepartment.trim() || null,
            jobTitle: formJobTitle.trim() || null,
          },
        }).unwrap();

        toast.success(
          `Updated ${editingMember.fullName}'s department to ${formDepartment || "Unassigned"}.`,
        );
        dispatch(closeReassignModalAction());
      } catch (err) {
        const msg = queryErrorMessage(err, "Failed to update member department.");
        dispatch(setActionErrorAction(msg));
        toast.error(msg);
      } finally {
        dispatch(setIsSavingAction(false));
      }
    },
    [editingMember, formDepartment, formJobTitle, updateMember, dispatch, toast],
  );

  const dropdownOptions = [
    { value: "", label: "Unassigned / General" },
    ...DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      icon={
        <div className="grid size-8 place-items-center rounded-lg bg-[var(--gy-primary-soft,#e0e7ff)] text-[var(--gy-primary,#4f46e5)]">
          <Briefcase className="size-4" />
        </div>
      }
      title="Team Assignment"
      subtitle="Update organizational department and professional job title."
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
            form="reassign-form"
            isLoading={isSaving}
            loadingText="Saving..."
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      {editingMember && (
        <form
          id="reassign-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-1"
        >
          {/* Member Card Preview */}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-3">
            <Avatar
              size="sm"
              name={editingMember.fullName}
              src={editingMember.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Typography
                  variant="span"
                  weight="semibold"
                  textColor="var(--gy-text)"
                  className="text-sm truncate"
                >
                  {editingMember.fullName}
                </Typography>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--gy-primary-soft,#6366f1)]/10 text-[var(--gy-primary,#6366f1)]">
                  {editingMember.role}
                </span>
              </div>
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs truncate block"
              >
                {editingMember.email}
              </Typography>
            </div>
          </div>

          {/* Department Selector */}
          <div className="space-y-1.5">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text)"
              className="text-xs block"
            >
              Department
            </Typography>
            <Dropdown
              size="sm"
              options={dropdownOptions}
              value={formDepartment}
              onChange={(val) => {
                if (typeof val === "string") {
                  dispatch(setFormDepartmentAction(val));
                }
              }}
            />
          </div>

          {/* Job Title Input */}
          <div className="space-y-1.5">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text)"
              className="text-xs block"
            >
              Job Title
            </Typography>
            <Input
              size="sm"
              placeholder="e.g. Lead Frontend Architect, VP Product"
              value={formJobTitle}
              onChange={(e) => dispatch(setFormJobTitleAction(e.target.value))}
              fullWidth
            />
            <Typography
              variant="small"
              textColor="var(--gy-text-subtle)"
              className="text-[11px] block"
            >
              Displayed across team directories, virtual name tags, and meeting summaries.
            </Typography>
          </div>
        </form>
      )}
    </Modal>
  );
}
