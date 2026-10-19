import { dashboardApi } from "@/store";
import type { PageQueryParams, Paginated } from "@/features/common/pagination";
import type {
  OrgApiKeyRow,
  CreateApiKeyResponse,
  GitHubOrgIntegrationResponse,
} from "@/features/integrations/types/api";

/** The signed-in organization's API keys and GitHub sync settings. */
export const integrationsApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgApiKeys: build.query<Paginated<OrgApiKeyRow>, PageQueryParams>({
      query: (params) => ({ url: "/organizations/current/api-keys", params }),
      providesTags: ["Integrations"],
    }),

    createOrgApiKey: build.mutation<
      CreateApiKeyResponse | null,
      { name: string; permissions: string[] }
    >({
      query: (body) => ({
        url: "/organizations/current/api-keys",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Integrations"],
    }),

    revokeOrgApiKey: build.mutation<void, string>({
      query: (keyId) => ({
        url: `/organizations/current/api-keys/${encodeURIComponent(keyId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Integrations"],
    }),

    getGitHubOrgIntegration: build.query<
      GitHubOrgIntegrationResponse,
      string | void
    >({
      query: (orgId) => ({
        url: "/github/org-integration",
        params: orgId ? { organizationId: orgId } : undefined,
      }),
      providesTags: ["Integrations"],
    }),

    updateGitHubOrgIntegration: build.mutation<
      GitHubOrgIntegrationResponse,
      {
        allowedRepoUrls: string[];
        rotateSecret?: boolean;
        organizationId?: string;
      }
    >({
      query: (body) => ({
        url: "/github/org-integration",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Integrations"],
    }),
  }),
});

export const {
  useGetOrgApiKeysQuery,
  useCreateOrgApiKeyMutation,
  useRevokeOrgApiKeyMutation,
  useGetGitHubOrgIntegrationQuery,
  useUpdateGitHubOrgIntegrationMutation,
} = integrationsApi;
