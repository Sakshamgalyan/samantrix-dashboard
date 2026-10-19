import { dashboardApi } from "@/store";
import type {
  OrgDepartmentItem,
  DepartmentMember,
  UpdateMemberDepartmentPayload,
} from "../types/api";

export const departmentsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgDepartments: build.query<OrgDepartmentItem[], void>({
      query: () => "/organizations/current/departments",
      transformResponse: (res: OrgDepartmentItem[] | null) => res || [],
      providesTags: ["OrgDepartments"],
    }),

    updateMemberDepartment: build.mutation<
      DepartmentMember,
      { memberId: string; data: UpdateMemberDepartmentPayload }
    >({
      query: ({ memberId, data }) => ({
        url: `/organizations/current/members/${encodeURIComponent(memberId)}/department`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["OrgDepartments", "OrgMembers"],
    }),
  }),
});

export const {
  useGetOrgDepartmentsQuery,
  useUpdateMemberDepartmentMutation,
} = departmentsApi;
