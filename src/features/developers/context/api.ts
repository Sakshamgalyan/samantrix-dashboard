import type { Paginated, PageQueryParams } from "@/features/common/pagination";
import { dashboardApi } from "@/store";
import type {
  CreateDeveloperRequest,
  CreateDeveloperResponse,
  DeveloperAccount,
  DevelopersSummary,
  UpdateDeveloperRequest,
} from "@/features/developers/types";

/**
 * Developer accounts. The counts come from `/auth/developers/summary` (shared by the sidebar
 * badge, the overview and the KPI cards); the table and the approval queue read pages of
 * `/auth/developers`, filtered on the server.
 */
export const developersApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** Status counts and how many developers are online. */
    getDevelopersSummary: build.query<DevelopersSummary, void>({
      query: () => "/users/developers/summary",
      providesTags: ["Developers"],
    }),

    /** One page of developer accounts (`pageParams(page, { status, role, search })`). */
    getDevelopers: build.query<Paginated<DeveloperAccount>, PageQueryParams>({
      query: (params) => ({ url: "/users/developers", params }),
      providesTags: ["Developers"],
    }),

    /** Directly invite / create a new developer (Superadmin or Manager). */
    createDeveloper: build.mutation<
      CreateDeveloperResponse,
      CreateDeveloperRequest
    >({
      query: (body) => ({
        url: "/users/developers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Developers"],
    }),

    /** Approve a pending request or reinstate a rejected developer with a role. */
    approveDeveloper: build.mutation<
      void,
      { id: string; platformRole: string }
    >({
      query: ({ id, platformRole }) => ({
        url: `/users/developers/${id}/approve`,
        method: "PATCH",
        body: { platformRole },
      }),
      invalidatesTags: ["Developers"],
    }),

    /** Reject a pending request (the developer is emailed). */
    rejectDeveloper: build.mutation<void, string>({
      query: (id) => ({
        url: `/users/developers/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Developers"],
    }),

    /** Edit name / phone / role / status; a role change or suspension signs them out. */
    updateDeveloper: build.mutation<
      void,
      { id: string; body: UpdateDeveloperRequest }
    >({
      query: ({ id, body }) => ({
        url: `/users/developers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Developers"],
    }),

    /** Signs the developer out everywhere and deletes the account. */
    deleteDeveloper: build.mutation<void, string>({
      query: (id) => ({ url: `/users/developers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Developers"],
    }),
  }),
});

export const {
  useGetDevelopersSummaryQuery,
  useGetDevelopersQuery,
  useCreateDeveloperMutation,
  useApproveDeveloperMutation,
  useRejectDeveloperMutation,
  useUpdateDeveloperMutation,
  useDeleteDeveloperMutation,
} = developersApi;
