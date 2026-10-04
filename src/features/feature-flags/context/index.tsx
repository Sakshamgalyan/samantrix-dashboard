"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/lib/auth-context";
import { useAutoRefresh } from "@/components/admin";
import {
  ALL_CATEGORIES,
  DEFAULT_CATEGORY,
  FALLBACK_ERROR,
} from "../common/constants";
import {
  NEW_CATEGORY,
  type FeatureFlag,
  type FeatureFlagsContextType,
  type FeatureFormValues,
} from "../types";
import { featureFlagsReducer, initialFeatureFlagsState } from "./reducer";
import * as actions from "./action";
import {
  createFeatureApi,
  deleteFeatureApi,
  getApiErrorMessage,
  importDefaultsApi,
  loadFeatureFlagsApi,
  updateFeatureApi,
} from "./api";

const MANAGER_ROLES = new Set(["SUPERADMIN", "PLATFORM_ADMIN"]);

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined,
);

export function FeatureFlagsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    featureFlagsReducer,
    initialFeatureFlagsState,
  );

  const canManage = Boolean(
    (user?.platformRole && MANAGER_ROLES.has(user.platformRole)) ||
    user?.role === "SUPERADMIN",
  );

  const load = useCallback(() => loadFeatureFlagsApi(dispatch), []);
  useAutoRefresh(load);

  const refresh = useCallback(() => {
    dispatch(actions.setRefreshing(true));
    void load();
  }, [load]);

  const setCategory = useCallback(
    (category: string) => dispatch(actions.setCategory(category)),
    [],
  );
  const setSearch = useCallback(
    (term: string) => dispatch(actions.setSearch(term)),
    [],
  );
  const openCreate = useCallback(
    () => dispatch(actions.setDialog({ kind: "create" })),
    [],
  );
  const openEdit = useCallback(
    (feature: FeatureFlag) =>
      dispatch(actions.setDialog({ kind: "edit", feature })),
    [],
  );
  const openDelete = useCallback(
    (feature: FeatureFlag) =>
      dispatch(actions.setDialog({ kind: "delete", feature })),
    [],
  );
  const closeDialog = useCallback(() => {
    if (!state.submitting) dispatch(actions.setDialog(null));
  }, [state.submitting]);

  const saveFeature = useCallback(
    async (values: FeatureFormValues): Promise<boolean> => {
      const dialog = state.dialog;
      if (!dialog || dialog.kind === "delete") return false;
      const category =
        values.category === NEW_CATEGORY ? values.newCategory : values.category;
      const fields = {
        name: values.name,
        description: values.description,
        category,
        defaultEnabled: values.defaultEnabled,
        minPlanTier: values.minPlanTier,
      };

      dispatch(actions.setSubmitting(true));
      try {
        if (dialog.kind === "create") {
          await createFeatureApi({ featureKey: values.featureKey, ...fields });
          toast.success(`Added ${values.name} to the catalog.`);
        } else {
          await updateFeatureApi(dialog.feature.featureKey, fields);
          toast.success(`Saved ${values.name}.`);
        }
        dispatch(actions.setDialog(null));
        await load();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
        return false;
      } finally {
        dispatch(actions.setSubmitting(false));
      }
    },
    [state.dialog, toast, load],
  );

  const toggleDefault = useCallback(
    async (feature: FeatureFlag, enabled: boolean) => {
      dispatch(actions.setToggling(feature.featureKey));
      try {
        await updateFeatureApi(feature.featureKey, { defaultEnabled: enabled });
        toast.success(
          `${feature.name} is now ${enabled ? "on" : "off"} by default for new organizations.`,
        );
        await load();
      } catch (err) {
        toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
      } finally {
        dispatch(actions.setToggling(null));
      }
    },
    [toast, load],
  );

  const deleteFeature = useCallback(async () => {
    const dialog = state.dialog;
    if (dialog?.kind !== "delete") return;
    dispatch(actions.setSubmitting(true));
    try {
      const result = await deleteFeatureApi(dialog.feature.featureKey);
      toast.success(
        result.removedOrganizationSettings > 0
          ? `Deleted ${result.name} and cleared it from ${result.removedOrganizationSettings} organization${result.removedOrganizationSettings === 1 ? "" : "s"}.`
          : `Deleted ${result.name}.`,
      );
      dispatch(actions.setDialog(null));
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
    } finally {
      dispatch(actions.setSubmitting(false));
    }
  }, [state.dialog, toast, load]);

  const importDefaults = useCallback(async () => {
    dispatch(actions.setImporting(true));
    try {
      const result = await importDefaultsApi();
      toast.success(
        result.imported > 0
          ? `Imported ${result.imported} built-in feature${result.imported === 1 ? "" : "s"}.`
          : "The catalog already has every built-in feature.",
      );
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, FALLBACK_ERROR));
    } finally {
      dispatch(actions.setImporting(false));
    }
  }, [toast, load]);

  const features = state.overview?.features;

  const visibleFeatures = useMemo(() => {
    const term = state.search.trim().toLowerCase();
    return (features ?? []).filter(
      (f) =>
        (state.category === ALL_CATEGORIES || f.category === state.category) &&
        (!term ||
          f.featureKey.includes(term) ||
          f.name.toLowerCase().includes(term) ||
          (f.description ?? "").toLowerCase().includes(term)),
    );
  }, [features, state.category, state.search]);

  const categoryOptions = useMemo(
    () =>
      [
        ...new Set([
          DEFAULT_CATEGORY,
          ...(features ?? []).map((f) => f.category),
        ]),
      ].sort((a, b) => a.localeCompare(b)),
    [features],
  );

  const value: FeatureFlagsContextType = {
    state,
    dispatch,
    overview: state.overview,
    loadError: state.loadError,
    refreshing: state.refreshing,
    category: state.category,
    search: state.search,
    dialog: state.dialog,
    submitting: state.submitting,
    togglingKey: state.togglingKey,
    importing: state.importing,
    visibleFeatures,
    categoryOptions,
    canManage,
    setCategory,
    setSearch,
    openCreate,
    openEdit,
    openDelete,
    closeDialog,
    refresh,
    saveFeature,
    toggleDefault,
    deleteFeature,
    importDefaults,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlagsContext(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsContext must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}
