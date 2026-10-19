import { dashboardApi } from "@/store";
import type { OrgFleetSession } from "../types/api";

export const fleetApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgFleetSessions: build.query<OrgFleetSession[], void>({
      query: () => "/organizations/current/fleet",
      providesTags: ["OrgFleet"],
    }),

    revokeFleetSession: build.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (sessionId) => ({
        url: `/organizations/current/fleet/sessions/${sessionId}/revoke`,
        method: "POST",
      }),
      invalidatesTags: ["OrgFleet"],
    }),
  }),
});

export const {
  useGetOrgFleetSessionsQuery,
  useRevokeFleetSessionMutation,
} = fleetApi;
