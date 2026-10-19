import type { PolicyFormState } from "@/features/security/types/api";

export interface SecurityState {
  policyForm: PolicyFormState;
  savingSettings: boolean;
  error: string | null;

  // 2FA Setup
  is2FAModalOpen: boolean;
  setupStep: "SETUP" | "BACKUP";
  totpSecret: string | null;
  qrCodeDataUrl: string | null;
  totpCode: string;
  backupCodes: string[];
  totpLoading: boolean;
  copiedSecret: boolean;

  // 2FA Disable
  isDisableModalOpen: boolean;
  disablePassword: string;
  disableLoading: boolean;
  showDisablePassword: boolean;
}
