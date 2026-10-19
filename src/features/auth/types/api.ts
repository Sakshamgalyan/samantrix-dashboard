export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requires2FA?: boolean;
  tempToken?: string;
  /** Set by the BFF once it has stored the session in httpOnly cookies. */
  authenticated?: boolean;
  user?: Record<string, unknown>;
  error?: string;
}

export interface Verify2FARequest {
  tempToken: string;
  code: string;
}

export interface Verify2FAResponse {
  /** Set by the BFF once it has stored the session in httpOnly cookies. */
  authenticated?: boolean;
  user?: Record<string, unknown>;
  error?: string;
}

export interface GenerateSecretRequest {
  email: string;
}

export interface GenerateSecretResponse {
  secret: string;
  qrCodeDataUrl?: string;
}

export interface RegisterOrgRequest {
  organizationName: string;
  legalName?: string;
  orgType?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  state?: string;
  city?: string;
  website?: string;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;

  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  password: string;

  setup2FA?: boolean;
  twoFactorSecret?: string;
  twoFactorCode?: string;

  termsAccepted: boolean;
  privacyAccepted: boolean;
  communicationOptIn?: boolean;
}

export interface RegisterOrgResponse {
  /** Set by the BFF once it has stored the session in httpOnly cookies. */
  authenticated?: boolean;
  backupCodes?: string[];
  organization?: Record<string, unknown>;
  user?: Record<string, unknown>;
}
