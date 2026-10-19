export interface OrgFeatureState {
  /** Backend feature key, e.g. `ai_agent`, `virtual_office`. */
  key: string;
  name?: string;
  description?: string;
  category?: string;
  minTier?: string;
  /** Included in the current plan. */
  isAllowed: boolean;
  /** Enabled in this organization. */
  isEnabled: boolean;
}
