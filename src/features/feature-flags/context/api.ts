import type React from "react";
import { api, ApiError } from "@/lib/api";
import type {
  CreateFeatureRequest,
  DeleteFeatureResponse,
  FeatureFlag,
  FeatureFlagsAction,
  FeatureFlagsOverview,
  ImportDefaultsResponse,
  UpdateFeatureRequest,
} from "../types";
import { loadFailure, loadSuccess } from "./action";

export function getApiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

/** GET /feature-flags → catalog + adoption + summary, dispatched into context. */
export async function loadFeatureFlagsApi(
  dispatch: React.Dispatch<FeatureFlagsAction>,
): Promise<void> {
  try {
    dispatch(
      loadSuccess(await api.get<FeatureFlagsOverview>("/feature-flags")),
    );
  } catch (err) {
    dispatch(
      loadFailure(
        getApiErrorMessage(err, "Couldn't load the feature catalog."),
      ),
    );
  }
}

export function createFeatureApi(body: CreateFeatureRequest) {
  return api.post<FeatureFlag>("/feature-flags", body);
}

export function updateFeatureApi(
  featureKey: string,
  body: UpdateFeatureRequest,
) {
  return api.patch<FeatureFlag>(
    `/feature-flags/${encodeURIComponent(featureKey)}`,
    body,
  );
}

export function deleteFeatureApi(featureKey: string) {
  return api.delete<DeleteFeatureResponse>(
    `/feature-flags/${encodeURIComponent(featureKey)}`,
  );
}

export function importDefaultsApi() {
  return api.post<ImportDefaultsResponse>("/feature-flags/import-defaults");
}
