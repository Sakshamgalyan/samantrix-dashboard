import type { PlanTier } from "@/features/feature-flags/types/state";

/** POST /feature-flags */
export interface CreateFeatureRequest {
  featureKey: string;
  name: string;
  description?: string;
  category: string;
  defaultEnabled: boolean;
  minPlanTier: PlanTier;
  isEnabled: boolean;
  isBeta: boolean;
  /** null removes the add-on price */
  addonPriceMonthly: number | null;
}

/** PATCH /feature-flags/:featureKey (the key itself is immutable). */
export type UpdateFeatureRequest = Partial<
  Omit<CreateFeatureRequest, "featureKey">
>;

/** DELETE /feature-flags/:featureKey */
export interface DeleteFeatureResponse {
  featureKey: string;
  name: string;
  removedOrganizationSettings: number;
  removedPlanEntitlements: number;
}

/** POST /feature-flags/import-defaults */
export interface ImportDefaultsResponse {
  imported: number;
  featureKeys: string[];
}
