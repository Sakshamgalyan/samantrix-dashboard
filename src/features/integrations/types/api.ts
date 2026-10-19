import type { EcosystemTool } from "@/features/integrations/common/constants";

export type { EcosystemTool };

/** One row of `GET /organizations/current/api-keys` (the secret and hash are never listed). */
export interface OrgApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

/** `POST /organizations/current/api-keys`: the raw `secretKey` is only in this response. */
export interface CreateApiKeyResponse {
  apiKey?: { id: string; name: string; keyPrefix: string };
  secretKey?: string;
}

/** Organization GitHub Multi-Repo Integration response */
export interface GitHubOrgIntegrationResponse {
  id: string;
  organizationId: string;
  allowedRepoUrls: string[];
  webhookSecret: string;
  isActive: boolean;
  createdAt: string;
}
