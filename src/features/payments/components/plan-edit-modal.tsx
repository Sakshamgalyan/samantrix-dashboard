"use client";

import { useMemo, useState } from "react";
import {
  Banner,
  Button,
  Chip,
  Dropdown,
  Input,
  Modal,
  Skeleton,
  Textarea,
  Toggle,
  useToast,
} from "@galyan/ui";
import { Plus, Sparkles, Tags } from "lucide-react";
import { PLAN_OPTIONS } from "@/features/payments/common/constants";
import {
  errorMessage,
  useGetPlatformFeatureCatalogQuery,
  usePaymentsContext,
} from "@/features/payments/context";
import type { Plan, PlanTier, PlatformFeatureCatalogItem } from "@/features/payments/types";

interface FormState {
  planTier: PlanTier;
  name: string;
  description: string;
  monthly: string;
  yearly: string;
  minSeats: string;
  maxSeats: string;
  isActive: boolean;
  selectedFeatures: string[];
  customFeatures: string;
}

const DEFAULT_TIER: PlanTier = "STARTER";

const initializeForm = (
  plan: Plan | null,
  availableTiers: PlanTier[],
): FormState => {
  if (plan) {
    return {
      planTier: plan.planTier,
      name: plan.name,
      description: plan.description ?? "",
      monthly: String(plan.pricePerSeatMonthly),
      yearly: String(plan.pricePerSeatYearly),
      minSeats: String(plan.minSeats),
      maxSeats: plan.maxSeats == null ? "" : String(plan.maxSeats),
      isActive: plan.isActive,
      selectedFeatures: [...plan.features],
      customFeatures: "",
    };
  }

  const defaultTier = availableTiers[0] ?? DEFAULT_TIER;
  return {
    planTier: defaultTier,
    name: "",
    description: "",
    monthly: "0",
    yearly: "0",
    minSeats: "1",
    maxSeats: "",
    isActive: true,
    selectedFeatures: [],
    customFeatures: "",
  };
};

