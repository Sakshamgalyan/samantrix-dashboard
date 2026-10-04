export type PlanTier = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

/** A catalog feature joined with its adoption across live organizations (GET /feature-flags). */
export interface FeatureFlag {
  id: string;
  featureKey: string;
  name: string;
  description: string | null;
  category: string;
  defaultEnabled: boolean;
  minPlanTier: PlanTier;
  createdAt: string;
  updatedAt: string;
  /** Organizations with the feature switched on. */
  enabled: number;
  /** Organizations that switched it off. */
  disabled: number;
  /** Organizations with no stored setting (treated as off). */
  notConfigured: number;
  /** Organizations whose plan meets the minimum tier. */
  eligible: number;
  /** Enabled organizations below the minimum tier. */
  enabledOutsidePlan: number;
  /** Share of eligible organizations with it on; null when none are eligible. */
  adoptionPercent: number | null;
}

export interface FeatureFlagsSummary {
  totalFeatures: number;
  enabledByDefault: number;
  planGated: number;
  categories: { category: string; count: number }[];
  totalOrganizations: number;
  organizationsByPlan: Record<PlanTier, number>;
  averageAdoptionPercent: number | null;
  enabledOutsidePlan: number;
  missingDefaults: string[];
  orphanKeys: { featureKey: string; organizations: number }[];
}

export interface FeatureFlagsOverview {
  generatedAt: string;
  summary: FeatureFlagsSummary;
  features: FeatureFlag[];
}

export type FeatureDialog =
  | { kind: "create" }
  | { kind: "edit"; feature: FeatureFlag }
  | { kind: "delete"; feature: FeatureFlag }
  | null;

export interface FeatureFlagsState {
  overview: FeatureFlagsOverview | null;
  /** Last load error; with `overview` set it means a background refresh failed. */
  loadError: string | null;
  refreshing: boolean;
  /** Category tab: "ALL" or a category name. */
  category: string;
  search: string;
  dialog: FeatureDialog;
  submitting: boolean;
  /** Feature whose default toggle is being saved. */
  togglingKey: string | null;
  importing: boolean;
}
