import type { PolicyFormState } from "@/features/security/types/api";

export type SecurityAction =
  | { type: "SET_POLICY_FORM"; payload: PolicyFormState }
  | {
      type: "UPDATE_POLICY_FIELD";
      payload: { [K in keyof PolicyFormState]: { field: K; value: PolicyFormState[K] } }[keyof PolicyFormState];
    }
  | { type: "SET_SAVING_SETTINGS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "OPEN_2FA_SETUP" }
  | { type: "CLOSE_2FA_SETUP" }
  | { type: "SET_SETUP_STEP"; payload: "SETUP" | "BACKUP" }
  | { type: "SET_TOTP_SECRET"; payload: string | null }
  | { type: "SET_QR_CODE"; payload: string | null }
  | { type: "SET_TOTP_CODE"; payload: string }
  | { type: "SET_BACKUP_CODES"; payload: string[] }
  | { type: "SET_TOTP_LOADING"; payload: boolean }
  | { type: "SET_COPIED_SECRET"; payload: boolean }
  | { type: "OPEN_2FA_DISABLE" }
  | { type: "CLOSE_2FA_DISABLE" }
  | { type: "SET_DISABLE_PASSWORD"; payload: string }
  | { type: "SET_DISABLE_LOADING"; payload: boolean }
  | { type: "TOGGLE_SHOW_DISABLE_PASSWORD" };
