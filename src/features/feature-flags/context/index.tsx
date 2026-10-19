"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import { hasPermission } from "@/utils/roles";
import {
  ALL_CATEGORIES,
  CATEGORY_SUGGESTIONS,
  FALLBACK_ERROR,
} from "@/features/feature-flags/common/constants";
import {
  NEW_CATEGORY,
  type FeatureFlag,
  type FeatureFlagsContextType,
  type FeatureFlagsState,
  type FeatureFormValues,
} from "@/features/feature-flags/types";
import { featureFlagsReducer, initialFeatureFlagsState } from "@/features/feature-flags/context/reducer";
import * as actions from "@/features/feature-flags/context/action";
import {
  useCreateFeatureMutation,
  useDeleteFeatureMutation,
  useGetFeatureFlagsQuery,
  useImportDefaultFeaturesMutation,
  useUpdateFeatureMutation,
} from "@/features/feature-flags/context/api";

const POLLING = {
  pollingInterval: POLL_INTERVAL_MS,
  skipPollingIfUnfocused: true,
} as const;

export const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined,
);

export const FeatureFlagsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [ui, dispatch] = useReducer(
    featureFlagsReducer,
    initialFeatureFlagsState,
  );

  const canManage = hasPermission(user, "features:manage");

  // One cached catalog query, refreshed every minute while the page is open
  const query = useGetFeatureFlagsQuery(undefined, POLLING);
  const { refetch } = query;
  const [createFeature] = useCreateFeatureMutation();
  const [updateFeature] = useUpdateFeatureMutation();
  const [deleteFeatureMutation] = useDeleteFeatureMutation();
  const [importDefaultFeatures] = useImportDefaultFeaturesMutation();

  // Keep the last good catalog on screen; the error only shows when there is nothing cached
  const state = useMemo<FeatureFlagsState>(() => {
    const overview = query.data ?? null;
    const categories = new Set(overview?.features.map((f) => f.category));
    return {
      ...ui,
      overview,
      loadError: query.error
        ? queryErrorMessage(query.error, "Couldn't load the feature catalog.")
        : null,
      // Drop a category tab whose last feature was deleted or moved
      category:
        !overview ||
        ui.category === ALL_CATEGORIES ||
        categories.has(ui.category)
          ? ui.category
          : ALL_CATEGORIES,
    };
  }, [ui, query.data, query.error]);

  const refresh = useCallback(() => {
    dispatch(actions.setRefreshing(true));
    void refetch().finally(() => dispatch(actions.setRefreshing(false)));
  }, [refetch]);

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
        isEnabled: values.isEnabled,
        isBeta: values.isBeta,
        addonPriceMonthly: values.addonPrice ? Number(values.addonPrice) : null,
      };

      dispatch(actions.setSubmitting(true));
      try {
        if (dialog.kind === "create") {
          await createFeature({ featureKey: values.featureKey, ...fields }).unwrap();
          toast.success(`Added ${values.name} to the catalog.`);
        } else {
          await updateFeature({ featureKey: dialog.feature.featureKey, body: fields }).unwrap();
          toast.success(`Saved ${values.name}.`);
        }
        // The mutation invalidates the cached catalog, which refetches it once
        dispatch(actions.setDialog(null));
        return true;
      } catch (err) {
        toast.error(queryErrorMessage(err, FALLBACK_ERROR));
        return false;
      } finally {
        dispatch(actions.setSubmitting(false));
      }
    },
    [state.dialog, toast, createFeature, updateFeature],
  );

  const toggleDefault = useCallback(
    async (feature: FeatureFlag, enabled: boolean) => {
      dispatch(actions.setToggling(feature.featureKey));
      try {
        await updateFeature({
          featureKey: feature.featureKey,
          body: { defaultEnabled: enabled },
        }).unwrap();
        toast.success(
          `${feature.name} is now ${enabled ? "on" : "off"} by default for new organizations.`,
        );
      } catch (err) {
        toast.error(queryErrorMessage(err, FALLBACK_ERROR));
      } finally {
        dispatch(actions.setToggling(null));
      }
    },
    [toast, updateFeature],
  );

  const toggleGlobal = useCallback(
    async (feature: FeatureFlag, enabled: boolean) => {
      dispatch(actions.setToggling(feature.featureKey));
      try {
        await updateFeature({
          featureKey: feature.featureKey,
          body: { isEnabled: enabled },
        }).unwrap();
        toast.success(
          enabled
            ? `${feature.name} is live again.`
            : `${feature.name} is switched off for every organization.`,
        );
      } catch (err) {
        toast.error(queryErrorMessage(err, FALLBACK_ERROR));
      } finally {
        dispatch(actions.setToggling(null));
      }
    },
    [toast, updateFeature],
  );

  const deleteFeature = useCallback(async () => {
    const dialog = state.dialog;
    if (dialog?.kind !== "delete") return;
    dispatch(actions.setSubmitting(true));
    try {
      const result = await deleteFeatureMutation(dialog.feature.featureKey).unwrap();
      toast.success(
        result.removedOrganizationSettings > 0
          ? `Deleted ${result.name} and cleared it from ${result.removedOrganizationSettings} organization${result.removedOrganizationSettings === 1 ? "" : "s"}.`
          : `Deleted ${result.name}.`,
      );
      dispatch(actions.setDialog(null));
    } catch (err) {
      toast.error(queryErrorMessage(err, FALLBACK_ERROR));
    } finally {
      dispatch(actions.setSubmitting(false));
    }
  }, [state.dialog, toast, deleteFeatureMutation]);

  const importDefaults = useCallback(async () => {
    dispatch(actions.setImporting(true));
    try {
      const result = await importDefaultFeatures().unwrap();
      toast.success(
        result.imported > 0
          ? `Imported ${result.imported} built-in feature${result.imported === 1 ? "" : "s"}.`
          : "The catalog already has every built-in feature.",
      );
    } catch (err) {
      toast.error(queryErrorMessage(err, FALLBACK_ERROR));
    } finally {
      dispatch(actions.setImporting(false));
    }
  }, [toast, importDefaultFeatures]);

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

  const groupedFeatures = useMemo(() => {
    const groups = new Map<string, FeatureFlag[]>();
    for (const f of visibleFeatures) {
      groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, list]) => ({ category, features: list }));
  }, [visibleFeatures]);

  const categoryOptions = useMemo(
    () =>
      [
        ...new Set([
          ...CATEGORY_SUGGESTIONS,
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
    groupedFeatures,
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
    toggleGlobal,
    deleteFeature,
    importDefaults,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export const useFeatureFlagsContext = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsContext must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}

export * from "@/features/feature-flags/context/hooks";
