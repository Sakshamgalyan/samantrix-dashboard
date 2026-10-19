import type { SecurityAction } from "@/features/security/types/actions";
import type { PolicyFormState } from "@/features/security/types/api";

export const setPolicyForm = (form: PolicyFormState): SecurityAction => ({
  type: "SET_POLICY_FORM",
  payload: form,
});

export const updatePolicyField = <K extends keyof PolicyFormState>(
  field: K,
  value: PolicyFormState[K],
): SecurityAction =>
  ({
    type: "UPDATE_POLICY_FIELD",
    payload: { field, value },
  }) as SecurityAction;

export const setSavingSettings = (saving: boolean): SecurityAction => ({
  type: "SET_SAVING_SETTINGS",
  payload: saving,
});

export const setError = (error: string | null): SecurityAction => ({
  type: "SET_ERROR",
  payload: error,
});

export const open2FASetup = (): SecurityAction => ({
  type: "OPEN_2FA_SETUP",
});

export const close2FASetup = (): SecurityAction => ({
  type: "CLOSE_2FA_SETUP",
});

export const setSetupStep = (step: "SETUP" | "BACKUP"): SecurityAction => ({
  type: "SET_SETUP_STEP",
  payload: step,
});

export const setTotpSecret = (secret: string | null): SecurityAction => ({
  type: "SET_TOTP_SECRET",
  payload: secret,
});

export const setQrCode = (qrCode: string | null): SecurityAction => ({
  type: "SET_QR_CODE",
  payload: qrCode,
});

export const setTotpCode = (code: string): SecurityAction => ({
  type: "SET_TOTP_CODE",
  payload: code,
});

export const setBackupCodes = (codes: string[]): SecurityAction => ({
  type: "SET_BACKUP_CODES",
  payload: codes,
});

export const setTotpLoading = (loading: boolean): SecurityAction => ({
  type: "SET_TOTP_LOADING",
  payload: loading,
});

export const setCopiedSecret = (copied: boolean): SecurityAction => ({
  type: "SET_COPIED_SECRET",
  payload: copied,
});

export const open2FADisable = (): SecurityAction => ({
  type: "OPEN_2FA_DISABLE",
});

export const close2FADisable = (): SecurityAction => ({
  type: "CLOSE_2FA_DISABLE",
});

export const setDisablePassword = (password: string): SecurityAction => ({
  type: "SET_DISABLE_PASSWORD",
  payload: password,
});

export const setDisableLoading = (loading: boolean): SecurityAction => ({
  type: "SET_DISABLE_LOADING",
  payload: loading,
});

export const toggleShowDisablePassword = (): SecurityAction => ({
  type: "TOGGLE_SHOW_DISABLE_PASSWORD",
});
