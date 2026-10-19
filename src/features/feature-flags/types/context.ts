import type React from "react";
import type {
  FeatureDialog,
  FeatureFlag,
  FeatureFlagsOverview,
  FeatureFlagsState,
} from "@/features/feature-flags/types/state";
import type { FeatureFlagsAction } from "@/features/feature-flags/types/actions";
import type { FeatureFormValues } from "@/features/feature-flags/types/forms";

export interface FeatureFlagsContextType {
  state: FeatureFlagsState;
  dispatch: React.Dispatch<FeatureFlagsAction>;

  overview: FeatureFlagsOverview | null;
  loadError: string | null;
  refreshing: boolean;
  category: string;
  search: string;
  dialog: FeatureDialog;
  submitting: boolean;
  togglingKey: string | null;
  importing: boolean;

  /** Features in the selected category matching the search term. */
  visibleFeatures: FeatureFlag[];
  /** visibleFeatures grouped by category, categories A–Z. */
  groupedFeatures: { category: string; features: FeatureFlag[] }[];
  /** Categories known to the catalog plus the built-in ones (for the form). */
  categoryOptions: string[];
  /** Only a superadmin edits the catalog; other developer roles read it. */
  canManage: boolean;

  setCategory: (category: string) => void;
  setSearch: (term: string) => void;
  openCreate: () => void;
  openEdit: (feature: FeatureFlag) => void;
  openDelete: (feature: FeatureFlag) => void;
  closeDialog: () => void;

  refresh: () => void;
  saveFeature: (values: FeatureFormValues) => Promise<boolean>;
  toggleDefault: (feature: FeatureFlag, enabled: boolean) => Promise<void>;
  toggleGlobal: (feature: FeatureFlag, enabled: boolean) => Promise<void>;
  deleteFeature: () => Promise<void>;
  importDefaults: () => Promise<void>;
}
