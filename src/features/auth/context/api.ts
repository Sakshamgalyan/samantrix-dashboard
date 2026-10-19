import type React from "react";
import { api, ApiError, isAuthenticatedResponse } from "@/lib/api-client/apiClient";
import type { LoginPortal } from "@/features/auth/context/auth-context";
import type { ActiveSessionInfo } from "@/features/auth/types/state";
import type { AuthAction } from "@/features/auth/types/actions";
import type {
  LoginFormValues,
  TwoFactorFormValues,
  OrgRegistrationFormValues,
} from "@/features/auth/types/forms";
import type { GenerateSecretResponse } from "@/features/auth/types/api";
import {
  setLoading,
  setError,
  setRequires2FA,
  setTotpLoading,
  setTotpSecret,
  setBackupCodes,
  setApiResponse,
  setSessionConflict,
  setPortalSelection,
} from "@/features/auth/context/action";

const ACTIVE_SESSION_EXISTS = "ACTIVE_SESSION_EXISTS";

/**
 * Fields of a login / 2FA / registration response that complete a sign-in. The BFF moves the
 * tokens into httpOnly cookies and answers `authenticated: true` instead.
 */
interface SignInResult {
  authenticated?: boolean;
  user?: { organization?: { name?: string } | null };
  session?: { requiresPortalSelection?: boolean } | null;
}

/** Developers choose a console before entering; true when the picker was opened. */
function openPortalSelectionIfNeeded(
  response: SignInResult | null | undefined,
  dispatch: React.Dispatch<AuthAction>,
): boolean {
  if (!response?.session?.requiresPortalSelection) return false;
  dispatch(
    setPortalSelection({
      organizationName: response.user?.organization?.name ?? null,
      submitting: null,
      error: null,
    }),
  );
  return true;
}

/** Turns a 409 ACTIVE_SESSION_EXISTS into the "signed in on another device" modal. */
function openSessionConflictIfNeeded(
  err: unknown,
  dispatch: React.Dispatch<AuthAction>,
): boolean {
  if (!(err instanceof ApiError) || err.statusCode !== 409) return false;
  const body = err.data?.error;
  if (body?.code !== ACTIVE_SESSION_EXISTS || !body.challengeToken) return false;

  dispatch(
    setSessionConflict({
      challengeToken: body.challengeToken,
      sessions: (body.activeSessions ?? []) as ActiveSessionInfo[],
      revokingId: null,
      error: null,
    }),
  );
  return true;
}

/**
 * Execute Login API call and dispatch state / response into context.
 */
export async function loginApi(
  credentials: LoginFormValues,
  dispatch: React.Dispatch<AuthAction>,
  onSuccess?: () => void,
): Promise<boolean> {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await api.post("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    // Save full API response in context
    dispatch(setApiResponse(response as Record<string, unknown>));

    if (response?.requires2FA) {
      dispatch(setRequires2FA(true, response.tempToken));
      return false;
    }

    if (isAuthenticatedResponse(response)) {
      if (openPortalSelectionIfNeeded(response, dispatch)) return true;
      dispatch(setLoading(false));
      if (onSuccess) {
        onSuccess();
      }
      return true;
    }

    const errorMsg =
      response?.error ||
      "Invalid credentials. Please verify your work email and password.";
    dispatch(setError(errorMsg));
    return false;
  } catch (err) {
    if (openSessionConflictIfNeeded(err, dispatch)) return false;
    const message =
      err instanceof ApiError
        ? err.message
        : "An unexpected error occurred while communicating with the identity server.";
    dispatch(setError(message));
    dispatch(
      setApiResponse({
        error: message,
        status: err instanceof ApiError ? err.statusCode : 500,
      }),
    );
    return false;
  }
}

/**
 * Execute 2FA Verification API call and dispatch state / response into context.
 */
export async function verify2FAApi(
  payload: TwoFactorFormValues & { tempToken: string },
  dispatch: React.Dispatch<AuthAction>,
  onSuccess?: () => void,
): Promise<boolean> {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await api.post("/auth/2fa/verify", {
      tempToken: payload.tempToken,
      code: payload.twoFactorCode.trim(),
    });

    // Save full API response in context
    dispatch(setApiResponse(response as Record<string, unknown>));

    if (isAuthenticatedResponse(response)) {
      if (openPortalSelectionIfNeeded(response, dispatch)) return true;
      dispatch(setLoading(false));
      if (onSuccess) {
        onSuccess();
      }
      return true;
    }

    const errorMsg =
      response?.error || "Invalid two-factor code. Please try again.";
    dispatch(setError(errorMsg));
    return false;
  } catch (err) {
    if (openSessionConflictIfNeeded(err, dispatch)) return false;
    const message =
      err instanceof ApiError
        ? err.message
        : "Verification failed. Please check your authenticator code.";
    dispatch(setError(message));
    dispatch(
      setApiResponse({
        error: message,
        status: err instanceof ApiError ? err.statusCode : 500,
      }),
    );
    return false;
  }
}

