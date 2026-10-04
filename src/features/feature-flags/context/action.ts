import type {
  FeatureDialog,
  FeatureFlagsAction,
  FeatureFlagsOverview,
} from "../types";

export const loadSuccess = (
  overview: FeatureFlagsOverview,
): FeatureFlagsAction => ({ type: "LOAD_SUCCESS", payload: overview });

export const loadFailure = (message: string): FeatureFlagsAction => ({
  type: "LOAD_FAILURE",
  payload: message,
});

export const setRefreshing = (refreshing: boolean): FeatureFlagsAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setCategory = (category: string): FeatureFlagsAction => ({
  type: "SET_CATEGORY",
  payload: category,
});

export const setSearch = (term: string): FeatureFlagsAction => ({
  type: "SET_SEARCH",
  payload: term,
});

export const setDialog = (dialog: FeatureDialog): FeatureFlagsAction => ({
  type: "SET_DIALOG",
  payload: dialog,
});

export const setSubmitting = (submitting: boolean): FeatureFlagsAction => ({
  type: "SET_SUBMITTING",
  payload: submitting,
});

export const setToggling = (featureKey: string | null): FeatureFlagsAction => ({
  type: "SET_TOGGLING",
  payload: featureKey,
});

export const setImporting = (importing: boolean): FeatureFlagsAction => ({
  type: "SET_IMPORTING",
  payload: importing,
});
