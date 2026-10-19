import type { AuthPageState } from "@/features/auth/types/state";
import type { AuthAction } from "@/features/auth/types/actions";

export const initialAuthState: AuthPageState = {
  authMode: "login",
  step: 1,
  loading: false,
  error: null,
  showPassword: false,
  showConfirmPassword: false,
  rememberWorkstation: true,
  requires2FA: false,
  tempToken: null,
  isBackupCodeMode: false,
  totpLoading: false,
  twoFactorSecret: null,
  qrCodeDataUrl: null,
  copiedKey: false,
  backupCodes: null,
  acknowledgedBackup: false,
  copiedAllCodes: false,
  sessionConflict: null,
  portalSelection: null,
  apiResponse: null,
};

export const authReducer = (
  state: AuthPageState,
  action: AuthAction,
): AuthPageState => {
  switch (action.type) {
    case "SET_AUTH_MODE":
      return {
        ...state,
        authMode: action.payload,
        step: 1,
        error: null,
      };

    case "SET_STEP":
      return {
        ...state,
        step: action.payload,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "SET_SHOW_PASSWORD":
      return {
        ...state,
        showPassword: action.payload,
      };

    case "SET_SHOW_CONFIRM_PASSWORD":
      return {
        ...state,
        showConfirmPassword: action.payload,
      };

    case "SET_REMEMBER_WORKSTATION":
      return {
        ...state,
        rememberWorkstation: action.payload,
      };

    case "SET_REQUIRES_2FA":
      return {
        ...state,
        requires2FA: action.payload.requires2FA,
        tempToken: action.payload.tempToken ?? null,
        error: null,
        loading: false,
      };

    case "SET_IS_BACKUP_CODE_MODE":
      return {
        ...state,
        isBackupCodeMode: action.payload,
      };

    case "SET_TOTP_LOADING":
      return {
        ...state,
        totpLoading: action.payload,
      };

    case "SET_TOTP_SECRET":
      return {
        ...state,
        twoFactorSecret: action.payload.secret,
        qrCodeDataUrl: action.payload.qrCodeDataUrl ?? null,
        totpLoading: false,
      };

    case "SET_COPIED_KEY":
      return {
        ...state,
        copiedKey: action.payload,
      };

    case "SET_BACKUP_CODES":
      return {
        ...state,
        backupCodes: action.payload,
        loading: false,
      };

    case "SET_ACKNOWLEDGED_BACKUP":
      return {
        ...state,
        acknowledgedBackup: action.payload,
      };

    case "SET_COPIED_ALL_CODES":
      return {
        ...state,
        copiedAllCodes: action.payload,
      };

    case "SET_API_RESPONSE":
      return {
        ...state,
        apiResponse: action.payload,
      };

    case "SET_SESSION_CONFLICT":
      return {
        ...state,
        sessionConflict: action.payload,
        loading: false,
      };

    case "PATCH_SESSION_CONFLICT":
      return state.sessionConflict
        ? { ...state, sessionConflict: { ...state.sessionConflict, ...action.payload } }
        : state;

    case "SET_PORTAL_SELECTION":
      return {
        ...state,
        portalSelection: action.payload,
        loading: false,
      };

    case "PATCH_PORTAL_SELECTION":
      return state.portalSelection
        ? { ...state, portalSelection: { ...state.portalSelection, ...action.payload } }
        : state;

    case "RESET_TO_LOGIN":
      return {
        ...initialAuthState,
        authMode: "login",
      };

    default:
      return state;
  }
};
