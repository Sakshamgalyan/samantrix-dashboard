import type { PlanTier } from "./state";

/** POST /feature-flags */
export interface CreateFeatureRequest {
  featureKey: string;
  name: string;
  description?: string;
  category: string;
  defaultEnabled: boolean;
  minPlanTier: PlanTier;
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
