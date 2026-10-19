import type { OrgApiKeyRow } from "@/features/integrations/types/api";

export type IntegrationsSectionTab = "all" | "keys" | "github" | "ecosystem";

export interface IntegrationsState {
  page: number;
  isCreateOpen: boolean;
  keyName: string;
  creating: boolean;
  newKeySecret: string | null;
  copiedKey: boolean;
  revokeTarget: OrgApiKeyRow | null;
  revoking: boolean;
  actionError: string | null;
  /** Repository URL targeted for deletion confirmation modal */
  deleteRepoTarget: string | null;
  /** Indicates active repository deletion */
  deletingRepo: boolean;
  /** GitHub card secret reveal toggle */
  showSecret: boolean;
  /** Webhook payload URL copy state */
  copiedWebhook: boolean;
  /** Webhook secret copy state */
  copiedSecret: boolean;
  /** Webhook secret rotate confirmation modal open */
  confirmRotateOpen: boolean;
  /** Webhook secret rotate mutation state */
  rotatingSecret: boolean;
  /** Active UI filter tab */
  activeTab: IntegrationsSectionTab;
}
