export type FeatureStatusFilter = "ALL" | "ACTIVE" | "DISABLED" | "LOCKED";

export interface FeaturesState {
  togglingKey: string | null;
  actionError: string | null;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: FeatureStatusFilter;
}
