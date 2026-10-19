import { dashboardApi } from "@/store";
import type { OrgFeatureState } from "@/features/features/types/api";

export type { OrgFeatureState };

/** The signed-in organization's feature entitlements and toggles. */
export const orgFeaturesApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgFeatures: build.query<OrgFeatureState[], void>({
      query: () => "/organizations/current/features",
      transformResponse: (res: OrgFeatureState[] | null) => res || [],
      providesTags: ["OrgFeatures"],
    }),

    /** Turns a feature on or off (the backend enforces the plan entitlement). */
    toggleOrgFeature: build.mutation<void, { featureKey: string; isEnabled: boolean }>({
      query: ({ featureKey, isEnabled }) => ({
        url: `/organizations/current/features/${encodeURIComponent(featureKey)}/toggle`,
        method: "PATCH",
        body: { isEnabled },
      }),
      // Flip the toggle as soon as the server accepts it; the invalidation then confirms it
      async onQueryStarted({ featureKey, isEnabled }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            orgFeaturesApi.util.updateQueryData("getOrgFeatures", undefined, (draft) => {
              const row = draft.find(
                (f) => f.key.toLowerCase() === featureKey.toLowerCase(),
              );
              if (row) row.isEnabled = isEnabled;
            }),
          );
        } catch {
          // The caller shows the error
        }
      },
      // The KPI cards count enabled features
      invalidatesTags: ["OrgFeatures", "Analytics"],
    }),
  }),
});

export const { useGetOrgFeaturesQuery, useToggleOrgFeatureMutation } = orgFeaturesApi;
