import type { SecurityState } from "@/features/security/types/state";
import type { SecurityAction } from "@/features/security/types/actions";

export const initialSecurityState: SecurityState = {
  policyForm: {
    requireTwoFactor: false,
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    passwordExpiresDays: 90,
    allowedEmailDomains: [],
    newDomain: "",
  },
  savingSettings: false,
  error: null,

  is2FAModalOpen: false,
  setupStep: "SETUP",
  totpSecret: null,
  qrCodeDataUrl: null,
  totpCode: "",
  backupCodes: [],
  totpLoading: false,
  copiedSecret: false,

  isDisableModalOpen: false,
  disablePassword: "",
  disableLoading: false,
  showDisablePassword: false,
};

export function securityReducer(state: SecurityState, action: SecurityAction): SecurityState {
  switch (action.type) {
    case "SET_POLICY_FORM":
      return {
        ...state,
        policyForm: action.payload,
      };
    case "UPDATE_POLICY_FIELD":
      return {
        ...state,
        policyForm: {
          ...state.policyForm,
          [action.payload.field]: action.payload.value,
        },
      };
    case "SET_SAVING_SETTINGS":
      return {
        ...state,
        savingSettings: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "OPEN_2FA_SETUP":
      return {
        ...state,
        is2FAModalOpen: true,
        setupStep: "SETUP",
        totpCode: "",
        totpSecret: null,
        qrCodeDataUrl: null,
        totpLoading: true,
        error: null,
      };
    case "CLOSE_2FA_SETUP":
      return {
        ...state,
        is2FAModalOpen: false,
        totpSecret: null,
        qrCodeDataUrl: null,
        totpCode: "",
        backupCodes: [],
      };
    case "SET_SETUP_STEP":
      return {
        ...state,
        setupStep: action.payload,
      };
    case "SET_TOTP_SECRET":
      return {
        ...state,
        totpSecret: action.payload,
      };
    case "SET_QR_CODE":
      return {
        ...state,
        qrCodeDataUrl: action.payload,
      };
    case "SET_TOTP_CODE":
      return {
        ...state,
        totpCode: action.payload,
      };
    case "SET_BACKUP_CODES":
      return {
        ...state,
        backupCodes: action.payload,
      };
    case "SET_TOTP_LOADING":
      return {
        ...state,
        totpLoading: action.payload,
      };
    case "SET_COPIED_SECRET":
      return {
        ...state,
        copiedSecret: action.payload,
      };
    case "OPEN_2FA_DISABLE":
      return {
        ...state,
        isDisableModalOpen: true,
        disablePassword: "",
        showDisablePassword: false,
        error: null,
      };
    case "CLOSE_2FA_DISABLE":
      return {
        ...state,
        isDisableModalOpen: false,
        disablePassword: "",
        showDisablePassword: false,
      };
    case "SET_DISABLE_PASSWORD":
      return {
        ...state,
        disablePassword: action.payload,
      };
    case "SET_DISABLE_LOADING":
      return {
        ...state,
        disableLoading: action.payload,
      };
    case "TOGGLE_SHOW_DISABLE_PASSWORD":
      return {
        ...state,
        showDisablePassword: !state.showDisablePassword,
      };
    default:
      return state;
  }
}
