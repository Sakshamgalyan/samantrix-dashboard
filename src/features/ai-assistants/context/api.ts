import { dashboardApi } from "@/store";
import type {
  OrgAiAssistant,
  CreateAiAssistantPayload,
  UpdateAiAssistantPayload,
} from "../types/api";

export const aiAssistantsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgAiAssistants: build.query<OrgAiAssistant[], void>({
      query: () => "/organizations/current/ai-assistants",
      transformResponse: (res: OrgAiAssistant[] | null) => res || [],
      providesTags: ["OrgAiAssistants"],
    }),

    createOrgAiAssistant: build.mutation<
      OrgAiAssistant,
      CreateAiAssistantPayload
    >({
      query: (body) => ({
        url: "/organizations/current/ai-assistants",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrgAiAssistants", "Analytics"],
    }),

    updateOrgAiAssistant: build.mutation<
      OrgAiAssistant,
      { assistantId: string; data: UpdateAiAssistantPayload }
    >({
      query: ({ assistantId, data }) => ({
        url: `/organizations/current/ai-assistants/${encodeURIComponent(assistantId)}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["OrgAiAssistants"],
    }),

    toggleOrgAiAssistant: build.mutation<
      OrgAiAssistant,
      { assistantId: string; isEnabled: boolean }
    >({
      query: ({ assistantId, isEnabled }) => ({
        url: `/organizations/current/ai-assistants/${encodeURIComponent(assistantId)}/toggle`,
        method: "PATCH",
        body: { isEnabled },
      }),
      async onQueryStarted({ assistantId, isEnabled }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            aiAssistantsApi.util.updateQueryData(
              "getOrgAiAssistants",
              undefined,
              (draft) => {
                const bot = draft.find((b) => b.id === assistantId);
                if (bot) bot.isEnabled = isEnabled;
              },
            ),
          );
        } catch {
          // Fallback handled by caller
        }
      },
      invalidatesTags: ["OrgAiAssistants"],
    }),

    deleteOrgAiAssistant: build.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (assistantId) => ({
        url: `/organizations/current/ai-assistants/${encodeURIComponent(assistantId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrgAiAssistants", "Analytics"],
    }),
  }),
});

export const {
  useGetOrgAiAssistantsQuery,
  useCreateOrgAiAssistantMutation,
  useUpdateOrgAiAssistantMutation,
  useToggleOrgAiAssistantMutation,
  useDeleteOrgAiAssistantMutation,
} = aiAssistantsApi;
