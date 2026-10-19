import type { AuthMode, SessionConflict, PortalSelection } from "@/features/auth/types/state";

export type AuthAction =
  | { type: "SET_AUTH_MODE"; payload: AuthMode }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SHOW_PASSWORD"; payload: boolean }
  | { type: "SET_SHOW_CONFIRM_PASSWORD"; payload: boolean }
  | { type: "SET_REMEMBER_WORKSTATION"; payload: boolean }
  | { type: "SET_REQUIRES_2FA"; payload: { requires2FA: boolean; tempToken?: string | null } }
  | { type: "SET_IS_BACKUP_CODE_MODE"; payload: boolean }
  | { type: "SET_TOTP_LOADING"; payload: boolean }
  | { type: "SET_TOTP_SECRET"; payload: { secret: string; qrCodeDataUrl?: string | null } }
  | { type: "SET_COPIED_KEY"; payload: boolean }
  | { type: "SET_BACKUP_CODES"; payload: string[] | null }
  | { type: "SET_ACKNOWLEDGED_BACKUP"; payload: boolean }
  | { type: "SET_COPIED_ALL_CODES"; payload: boolean }
  | { type: "SET_API_RESPONSE"; payload: Record<string, unknown> | null }
  | { type: "SET_SESSION_CONFLICT"; payload: SessionConflict | null }
  | { type: "PATCH_SESSION_CONFLICT"; payload: Partial<SessionConflict> }
  | { type: "SET_PORTAL_SELECTION"; payload: PortalSelection | null }
  | { type: "PATCH_PORTAL_SELECTION"; payload: Partial<PortalSelection> }
  | { type: "RESET_TO_LOGIN" };
