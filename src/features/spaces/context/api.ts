import { dashboardApi } from "@/store";
import type {
  OrgRoomItem,
  CreateRoomPayload,
  UpdateRoomPayload,
  OrgOfficeConfig,
  UpdateOrgOfficePayload,
} from "../types/api";

export const spacesApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgRooms: build.query<OrgRoomItem[], void>({
      query: () => "/organizations/current/rooms",
      transformResponse: (res: OrgRoomItem[] | null) => res || [],
      providesTags: ["OrgRooms"],
    }),

    getOrgOffice: build.query<OrgOfficeConfig, void>({
      query: () => "/organizations/current/office",
      providesTags: ["OrgRooms"],
    }),

    updateOrgOffice: build.mutation<OrgOfficeConfig, UpdateOrgOfficePayload>({
      query: (body) => ({
        url: "/organizations/current/office",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["OrgRooms"],
    }),

    createOrgRoom: build.mutation<OrgRoomItem, CreateRoomPayload>({
      query: (body) => ({
        url: "/organizations/current/rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrgRooms", "Analytics"],
    }),

    updateOrgRoom: build.mutation<
      OrgRoomItem,
      { roomId: string; data: UpdateRoomPayload }
    >({
      query: ({ roomId, data }) => ({
        url: `/organizations/current/rooms/${encodeURIComponent(roomId)}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["OrgRooms"],
    }),

    deleteOrgRoom: build.mutation<{ success: boolean; message: string }, string>({
      query: (roomId) => ({
        url: `/organizations/current/rooms/${encodeURIComponent(roomId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrgRooms", "Analytics"],
    }),
  }),
});

export const {
  useGetOrgRoomsQuery,
  useGetOrgOfficeQuery,
  useUpdateOrgOfficeMutation,
  useCreateOrgRoomMutation,
  useUpdateOrgRoomMutation,
  useDeleteOrgRoomMutation,
} = spacesApi;
