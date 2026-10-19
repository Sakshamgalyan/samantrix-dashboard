import { dashboardApi } from "@/store";
import type { QueueMetrics } from "../types";

export const queuesApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getQueueMetrics: build.query<QueueMetrics[], void>({
      query: () => "/queues/metrics",
      providesTags: ["Queues"],
    }),

    pauseQueue: build.mutation<{ status: string; message: string }, string>({
      query: (name) => ({
        url: `/queues/${encodeURIComponent(name)}/pause`,
        method: "POST",
      }),
      invalidatesTags: ["Queues"],
    }),

    resumeQueue: build.mutation<{ status: string; message: string }, string>({
      query: (name) => ({
        url: `/queues/${encodeURIComponent(name)}/resume`,
        method: "POST",
      }),
      invalidatesTags: ["Queues"],
    }),

    cleanQueue: build.mutation<
      { status: string; message: string },
      { name: string; status?: "completed" | "failed" }
    >({
      query: ({ name, status = "completed" }) => ({
        url: `/queues/${encodeURIComponent(name)}/clean`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: ["Queues"],
    }),
  }),
});

export const {
  useGetQueueMetricsQuery,
  usePauseQueueMutation,
  useResumeQueueMutation,
  useCleanQueueMutation,
} = queuesApi;