/**
 * Generate TOTP Provisioning Key and QR Code from backend, dispatching into context.
 */
export async function generate2FASecretApi(
  email: string,
  dispatch: React.Dispatch<AuthAction>,
): Promise<GenerateSecretResponse | null> {
  dispatch(setTotpLoading(true));
  dispatch(setError(null));

  try {
    const response = (await api.post("/auth/2fa/generate-secret", {
      email: email.trim() || "admin@organization.com",
    })) as GenerateSecretResponse;

    // Save full API response in context
    dispatch(setApiResponse(response as unknown as Record<string, unknown>));

    if (response && response.secret) {
      dispatch(setTotpSecret(response.secret, response.qrCodeDataUrl || null));
      return response;
    }

    dispatch(setTotpLoading(false));
    return null;
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Could not generate 2FA secret from authentication service.";
    dispatch(setError(message));
    dispatch(setTotpLoading(false));
    return null;
  }
}

/**
 * Register Organization and provision workspace enclave, dispatching result into context.
 */
export async function registerOrganizationApi(
  values: OrgRegistrationFormValues,
  dispatch: React.Dispatch<AuthAction>,
  onSuccess?: () => void,
): Promise<boolean> {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const payload = {
      organizationName: values.organizationName.trim(),
      legalName: values.legalName?.trim() || undefined,
      orgType: values.orgType || undefined,
      industry: values.industry || undefined,
      companySize: values.companySize || undefined,
      country: values.country || undefined,
      state: values.state?.trim() || undefined,
      city: values.city?.trim() || undefined,
      website: values.website?.trim() || undefined,
      businessEmail: values.businessEmail?.trim() || undefined,
      businessPhone: values.businessPhone?.trim() || undefined,
      address: values.address?.trim() || undefined,

      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      mobilePhone: values.mobilePhone?.trim() || undefined,
      password: values.password,

      setup2FA: values.setup2FA,
      twoFactorSecret: values.setup2FA ? values.twoFactorSecret : undefined,
      twoFactorCode: values.setup2FA ? values.twoFactorCode?.trim() : undefined,

      termsAccepted: true,
      privacyAccepted: true,
      communicationOptIn: values.communicationOptIn ?? false,
    };

    const response = await api.post("/auth/register-organization", payload);

    // Save response in context
    dispatch(setApiResponse(response as Record<string, unknown>));

    if (isAuthenticatedResponse(response)) {
      if (response.backupCodes && response.backupCodes.length > 0) {
        dispatch(setBackupCodes(response.backupCodes));
      } else {
        dispatch(setLoading(false));
        if (onSuccess) {
          onSuccess();
        }
      }
      return true;
    }

    const errorMsg =
      response?.error ||
      "Failed to create organization. Unexpected server response.";
    dispatch(setError(errorMsg));
    return false;
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Failed to register organization. Please check network connection.";
    dispatch(setError(message));
    dispatch(
      setApiResponse({
        error: message,
        status: err instanceof ApiError ? err.statusCode : 500,
      }),
    );
    return false;
  }
}

/**
 * Signs out the device that blocks this sign-in, using the challenge token from the
 * 409 response (it proves the credentials were just verified on this device).
 */
export async function revokeBlockingSessionApi(
  sessionId: string,
  challengeToken: string,
): Promise<void> {
  await api.delete(`/login-history/challenge/${encodeURIComponent(sessionId)}`, {
    headers: { "x-login-challenge": challengeToken },
  });
}

/** Records the developer's console choice on the current session. */
export async function setLoginPortalApi(loginAs: LoginPortal): Promise<void> {
  await api.patch("/login-history/current/portal", { loginAs });
}

/** Ends the just-opened session (developer backed out of the console choice). */
export async function abandonSignInApi(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Session already gone
  }
  // The BFF cleared the session cookies whatever the backend answered
}

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  return err instanceof ApiError ? err.message : fallback;
};

// ── Forgot password ──────────────────────────────────────────────────────

export interface PasswordResetRequestResult {
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

/** Emails a reset code. The backend answers the same whether or not the email has an account. */
export async function requestPasswordResetApi(email: string): Promise<PasswordResetRequestResult> {
  return api.post("/auth/password/forgot", { email: email.trim().toLowerCase() });
}

/** Exchanges the emailed code for a short-lived reset token. */
export async function verifyResetCodeApi(email: string, code: string): Promise<string> {
  const result = await api.post<{ resetToken: string }>("/auth/password/verify-code", {
    email: email.trim().toLowerCase(),
    code: code.trim(),
  });
  return result.resetToken;
}

/** Sets the new password; the backend signs the account out on every device. */
export async function resetPasswordApi(resetToken: string, newPassword: string): Promise<void> {
  await api.post("/auth/password/reset", { resetToken, newPassword });
}
