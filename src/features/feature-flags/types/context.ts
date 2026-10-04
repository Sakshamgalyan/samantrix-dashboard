import type React from "react";
import type {
  FeatureDialog,
  FeatureFlag,
  FeatureFlagsOverview,
  FeatureFlagsState,
} from "./state";
import type { FeatureFlagsAction } from "./actions";
import type { FeatureFormValues } from "./forms";

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

  /** Features in the selected category tab matching the search term. */
  visibleFeatures: FeatureFlag[];
  /** Categories known to the catalog plus the built-in ones (for the form). */
  categoryOptions: string[];
  /** SUPERADMIN / PLATFORM_ADMIN may edit; REPORT_ADMIN is read-only. */
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
  deleteFeature: () => Promise<void>;
  importDefaults: () => Promise<void>;
}
