import { dashboardApi } from "@/store";
import type { EcosystemService } from "../types";

export const ecosystemApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getEcosystemStatus: build.query<EcosystemService[], void>({
      query: () => "/health/ecosystem",
      providesTags: ["Ecosystem"],
    }),
  }),
});

export const { useGetEcosystemStatusQuery } = ecosystemApi;
