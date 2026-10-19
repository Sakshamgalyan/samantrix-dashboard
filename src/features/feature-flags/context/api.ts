import { dashboardApi } from "@/store";
import type {
  CreateFeatureRequest,
  DeleteFeatureResponse,
  FeatureFlag,
  FeatureFlagsOverview,
  ImportDefaultsResponse,
  UpdateFeatureRequest,
} from "@/features/feature-flags/types";

/** A catalog change also changes what each organization's feature list shows. */
const CATALOG_CHANGE_TAGS = ["FeatureFlags", "OrgFeatures"] as const;

/** Feature catalog (developer console). */
export const featureFlagsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** Catalog + adoption across organizations + summary. */
    getFeatureFlags: build.query<FeatureFlagsOverview, void>({
      query: () => "/feature-flags",
      providesTags: ["FeatureFlags"],
    }),

    createFeature: build.mutation<FeatureFlag, CreateFeatureRequest>({
      query: (body) => ({ url: "/feature-flags", method: "POST", body }),
      invalidatesTags: [...CATALOG_CHANGE_TAGS],
    }),

    updateFeature: build.mutation<FeatureFlag, { featureKey: string; body: UpdateFeatureRequest }>({
      query: ({ featureKey, body }) => ({
        url: `/feature-flags/${encodeURIComponent(featureKey)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...CATALOG_CHANGE_TAGS],
    }),

    /** Deletes the feature and clears it from every organization's settings. */
    deleteFeature: build.mutation<DeleteFeatureResponse, string>({
      query: (featureKey) => ({
        url: `/feature-flags/${encodeURIComponent(featureKey)}`,
        method: "DELETE",
      }),
      invalidatesTags: [...CATALOG_CHANGE_TAGS],
    }),

    /** Adds every built-in feature missing from the catalog. */
    importDefaultFeatures: build.mutation<ImportDefaultsResponse, void>({
      query: () => ({ url: "/feature-flags/import-defaults", method: "POST" }),
      invalidatesTags: [...CATALOG_CHANGE_TAGS],
    }),
  }),
});

export const {
  useGetFeatureFlagsQuery,
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useDeleteFeatureMutation,
  useImportDefaultFeaturesMutation,
} = featureFlagsApi;
