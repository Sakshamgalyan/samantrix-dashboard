import { dashboardApi } from "@/store";
import type { PageQueryParams, Paginated } from "@/features/common/pagination";
import type { OrgRole } from "@/types/dashboard";
import type {
  TeamMemberRecord,
  InviteMemberRequest,
  InviteMemberResponse,
  AddMemberRequest,
  AddMemberResponse,
} from "@/features/users/types/api";

/**
 * The signed-in organization's team. All workspace endpoints use `/organizations/current/*`.
 * Members are paginated on the server: the Users page and the organization overview both pass
 * `pageParams(page, filters)`, so page 1 without filters is one shared cache entry.
 * Counts (seats, active, suspended, pending invites) come from the analytics overview.
 */
export const orgTeamApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** One page of members; `search` (name, email, department), `role`, `status`. */
    getOrgMembers: build.query<Paginated<TeamMemberRecord>, PageQueryParams>({
      query: (params) => ({ url: "/organizations/current/members", params }),
      providesTags: ["OrgMembers"],
    }),

    updateOrgMemberRole: build.mutation<void, { memberId: string; role: OrgRole }>({
      query: ({ memberId, role }) => ({
        url: `/organizations/current/members/${encodeURIComponent(memberId)}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["OrgMembers", "Analytics"],
    }),

    updateOrgMemberStatus: build.mutation<void, { memberId: string; status: string }>({
      query: ({ memberId, status }) => ({
        url: `/organizations/current/members/${encodeURIComponent(memberId)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["OrgMembers", "Analytics"],
    }),

    removeOrgMember: build.mutation<void, string>({
      query: (memberId) => ({
        url: `/organizations/current/members/${encodeURIComponent(memberId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrgMembers", "Analytics"],
    }),

    /** Creates an invitation; the pending-invites count lives in the analytics overview. */
    inviteOrgMember: build.mutation<InviteMemberResponse | null, InviteMemberRequest>({
      query: (body) => ({ url: "/organizations/current/members/invite", method: "POST", body }),
      invalidatesTags: ["OrgInvitations", "Analytics"],
    }),

    /** Directly creates a team member in the organization. */
    addOrgMember: build.mutation<AddMemberResponse, AddMemberRequest>({
      query: (body) => ({ url: "/organizations/current/members", method: "POST", body }),
      invalidatesTags: ["OrgMembers", "Analytics"],
    }),
  }),
});

export const {
  useGetOrgMembersQuery,
  useUpdateOrgMemberRoleMutation,
  useUpdateOrgMemberStatusMutation,
  useRemoveOrgMemberMutation,
  useInviteOrgMemberMutation,
  useAddOrgMemberMutation,
} = orgTeamApi;
