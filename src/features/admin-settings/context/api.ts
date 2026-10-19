import { dashboardApi } from "@/store";
import type {
  CreateSettingPayload,
  PlatformSetting,
  PlatformSettingsResponse,
  RemoveSettingResult,
  UpdateSettingPayload,
} from "@/features/admin-settings/types/api";

const settingPath = (key: string) =>
  `/platform-settings/${encodeURIComponent(key)}`;

/** Platform-wide configuration (built-in defaults included, secrets masked). */
export const platformSettingsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getPlatformSettings: build.query<PlatformSettingsResponse, void>({
      query: () => "/platform-settings",
      providesTags: ["PlatformSettings"],
    }),

    createPlatformSetting: build.mutation<PlatformSetting, CreateSettingPayload>({
      query: (body) => ({ url: "/platform-settings", method: "POST", body }),
      invalidatesTags: ["PlatformSettings"],
    }),

    updatePlatformSetting: build.mutation<
      PlatformSetting,
      { key: string; body: UpdateSettingPayload }
    >({
      query: ({ key, body }) => ({ url: settingPath(key), method: "PATCH", body }),
      // Show the saved row straight away (its draft is cleared); the invalidation refreshes the summary
      async onQueryStarted({ key }, { dispatch, queryFulfilled }) {
        try {
          const { data: saved } = await queryFulfilled;
          if (!saved || saved.key !== key) return;
          dispatch(
            platformSettingsApi.util.updateQueryData("getPlatformSettings", undefined, (draft) => {
              for (const group of draft.categories) {
                const i = group.settings.findIndex((s) => s.key === key);
                // A category change moves the row; leave that to the refetch
                if (i >= 0 && group.category === saved.category) group.settings[i] = saved;
              }
            }),
          );
        } catch {
          // The caller shows the error
        }
      },
      invalidatesTags: ["PlatformSettings"],
    }),

    /** Deletes a custom setting, or resets a built-in one to its default. */
    removePlatformSetting: build.mutation<RemoveSettingResult, string>({
      query: (key) => ({ url: settingPath(key), method: "DELETE" }),
      invalidatesTags: ["PlatformSettings"],
    }),
  }),
});

export const {
  useGetPlatformSettingsQuery,
  useCreatePlatformSettingMutation,
  useUpdatePlatformSettingMutation,
  useRemovePlatformSettingMutation,
} = platformSettingsApi;
