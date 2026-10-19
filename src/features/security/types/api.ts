export interface PolicyFormState {
  requireTwoFactor: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordExpiresDays: number;
  allowedEmailDomains: string[];
  newDomain: string;
}

export interface TwoFactorSetupResponse {
  secret?: string;
  qrCodeDataUrl?: string;
}

export interface TwoFactorEnableResponse {
  backupCodes?: string[];
}

export interface UpdateSecurityRequest {
  requireTwoFactor: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordExpiresDays: number;
  allowedEmailDomains: string[];
}
