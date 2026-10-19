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
  /** Global switch: off hides the feature for every organization. */
  isEnabled: boolean;
  isBeta: boolean;
  /** Add-on price in INR per month when sold separately. */
  addonPriceMonthly: number | null;
  /** Organizations with the feature switched on. */
  enabled: number;
  /** Organizations that switched it off. */
  disabled: number;
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
  globallyDisabled: number;
  beta: number;
  paidAddons: number;
  categories: { category: string; count: number }[];
  totalOrganizations: number;
  averageAdoptionPercent: number | null;
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

/** UI-only state kept in the reducer; the catalog lives in the RTK Query cache. */
export type FeatureFlagsUiState = Omit<FeatureFlagsState, "overview" | "loadError">;

/** What components read: the UI state composed with the cached catalog query. */
export interface FeatureFlagsState {
  overview: FeatureFlagsOverview | null;
  /** Last load error; with `overview` set it means a background refresh failed (last data stays). */
  loadError: string | null;
  refreshing: boolean;
  /** Category tab: "ALL" or a category name. */
  category: string;
  search: string;
  dialog: FeatureDialog;
  submitting: boolean;
  /** Feature whose default / global toggle is being saved. */
  togglingKey: string | null;
  importing: boolean;
}
