"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth, type LoginPortal } from "./auth-context";
import { getHomePath } from "@/lib/home-path";
import type {
  AuthMode,
  AuthPageContextType,
  LoginFormValues,
  TwoFactorFormValues,
  OrgRegistrationFormValues,
} from "../types";
import { initialAuthState, authReducer } from "./reducer";
import * as actions from "./action";
import {
  loginApi,
  verify2FAApi,
  generate2FASecretApi,
  registerOrganizationApi,
  revokeBlockingSessionApi,
  setLoginPortalApi,
  abandonSignInApi,
  getApiErrorMessage,
} from "./api";

const AuthPageContext = createContext<AuthPageContextType | undefined>(
  undefined,
);

export function AuthPageProvider({
  children,
  initialMode = "login",
}: {
  children: React.ReactNode;
  initialMode?: AuthMode;
}) {
  const router = useRouter();
  const { refreshSession, isAuthenticated, user } = useAuth();

  // Unified state managed completely via useReducer (no useState!)
  const [state, dispatch] = useReducer(authReducer, {
    ...initialAuthState,
    authMode: initialMode,
  });

  // Replays the last sign-in attempt (password or 2FA step) once a blocking device is signed out
  const retrySignInRef = useRef<(() => Promise<boolean>) | null>(null);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(getHomePath(user));
    }
  }, [isAuthenticated, user, router]);

  // Action dispatch helpers
  const setAuthMode = useCallback((mode: AuthMode) => {
    dispatch(actions.setAuthMode(mode));
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch(actions.setStep(step));
  }, []);

  const setError = useCallback((err: string | null) => {
    dispatch(actions.setError(err));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch(actions.setLoading(loading));
  }, []);

  const setShowPassword = useCallback((show: boolean) => {
    dispatch(actions.setShowPassword(show));
  }, []);

  const setShowConfirmPassword = useCallback((show: boolean) => {
    dispatch(actions.setShowConfirmPassword(show));
  }, []);

  const setRememberWorkstation = useCallback((remember: boolean) => {
    dispatch(actions.setRememberWorkstation(remember));
  }, []);

  const setRequires2FA = useCallback(
    (req: boolean, tempToken?: string | null) => {
      dispatch(actions.setRequires2FA(req, tempToken));
    },
    [],
  );

  const setIsBackupCodeMode = useCallback((mode: boolean) => {
    dispatch(actions.setIsBackupCodeMode(mode));
  }, []);

  const setTotpLoading = useCallback((loading: boolean) => {
    dispatch(actions.setTotpLoading(loading));
  }, []);

  const setCopiedKey = useCallback((copied: boolean) => {
    dispatch(actions.setCopiedKey(copied));
  }, []);

  const setBackupCodes = useCallback((codes: string[] | null) => {
    dispatch(actions.setBackupCodes(codes));
  }, []);

  const setAcknowledgedBackup = useCallback((ack: boolean) => {
    dispatch(actions.setAcknowledgedBackup(ack));
  }, []);

  const setCopiedAllCodes = useCallback((copied: boolean) => {
    dispatch(actions.setCopiedAllCodes(copied));
  }, []);

  const resetToLogin = useCallback(() => {
    dispatch(actions.resetToLogin());
  }, []);

  const enterDashboard = useCallback(async () => {
    router.push(getHomePath(await refreshSession()));
  }, [refreshSession, router]);

  // API Call Handlers that dispatch directly into context state
  const handleLogin = useCallback(
    async (values: LoginFormValues): Promise<boolean> => {
      retrySignInRef.current = () => loginApi(values, dispatch, enterDashboard);
      return retrySignInRef.current();
    },
    [enterDashboard],
  );

  const handle2FASubmit = useCallback(
    async (values: TwoFactorFormValues): Promise<boolean> => {
      if (!state.tempToken) {
        dispatch(
          actions.setError(
            "Authentication session expired. Please sign in again.",
          ),
        );
        dispatch(actions.setRequires2FA(false, null));
        return false;
      }

      const payload = { ...values, tempToken: state.tempToken };
      retrySignInRef.current = () => verify2FAApi(payload, dispatch, enterDashboard);
      return retrySignInRef.current();
    },
    [state.tempToken, enterDashboard],
  );

  const handleRevokeBlockingSession = useCallback(
    async (sessionId: string): Promise<void> => {
      const conflict = state.sessionConflict;
      if (!conflict) return;

      dispatch(actions.patchSessionConflict({ revokingId: sessionId, error: null }));
      try {
        await revokeBlockingSessionApi(sessionId, conflict.challengeToken);
      } catch (err) {
        dispatch(
          actions.patchSessionConflict({
            revokingId: null,
            error: getApiErrorMessage(err, "Could not sign out that device. Please try again."),
          }),
        );
        return;
      }

      const remaining = conflict.sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        dispatch(actions.patchSessionConflict({ sessions: remaining, revokingId: null }));
        return;
      }

      dispatch(actions.setSessionConflict(null));
      await retrySignInRef.current?.();
    },
    [state.sessionConflict],
  );

  const dismissSessionConflict = useCallback(() => {
    dispatch(actions.setSessionConflict(null));
  }, []);

  const handleSelectPortal = useCallback(
    async (portal: LoginPortal): Promise<void> => {
      dispatch(actions.patchPortalSelection({ submitting: portal, error: null }));
      try {
        await setLoginPortalApi(portal);
      } catch (err) {
        dispatch(
          actions.patchPortalSelection({
            submitting: null,
            error: getApiErrorMessage(err, "Could not open that console. Please try again."),
          }),
        );
        return;
      }
      // Leave the picker up while the dashboard loads
      await enterDashboard();
    },
    [enterDashboard],
  );

  const cancelPortalSelection = useCallback(async (): Promise<void> => {
    await abandonSignInApi();
    retrySignInRef.current = null;
    dispatch(actions.resetToLogin());
  }, []);

  const fetch2FASecret = useCallback(
    async (email?: string): Promise<void> => {
      await generate2FASecretApi(email || "admin@organization.com", dispatch);
    },
    [],
  );

  const handleToggle2FA = useCallback(
    async (enable: boolean, currentEmail?: string): Promise<void> => {
      if (enable && !state.twoFactorSecret) {
        await fetch2FASecret(currentEmail);
      }
    },
    [state.twoFactorSecret, fetch2FASecret],
  );

  const handleOrgSubmit = useCallback(
    async (values: OrgRegistrationFormValues): Promise<boolean> => {
      return registerOrganizationApi(values, dispatch, enterDashboard);
    },
    [enterDashboard],
  );

  const contextValue = useMemo<AuthPageContextType>(
    () => ({
      state,
      dispatch,

      // Direct state accessors
      authMode: state.authMode,
      step: state.step,
      loading: state.loading,
      error: state.error,
      showPassword: state.showPassword,
      showConfirmPassword: state.showConfirmPassword,
      rememberWorkstation: state.rememberWorkstation,
      requires2FA: state.requires2FA,
      tempToken: state.tempToken,
      isBackupCodeMode: state.isBackupCodeMode,
      totpLoading: state.totpLoading,
      twoFactorSecret: state.twoFactorSecret,
      qrCodeDataUrl: state.qrCodeDataUrl,
      copiedKey: state.copiedKey,
      backupCodes: state.backupCodes,
      acknowledgedBackup: state.acknowledgedBackup,
      copiedAllCodes: state.copiedAllCodes,
      apiResponse: state.apiResponse,
      sessionConflict: state.sessionConflict,
      portalSelection: state.portalSelection,

      // Actions
      setAuthMode,
      setStep,
      setError,
      setLoading,
      setShowPassword,
      setShowConfirmPassword,
      setRememberWorkstation,
      setRequires2FA,
      setIsBackupCodeMode,
      setTotpLoading,
      setCopiedKey,
      setBackupCodes,
      setAcknowledgedBackup,
      setCopiedAllCodes,
      resetToLogin,

      // API Handlers
      handleLogin,
      handle2FASubmit,
      fetch2FASecret,
      handleToggle2FA,
      handleOrgSubmit,
      handleRevokeBlockingSession,
      dismissSessionConflict,
      handleSelectPortal,
      cancelPortalSelection,
    }),
    [
      state,
      setAuthMode,
      setStep,
      setError,
      setLoading,
      setShowPassword,
      setShowConfirmPassword,
      setRememberWorkstation,
      setRequires2FA,
      setIsBackupCodeMode,
      setTotpLoading,
      setCopiedKey,
      setBackupCodes,
      setAcknowledgedBackup,
      setCopiedAllCodes,
      resetToLogin,
      handleLogin,
      handle2FASubmit,
      fetch2FASecret,
      handleToggle2FA,
      handleOrgSubmit,
      handleRevokeBlockingSession,
      dismissSessionConflict,
      handleSelectPortal,
      cancelPortalSelection,
    ],
  );

  return (
    <AuthPageContext.Provider value={contextValue}>
      {children}
    </AuthPageContext.Provider>
  );
}

export function useAuthPageContext(): AuthPageContextType {
  const context = useContext(AuthPageContext);
  if (!context) {
    throw new Error(
      "useAuthPageContext must be used within an AuthPageProvider",
    );
  }
  return context;
}

export * from "./reducer";
export * from "./action";
export * from "./api";
export * from "./auth-context";
