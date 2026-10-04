import type { LoginPortal } from "../context/auth-context";

export type AuthMode = "login" | "register-org" | "forgot-password";

/** A session that blocks this sign-in (the account allows one signed-in device). */
export interface ActiveSessionInfo {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  loginAs: LoginPortal | null;
  loginAt: string;
  lastSeenAt: string;
}

/** 409 ACTIVE_SESSION_EXISTS from /auth/login or /auth/2fa/verify. */
export interface SessionConflict {
  challengeToken: string;
  sessions: ActiveSessionInfo[];
  revokingId: string | null;
  error: string | null;
}

/** Developer signed in and must pick the console to open. */
export interface PortalSelection {
  organizationName: string | null;
  submitting: LoginPortal | null;
  error: string | null;
}

export interface AuthPageState {
  // Navigation & Screen Mode
  authMode: AuthMode;
  step: number;

  // Global Status
  loading: boolean;
  error: string | null;

  // UI Toggles
  showPassword: boolean;
  showConfirmPassword: boolean;
  rememberWorkstation: boolean;

  // 2FA Challenge (Login Flow)
  requires2FA: boolean;
  tempToken: string | null;
  isBackupCodeMode: boolean;

  // TOTP Enclave & Provisioning (Registration Flow)
  totpLoading: boolean;
  twoFactorSecret: string | null;
  qrCodeDataUrl: string | null;
  copiedKey: boolean;

  // Post-Registration Recovery States
  backupCodes: string[] | null;
  acknowledgedBackup: boolean;
  copiedAllCodes: boolean;

  // Single-device sign-in: another device holds the session
  sessionConflict: SessionConflict | null;

  // Developer console choice after authentication
  portalSelection: PortalSelection | null;

  // Backend API Response storage
  apiResponse: Record<string, unknown> | null;
}
