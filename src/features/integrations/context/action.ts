import type { OrgApiKeyRow } from "@/features/integrations/types/api";
import type { IntegrationsAction } from "@/features/integrations/types/actions";
import type { IntegrationsSectionTab } from "@/features/integrations/types/state";

export const setIntegrationsPageAction = (payload: number): IntegrationsAction => ({
  type: "SET_PAGE",
  payload,
});

export const openCreateModalAction = (): IntegrationsAction => ({
  type: "OPEN_CREATE_MODAL",
});

export const closeCreateModalAction = (): IntegrationsAction => ({
  type: "CLOSE_CREATE_MODAL",
});

export const setCreateOpenAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_CREATE_OPEN",
  payload,
});

export const setKeyNameAction = (payload: string): IntegrationsAction => ({
  type: "SET_KEY_NAME",
  payload,
});

export const setCreatingAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_CREATING",
  payload,
});

export const setNewKeySecretAction = (payload: string | null): IntegrationsAction => ({
  type: "SET_NEW_KEY_SECRET",
  payload,
});

export const setCopiedKeyAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_COPIED_KEY",
  payload,
});

export const setRevokeTargetAction = (payload: OrgApiKeyRow | null): IntegrationsAction => ({
  type: "SET_REVOKE_TARGET",
  payload,
});

export const setRevokingAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_REVOKING",
  payload,
});

export const setActionErrorAction = (payload: string | null): IntegrationsAction => ({
  type: "SET_ACTION_ERROR",
  payload,
});

export const setDeleteRepoTargetAction = (payload: string | null): IntegrationsAction => ({
  type: "SET_DELETE_REPO_TARGET",
  payload,
});

export const setDeletingRepoAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_DELETING_REPO",
  payload,
});

export const setShowSecretAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_SHOW_SECRET",
  payload,
});

export const setCopiedWebhookAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_COPIED_WEBHOOK",
  payload,
});

export const setCopiedSecretAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_COPIED_SECRET",
  payload,
});

export const setConfirmRotateOpenAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_CONFIRM_ROTATE_OPEN",
  payload,
});

export const setRotatingSecretAction = (payload: boolean): IntegrationsAction => ({
  type: "SET_ROTATING_SECRET",
  payload,
});

export const setActiveTabAction = (payload: IntegrationsSectionTab): IntegrationsAction => ({
  type: "SET_ACTIVE_TAB",
  payload,
});
