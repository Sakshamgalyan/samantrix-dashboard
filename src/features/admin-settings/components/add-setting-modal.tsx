"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { Button, Dropdown, Input, Modal, Textarea, Toggle, Typography } from "@galyan/ui";
import { Plus } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useSettingsContext } from "@/features/admin-settings/context";
import { addSettingSchema, type AddSettingFormValues } from "@/features/admin-settings/types/forms";
import type { SettingCategory } from "@/features/admin-settings/types/api";
import { CATEGORY_OPTIONS } from "@/features/admin-settings/common/constants";

const EMPTY: AddSettingFormValues = {
  key: "",
  value: "",
  description: "",
  category: "GENERAL",
  isSecret: false,
};

/** Glass dialog for adding a custom (free-text, optionally secret) setting. */
export const AddSettingModal = () => {
  const { state, closeAdd, createSetting } = useSettingsContext();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSettingFormValues>({
    resolver: zodResolver(addSettingSchema),
    defaultValues: {
      ...EMPTY,
      category:
        state.activeTab === "ALL" ? "GENERAL" : (state.activeTab as SettingCategory),
    },
  });

  useEffect(() => {
    if (state.addOpen) {
      reset({
        ...EMPTY,
        category: state.activeTab === "ALL" ? "GENERAL" : state.activeTab,
      });
    }
  }, [state.addOpen, state.activeTab, reset]);

  const isSecret = useWatch({ control, name: "isSecret" });
  const submit = handleSubmit(async (values) => {
    await createSetting(values);
  });

  return (
    <Modal
      isOpen={state.addOpen}
      onClose={() => !state.creating && closeAdd()}
      size="md"
      icon={<Plus className="size-5" />}
      title="Add a custom setting"
      subtitle="Built-in settings are already listed; use this for any other configuration you need."
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeAdd}
            disabled={state.creating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={state.creating}
            onClick={() => void submit()}
          >
            Add setting
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
        <Input
          label="Key"
          placeholder="integration.slack_channel"
          required
          autoComplete="off"
          error={errors.key?.message}
          helperText={
            errors.key ? undefined : "Lower-case words separated by dots."
          }
          fullWidth
          className="[&_input]:font-mono"
          {...register("key")}
        />
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Dropdown
              label="Category"
              options={CATEGORY_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v as SettingCategory)}
            />
          )}
        />
        <Controller
          control={control}
          name="isSecret"
          render={({ field }) => (
            <div
              className={`${GLASS_ROW} flex items-center justify-between gap-4 px-3 py-2.5`}
            >
              <div>
                <Typography variant="p" className="text-sm font-medium text-[var(--gy-text)]">
                  Secret value
                </Typography>
                <Typography variant="p" className="text-xs text-[var(--gy-text-secondary)]">
                  Write-only: it can be replaced but never shown again.
                </Typography>
              </div>
              <Toggle
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                aria-label="Secret value"
              />
            </div>
          )}
        />
        <Input
          label="Value"
          type={isSecret ? "password" : "text"}
          autoComplete={isSecret ? "new-password" : "off"}
          required
          error={errors.value?.message}
          fullWidth
          {...register("value")}
        />
        <Textarea
          label="Description"
          placeholder="What this setting controls (optional)"
          rows={2}
          error={errors.description?.message}
          fullWidth
          {...register("description")}
        />
      </form>
    </Modal>
  );
};
