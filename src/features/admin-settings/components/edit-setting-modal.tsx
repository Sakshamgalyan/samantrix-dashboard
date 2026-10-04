"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dropdown, Modal, Textarea } from "@galyan/ui";
import { Pencil } from "lucide-react";
import { useSettingsContext } from "../context";
import {
  editSettingSchema,
  type EditSettingFormValues,
  type SettingCategory,
} from "../types";
import { CATEGORY_OPTIONS } from "../common/constants";

/** Glass dialog for a custom setting's description and category (values are edited inline). */
export function EditSettingModal() {
  const { state, closeEdit, updateDetails } = useSettingsContext();
  const target = state.editTarget;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditSettingFormValues>({
    resolver: zodResolver(editSettingSchema),
    defaultValues: { description: "", category: "GENERAL" },
  });

  useEffect(() => {
    if (target) {
      reset({
        description: target.description ?? "",
        category: target.category,
      });
    }
  }, [target, reset]);

  const submit = handleSubmit(async (values) => {
    await updateDetails(values);
  });

  return (
    <Modal
      variant="glass"
      isOpen={target !== null}
      onClose={() => !state.updatingDetails && closeEdit()}
      size="sm"
      icon={<Pencil className="size-5" />}
      title="Edit setting details"
      subtitle={target?.key}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeEdit}
            disabled={state.updatingDetails}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={state.updatingDetails}
            disabled={!isDirty}
            onClick={() => void submit()}
          >
            Save details
          </Button>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Dropdown
              label="Category"
              variant="glass"
              options={CATEGORY_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v as SettingCategory)}
            />
          )}
        />
        <Textarea
          label="Description"
          rows={3}
          error={errors.description?.message}
          fullWidth
          {...register("description")}
        />
      </form>
    </Modal>
  );
}
