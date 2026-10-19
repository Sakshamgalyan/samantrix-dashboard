import type { Paginated, PageQueryParams } from "@/features/common/pagination";
import { dashboardApi } from "@/store";
import type {
  AdminOrganization,
  AdminOrganizationDetail,
  AdminOrganizationsSummary,
  AssignSubscriptionRequest,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  OrganizationMemberRow,
  OrganizationProfileInput,
  SubscriptionPlan,
  UpdateOrganizationStatusRequest,
  UpdateOrganizationStatusResponse,
} from "@/features/organizations/types";

/** Plan prices rarely change: keep them for an hour and don't refetch them on every open. */
const PLANS_CACHE_SECONDS = 3600;

/** Hook options for the long-lived plan lookup (reuse the cache instead of refetching on mount). */
export const LONG_LIVED_QUERY = { refetchOnMountOrArgChange: false } as const;

/** Tags whose data changes when an organization's status, seats or subscription changes. */
const orgChangeTags = (orgId: string) =>
  [
    "Organizations",
    { type: "OrganizationDetail", id: orgId },
    "PlatformOverview",
    "Payments",
  ] as const;

/**
 * Organizations (developer console). The summary (counts) is shared with the admin overview,
 * and so is the first list page; the detail by id is shared by the detail dialog and the
 * edit-form prefill.
 */
export const organizationsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** Totals by status and plan, new in 30 days, trials ending soon. */
    getAdminOrganizationsSummary: build.query<AdminOrganizationsSummary, void>({
      query: () => "/organizations/admin/summary",
      providesTags: ["Organizations"],
    }),

    /** One page of organizations (`pageParams(page, { status, planTier, search })`). */
    getAdminOrganizations: build.query<Paginated<AdminOrganization>, PageQueryParams>({
      query: (params) => ({ url: "/organizations/admin", params }),
      providesTags: ["Organizations"],
    }),

    /** One page of an organization's members (detail dialog). */
    getOrganizationMembers: build.query<
      Paginated<OrganizationMemberRow>,
      { orgId: string; params: PageQueryParams }
    >({
      query: ({ orgId, params }) => ({
        url: `/organizations/admin/${orgId}/members`,
        params,
      }),
      providesTags: (_result, _error, { orgId }) => [
        { type: "OrganizationDetail", id: orgId },
      ],
    }),

    /** One organization's profile, subscription, counts and recent payments / invoices. */
    getOrganizationDetail: build.query<AdminOrganizationDetail, string>({
      query: (orgId) => `/organizations/admin/${orgId}`,
      providesTags: (_result, _error, orgId) => [
        { type: "OrganizationDetail", id: orgId },
      ],
    }),

    /** Plan price list for the subscription form. */
    getAdminPlans: build.query<SubscriptionPlan[], void>({
      query: () => "/organizations/admin/plans",
      providesTags: ["Plans"],
      keepUnusedDataFor: PLANS_CACHE_SECONDS,
    }),

    /** Activates or suspends an organization. */
    updateOrganizationStatus: build.mutation<
      UpdateOrganizationStatusResponse,
      { orgId: string; body: UpdateOrganizationStatusRequest }
    >({
      query: ({ orgId, body }) => ({
        url: `/organizations/admin/${orgId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { orgId }) => [...orgChangeTags(orgId), "Revenue"],
    }),

    createOrganization: build.mutation<
      CreateOrganizationResponse,
      CreateOrganizationRequest
    >({
      query: (body) => ({ url: "/organizations/admin", method: "POST", body }),
      invalidatesTags: ["Organizations", "PlatformOverview", "Payments", "Revenue"],
    }),

    updateOrganization: build.mutation<
      { id: string; name: string },
      { orgId: string; body: Partial<OrganizationProfileInput> }
    >({
      query: ({ orgId, body }) => ({
        url: `/organizations/admin/${orgId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { orgId }) => orgChangeTags(orgId),
    }),

    /** Sets plan + seat limit and records the amount as a manual payment. */
    assignSubscription: build.mutation<
      { name: string },
      { orgId: string; body: AssignSubscriptionRequest }
    >({
      query: ({ orgId, body }) => ({
        url: `/organizations/admin/${orgId}/subscription`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { orgId }) => [
        ...orgChangeTags(orgId),
        "Revenue",
        "Billing",
      ],
    }),

    /** Soft delete (status DELETED); `hard` deletes permanently (superadmin only). */
    deleteOrganization: build.mutation<
      { name: string; deleted: "soft" | "hard" },
      { orgId: string; hard: boolean }
    >({
      query: ({ orgId, hard }) => ({
        url: `/organizations/admin/${orgId}`,
        method: "DELETE",
        params: hard ? { hard: true } : undefined,
      }),
      // A permanently deleted organization has no detail left to refetch
      invalidatesTags: (_r, _e, { orgId, hard }) =>
        hard
          ? ["Organizations", "PlatformOverview", "Payments", "Revenue"]
          : [...orgChangeTags(orgId), "Revenue"],
    }),
  }),
});

export const {
  useGetAdminOrganizationsSummaryQuery,
  useGetAdminOrganizationsQuery,
  useGetOrganizationMembersQuery,
  useGetOrganizationDetailQuery,
  useLazyGetOrganizationDetailQuery,
  useGetAdminPlansQuery,
  useUpdateOrganizationStatusMutation,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useAssignSubscriptionMutation,
  useDeleteOrganizationMutation,
} = organizationsApi;
