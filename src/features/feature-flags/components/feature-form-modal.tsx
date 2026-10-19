"use client";

import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { Button, Dropdown, Input, Modal, Textarea, Toggle } from "@galyan/ui";
import { Flag } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { DEFAULT_CATEGORY, PLAN_META, PLAN_TIERS } from "@/features/feature-flags/common/constants";
import { useFeatureFlagsContext } from "@/features/feature-flags/context";
import {
  NEW_CATEGORY,
  featureFormSchema,
  type FeatureFlag,
  type FeatureFormValues,
} from "@/features/feature-flags/types";

const FORM_ID = "feature-flag-form";

const PLAN_OPTIONS = PLAN_TIERS.map((tier) => ({
  value: tier,
  label: PLAN_META[tier].label,
  description: PLAN_META[tier].description,
}));

const initialValues = (feature: FeatureFlag | null): FeatureFormValues => ({
  featureKey: feature?.featureKey ?? "",
  name: feature?.name ?? "",
  description: feature?.description ?? "",
  category: feature?.category ?? DEFAULT_CATEGORY,
  newCategory: "",
  minPlanTier: feature?.minPlanTier ?? "FREE",
  defaultEnabled: feature?.defaultEnabled ?? false,
  isEnabled: feature?.isEnabled ?? true,
  isBeta: feature?.isBeta ?? false,
  addonPrice:
    feature?.addonPriceMonthly !== null && feature?.addonPriceMonthly !== undefined
      ? String(feature.addonPriceMonthly)
      : "",
});

/** A labelled switch row inside the form. */
const SwitchRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-2`}>
    <div>
      <div className="text-sm font-medium text-[var(--gy-text)]">{title}</div>
      <div className="text-xs text-[var(--gy-text-secondary)]">{description}</div>
    </div>
    <Toggle checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={title} />
  </div>
);

/** Form body; remounted (keyed) for each dialog so it starts from the right values. */
const FeatureForm = ({ feature }: { feature: FeatureFlag | null }) => {
  const { categoryOptions, saveFeature } = useFeatureFlagsContext();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FeatureFormValues>({
    resolver: zodResolver(featureFormSchema),
    mode: "onTouched",
    defaultValues: initialValues(feature),
  });
  const category = useWatch({ control, name: "category" });

  const options = [
    ...categoryOptions.map((c) => ({ value: c, label: c })),
    { value: NEW_CATEGORY, label: "New category…" },
  ];

  return (
    <form
      id={FORM_ID}
      className="space-y-3"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await saveFeature(values);
      })}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Feature key"
          placeholder="custom_branding"
          fullWidth
          required
          disabled={feature !== null}
          className="[&_input]:font-mono"
          hasError={!!errors.featureKey}
          error={errors.featureKey?.message}
          helperText={
            feature
              ? "Keys can't change once organizations use them"
              : "Lowercase snake_case, used by the apps"
          }
          {...register("featureKey")}
        />
        <Input
          label="Display name"
          placeholder="Custom Branding"
          fullWidth
          required
          hasError={!!errors.name}
          error={errors.name?.message}
          {...register("name")}
        />
      </div>
      <Textarea
        label="Description"
        placeholder="What organizations get when this is on"
        fullWidth
        rows={2}
        maxCharCount={500}
        hasError={!!errors.description}
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Dropdown
              label="Category"
              options={options}
              value={field.value}
              onChange={(v) => field.onChange(v as string)}
              error={errors.category?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="minPlanTier"
          render={({ field }) => (
            <Dropdown
              label="Minimum plan"
              options={PLAN_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v as string)}
            />
          )}
        />
      </div>
      {category === NEW_CATEGORY && (
        <Input
          label="New category name"
          placeholder="e.g. Collaboration"
          fullWidth
          hasError={!!errors.newCategory}
          error={errors.newCategory?.message}
          {...register("newCategory")}
        />
      )}
      <Input
        label="Add-on price (INR / month)"
        placeholder="Leave empty when included in the plan"
        fullWidth
        inputMode="decimal"
        hasError={!!errors.addonPrice}
        error={errors.addonPrice?.message}
        helperText="Set a price to sell it separately from the plan"
        {...register("addonPrice")}
      />
      <Controller
        control={control}
        name="isEnabled"
        render={({ field }) => (
          <SwitchRow
            title="Live"
            description="Off hides the feature from every organization, whatever their setting."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="defaultEnabled"
        render={({ field }) => (
          <SwitchRow
            title="On by default"
            description="New organizations start with it switched on; existing ones keep their setting."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="isBeta"
        render={({ field }) => (
          <SwitchRow
            title="Beta"
            description="Labelled as beta wherever organizations see it."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </form>
  );
}

export const FeatureFormModal = () => {
  const { dialog, submitting, closeDialog } = useFeatureFlagsContext();
  const open = dialog?.kind === "create" || dialog?.kind === "edit";
  const feature = dialog?.kind === "edit" ? dialog.feature : null;

  return (
    <Modal
      size="lg"
      isOpen={open}
      onClose={closeDialog}
      icon={<Flag className="size-5" />}
      title={feature ? `Edit ${feature.name}` : "Add a feature"}
      subtitle={
        feature
          ? feature.featureKey
          : "Adds a feature to the catalog. Organizations on an eligible plan can switch it on."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeDialog}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form={FORM_ID}
            isLoading={submitting}
          >
            {feature ? "Save changes" : "Add feature"}
          </Button>
        </div>
      }
    >
      {open && (
        <FeatureForm key={feature?.featureKey ?? "new"} feature={feature} />
      )}
    </Modal>
  );
}
