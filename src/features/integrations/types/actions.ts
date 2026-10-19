import type { OrgApiKeyRow } from "@/features/integrations/types/api";
import type { IntegrationsSectionTab } from "@/features/integrations/types/state";

export type IntegrationsAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "CLOSE_CREATE_MODAL" }
  | { type: "SET_CREATE_OPEN"; payload: boolean }
  | { type: "SET_KEY_NAME"; payload: string }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_NEW_KEY_SECRET"; payload: string | null }
  | { type: "SET_COPIED_KEY"; payload: boolean }
  | { type: "SET_REVOKE_TARGET"; payload: OrgApiKeyRow | null }
  | { type: "SET_REVOKING"; payload: boolean }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "SET_DELETE_REPO_TARGET"; payload: string | null }
  | { type: "SET_DELETING_REPO"; payload: boolean }
  | { type: "SET_SHOW_SECRET"; payload: boolean }
  | { type: "SET_COPIED_WEBHOOK"; payload: boolean }
  | { type: "SET_COPIED_SECRET"; payload: boolean }
  | { type: "SET_CONFIRM_ROTATE_OPEN"; payload: boolean }
  | { type: "SET_ROTATING_SECRET"; payload: boolean }
  | { type: "SET_ACTIVE_TAB"; payload: IntegrationsSectionTab };