export const PlanEditModal = ({
  isOpen,
  plan,
  existingTiers = [],
  onClose,
}: {
  isOpen: boolean;
  plan: Plan | null;
  existingTiers?: PlanTier[];
  onClose: () => void;
}) => {
  const isCreate = plan === null;
  const { updatePlan, createPlan } = usePaymentsContext();
  const { toast } = useToast();

  const { data: catalog = [], isLoading: isCatalogLoading } =
    useGetPlatformFeatureCatalogQuery();

  const availableTiers = useMemo(() => {
    if (!isCreate) return [];
    return (Object.keys(PLAN_OPTIONS) as unknown as PlanTier[]).length
      ? PLAN_OPTIONS.map((o) => o.value as PlanTier).filter(
          (t) => !existingTiers.includes(t),
        )
      : (["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"] as PlanTier[]).filter(
          (t) => !existingTiers.includes(t),
        );
  }, [isCreate, existingTiers]);

  const [form, setForm] = useState<FormState>(() =>
    initializeForm(plan, availableTiers),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Group features by category
  const groupedFeatures = useMemo(() => {
    const map = new Map<string, PlatformFeatureCatalogItem[]>();
    catalog.forEach((feat) => {
      const cat = feat.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(feat);
    });
    return Array.from(map.entries());
  }, [catalog]);

  // Check if a feature from the catalog is enabled in the current form
  const isFeatureActive = (feat: PlatformFeatureCatalogItem) => {
    return form.selectedFeatures.some(
      (f) =>
        f.trim().toLowerCase() === feat.name.trim().toLowerCase() ||
        f.trim().toLowerCase() === feat.featureKey.trim().toLowerCase(),
    );
  };

  const handleToggleFeature = (
    feat: PlatformFeatureCatalogItem,
    checked: boolean,
  ) => {
    setForm((prev) => {
      const current = prev.selectedFeatures.filter(
        (f) =>
          f.trim().toLowerCase() !== feat.name.trim().toLowerCase() &&
          f.trim().toLowerCase() !== feat.featureKey.trim().toLowerCase(),
      );
      if (checked) {
        return {
          ...prev,
          selectedFeatures: [...current, feat.name],
        };
      }
      return {
        ...prev,
        selectedFeatures: current,
      };
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      return setError("Please provide a name for this plan.");
    }
    const monthly = Number(form.monthly);
    const yearly = Number(form.yearly);
    const minSeats = Number(form.minSeats);
    const maxSeats = form.maxSeats.trim() ? Number(form.maxSeats) : null;

    if (![monthly, yearly].every((n) => Number.isFinite(n) && n >= 0)) {
      return setError("Prices must be 0 or more.");
    }
    if (!Number.isInteger(minSeats) || minSeats < 1) {
      return setError("Minimum seats must be a whole number of at least 1.");
    }
    if (
      maxSeats !== null &&
      (!Number.isInteger(maxSeats) || maxSeats < minSeats)
    ) {
      return setError(
        "Maximum seats must be a whole number not below the minimum.",
      );
    }

    // Combine catalog selected features + any custom lines
    const customList = form.customFeatures
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const mergedFeatures = Array.from(
      new Set([...form.selectedFeatures, ...customList]),
    );

    setSaving(true);
    setError(null);

    try {
      if (isCreate) {
        await createPlan({
          planTier: form.planTier,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          pricePerSeatMonthly: monthly,
          pricePerSeatYearly: yearly,
          minSeats,
          maxSeats,
          features: mergedFeatures,
          isActive: form.isActive,
        });
        toast.success(`Plan "${form.name}" created successfully`);
      } else {
        await updatePlan(plan.planTier, {
          name: form.name.trim() || plan.name,
          description: form.description.trim(),
          pricePerSeatMonthly: monthly,
          pricePerSeatYearly: yearly,
          minSeats,
          maxSeats,
          features: mergedFeatures,
          isActive: form.isActive,
        });
        toast.success(`${form.name || plan.name} updated successfully`);
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Couldn't save the plan."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? undefined : onClose}
      size="lg"
      icon={isCreate ? <Plus className="size-4" /> : <Tags className="size-4" />}
      title={isCreate ? "Create New Subscription Plan" : `Configure ${plan?.name ?? "Plan"}`}
      subtitle="Configure pricing, seat limits, and toggle platform features included in this tier."
      preventBackdropClose={saving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void save()}
            isLoading={saving}
          >
            {isCreate ? "Create Plan" : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        {error && (
          <Banner
            variant="danger"
            size="sm"
            bannerStyle="subtle"
            description={error}
          />
        )}

        {/* Tier selection & Plan Identity */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isCreate ? (
              <Dropdown
                label="Plan Tier"
                size="sm"
                options={PLAN_OPTIONS}
                value={form.planTier}
                onChange={(v) => setField("planTier", v as PlanTier)}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--gy-text-secondary)]">
                  Plan Tier
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <Chip variant="solid" size="sm">
                    {plan?.planTier}
                  </Chip>
                  <span className="text-xs text-[var(--gy-text-subtle)]">
                    (Tier is immutable for existing plans)
                  </span>
                </div>
              </div>
            )}

            <Input
              label="Display Name"
              size="sm"
              placeholder="e.g. Professional Cloud"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </div>

          <Input
            label="Description / Pitch"
            size="sm"
            placeholder="Brief 1-sentence value proposition"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        {/* Pricing & Seat limits */}
        <div className="rounded-lg border border-[var(--gy-border)] bg-[var(--gy-surface)] p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gy-text-subtle)]">
              Pricing & Seat Capacity
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="₹ / seat / month"
              size="sm"
              type="number"
              min={0}
              value={form.monthly}
              onChange={(e) => setField("monthly", e.target.value)}
            />
            <Input
              label="₹ / seat / year"
              size="sm"
              type="number"
              min={0}
              value={form.yearly}
              onChange={(e) => setField("yearly", e.target.value)}
            />
            <Input
              label="Min Seats"
              size="sm"
              type="number"
              min={1}
              value={form.minSeats}
              onChange={(e) => setField("minSeats", e.target.value)}
            />
            <Input
              label="Max Seats"
              size="sm"
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.maxSeats}
              onChange={(e) => setField("maxSeats", e.target.value)}
            />
          </div>
        </div>

        {/* Platform Feature Catalog with Toggle Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--gy-primary)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gy-text)]">
                Included Platform Features (API Catalog)
              </span>
            </div>
            <span className="text-xs text-[var(--gy-text-subtle)]">
              {form.selectedFeatures.length} active
            </span>
          </div>

          <p className="text-xs text-[var(--gy-text-secondary)]">
            Toggle features on or off to activate them for organizations subscribed to this plan.
          </p>

          {isCatalogLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : groupedFeatures.length === 0 ? (
            <div className="rounded-md border border-[var(--gy-border)] p-4 text-center text-xs text-[var(--gy-text-subtle)]">
              No platform features found in catalog API.
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto rounded-lg border border-[var(--gy-border)] divide-y divide-[var(--gy-border)] bg-[var(--gy-surface)]">
              {groupedFeatures.map(([category, items]) => (
                <div key={category} className="p-3">
                  <div className="mb-2">
                    <Chip variant="soft" size="xs">
                      {category}
                    </Chip>
                  </div>
                  <div className="space-y-2">
                    {items.map((feat) => {
                      const active = isFeatureActive(feat);
                      return (
                        <div
                          key={feat.featureKey}
                          className="flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 transition-colors hover:bg-[var(--gy-surface-hover)]"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-xs font-medium text-[var(--gy-text)] truncate">
                              {feat.name}
                            </span>
                            {feat.description && (
                              <span className="text-[11px] text-[var(--gy-text-subtle)] line-clamp-1">
                                {feat.description}
                              </span>
                            )}
                          </div>
                          <Toggle
                            size="sm"
                            checked={active}
                            onChange={(e) =>
                              handleToggleFeature(feat, e.target.checked)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom / Additional Perks (Textarea) */}
        <div className="space-y-1.5">
          <Textarea
            label="Additional Custom Perks (optional, one per line)"
            rows={2}
            placeholder="e.g. 99.9% uptime SLA&#10;Dedicated account manager"
            value={form.customFeatures}
            onChange={(e) => setField("customFeatures", e.target.value)}
          />
        </div>

        {/* Available for purchase Toggle */}
        <div className="pt-1">
          <Toggle
            size="sm"
            label="Available for purchase (Active)"
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}
