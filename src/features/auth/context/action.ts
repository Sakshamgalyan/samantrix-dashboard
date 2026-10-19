import type { AuthAction } from "@/features/auth/types/actions";
import type { AuthMode, SessionConflict, PortalSelection } from "@/features/auth/types/state";

export const setAuthMode = (mode: AuthMode): AuthAction => ({
  type: "SET_AUTH_MODE",
  payload: mode,
});

export const setStep = (step: number): AuthAction => ({
  type: "SET_STEP",
  payload: step,
});

export const setLoading = (loading: boolean): AuthAction => ({
  type: "SET_LOADING",
  payload: loading,
});

export const setError = (error: string | null): AuthAction => ({
  type: "SET_ERROR",
  payload: error,
});

export const setShowPassword = (show: boolean): AuthAction => ({
  type: "SET_SHOW_PASSWORD",
  payload: show,
});

export const setShowConfirmPassword = (show: boolean): AuthAction => ({
  type: "SET_SHOW_CONFIRM_PASSWORD",
  payload: show,
});

export const setRememberWorkstation = (remember: boolean): AuthAction => ({
  type: "SET_REMEMBER_WORKSTATION",
  payload: remember,
});

export const setRequires2FA = (
  requires2FA: boolean,
  tempToken?: string | null,
): AuthAction => ({
  type: "SET_REQUIRES_2FA",
  payload: { requires2FA, tempToken },
});

export const setIsBackupCodeMode = (isBackup: boolean): AuthAction => ({
  type: "SET_IS_BACKUP_CODE_MODE",
  payload: isBackup,
});

export const setTotpLoading = (loading: boolean): AuthAction => ({
  type: "SET_TOTP_LOADING",
  payload: loading,
});

export const setTotpSecret = (
  secret: string,
  qrCodeDataUrl?: string | null,
): AuthAction => ({
  type: "SET_TOTP_SECRET",
  payload: { secret, qrCodeDataUrl },
});

export const setCopiedKey = (copied: boolean): AuthAction => ({
  type: "SET_COPIED_KEY",
  payload: copied,
});

export const setBackupCodes = (codes: string[] | null): AuthAction => ({
  type: "SET_BACKUP_CODES",
  payload: codes,
});

export const setAcknowledgedBackup = (ack: boolean): AuthAction => ({
  type: "SET_ACKNOWLEDGED_BACKUP",
  payload: ack,
});

export const setCopiedAllCodes = (copied: boolean): AuthAction => ({
  type: "SET_COPIED_ALL_CODES",
  payload: copied,
});

export const setApiResponse = (
  response: Record<string, unknown> | null,
): AuthAction => ({
  type: "SET_API_RESPONSE",
  payload: response,
});

export const setSessionConflict = (
  conflict: SessionConflict | null,
): AuthAction => ({
  type: "SET_SESSION_CONFLICT",
  payload: conflict,
});

export const patchSessionConflict = (
  patch: Partial<SessionConflict>,
): AuthAction => ({
  type: "PATCH_SESSION_CONFLICT",
  payload: patch,
});

export const setPortalSelection = (
  selection: PortalSelection | null,
): AuthAction => ({
  type: "SET_PORTAL_SELECTION",
  payload: selection,
});

export const patchPortalSelection = (
  patch: Partial<PortalSelection>,
): AuthAction => ({
  type: "PATCH_PORTAL_SELECTION",
  payload: patch,
});

export const resetToLogin = (): AuthAction => ({
  type: "RESET_TO_LOGIN",
});
