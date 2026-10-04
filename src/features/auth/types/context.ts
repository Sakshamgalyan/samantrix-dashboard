import type React from "react";
import type { LoginPortal } from "../context/auth-context";
import type { AuthMode, AuthPageState, SessionConflict, PortalSelection } from "./state";
import type { AuthAction } from "./actions";
import type { LoginFormValues, TwoFactorFormValues, OrgRegistrationFormValues } from "./forms";

export interface AuthPageContextType {
  // Direct state container and raw dispatch
  state: AuthPageState;
  dispatch: React.Dispatch<AuthAction>;

  // Direct state accessors
  authMode: AuthMode;
  step: number;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
  rememberWorkstation: boolean;
  requires2FA: boolean;
  tempToken: string | null;
  isBackupCodeMode: boolean;
  totpLoading: boolean;
  twoFactorSecret: string | null;
  qrCodeDataUrl: string | null;
  copiedKey: boolean;
  backupCodes: string[] | null;
  acknowledgedBackup: boolean;
  copiedAllCodes: boolean;
  apiResponse: Record<string, unknown> | null;
  sessionConflict: SessionConflict | null;
  portalSelection: PortalSelection | null;

  // Action helper dispatchers
  setAuthMode: (mode: AuthMode) => void;
  setStep: (step: number) => void;
  setError: (err: string | null) => void;
  setLoading: (loading: boolean) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setRememberWorkstation: (remember: boolean) => void;
  setRequires2FA: (req: boolean, tempToken?: string | null) => void;
  setIsBackupCodeMode: (mode: boolean) => void;
  setTotpLoading: (loading: boolean) => void;
  setCopiedKey: (copied: boolean) => void;
  setBackupCodes: (codes: string[] | null) => void;
  setAcknowledgedBackup: (ack: boolean) => void;
  setCopiedAllCodes: (copied: boolean) => void;
  resetToLogin: () => void;

  // API Call handlers that update and store responses directly into context
  handleLogin: (values: LoginFormValues) => Promise<boolean>;
  handle2FASubmit: (values: TwoFactorFormValues) => Promise<boolean>;
  fetch2FASecret: (email?: string) => Promise<void>;
  handleToggle2FA: (enable: boolean, currentEmail?: string) => Promise<void>;
  handleOrgSubmit: (values: OrgRegistrationFormValues) => Promise<boolean>;

  // Single-device sign-in: sign out the blocking device, then retry the last attempt
  handleRevokeBlockingSession: (sessionId: string) => Promise<void>;
  dismissSessionConflict: () => void;

  // Developer console choice
  handleSelectPortal: (portal: LoginPortal) => Promise<void>;
  cancelPortalSelection: () => Promise<void>;
}
