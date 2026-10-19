import { dashboardApi } from "@/store";
import type { BroadcastPayload, RealtimeGatewayStats } from "../types";

export const realtimeGatewayApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getRealtimeGatewayStats: build.query<RealtimeGatewayStats, void>({
      query: () => "/realtime/stats",
      providesTags: ["RealtimeGateway"],
    }),

    broadcastGatewayAnnouncement: build.mutation<
      { success: boolean; broadcastCount: number },
      BroadcastPayload
    >({
      query: (body) => ({
        url: "/realtime/broadcast",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RealtimeGateway"],
    }),
  }),
});

export const {
  useGetRealtimeGatewayStatsQuery,
  useBroadcastGatewayAnnouncementMutation,
} = realtimeGatewayApi;
