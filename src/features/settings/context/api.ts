import { dashboardApi } from "@/store";
import type { OrgSettings } from "@/types/dashboard";
import type {
  UpdateOrgProfileRequest,
  UpdateOrgSettingsRequest,
} from "@/features/settings/types/api";

export type { UpdateOrgProfileRequest, UpdateOrgSettingsRequest };

/**
 * Organization profile and general settings. The profile itself is read from `useAuth().organization`
 * (the auth context loads `/organizations/current` once per session), so only the settings are queried here.
 */
export const orgSettingsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** The backend returns only `{ timezone, locale }`. */
    getOrgSettings: build.query<OrgSettings | null, void>({
      query: () => "/organizations/current/settings",
      providesTags: ["OrgSettings"],
    }),

    updateOrgSettings: build.mutation<void, UpdateOrgSettingsRequest>({
      // The settings DTO accepts timezone and locale only (unknown fields are rejected with 400)
      query: ({ timezone, locale }) => ({
        url: "/organizations/current/settings",
        method: "PATCH",
        body: { timezone, locale },
      }),
      invalidatesTags: ["OrgSettings"],
    }),

    /** Updates the organization profile (or its status); callers refresh the auth session afterwards. */
    updateOrgProfile: build.mutation<void, UpdateOrgProfileRequest>({
      query: (body) => ({ url: "/organizations/current", method: "PATCH", body }),
    }),
  }),
});

export const {
  useGetOrgSettingsQuery,
  useUpdateOrgSettingsMutation,
  useUpdateOrgProfileMutation,
} = orgSettingsApi;
