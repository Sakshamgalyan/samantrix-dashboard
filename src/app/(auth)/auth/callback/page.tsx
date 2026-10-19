"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner, Typography } from "@galyan/ui";
import { api, ApiError, isAuthenticatedResponse } from "@/lib/api-client/apiClient";
import { useAuth } from "@/features/auth";
import { getHomePath } from "@/utils/home-path";

/** Website sign-in page that issues handoff codes (simantrix-home). */
const HOME_SIGN_IN_URL = `${(process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:4000").replace(/\/+$/, "")}/sign-in`;

/** The BFF keeps the issued tokens in httpOnly cookies and answers `authenticated: true`. */
interface HandoffExchangeResponse {
  target: string;
  authenticated?: boolean;
}

type HandoffFailure = "expired" | "error";

/**
 * The code is single use, so it is redeemed at most once per page load: this module-level
 * promise survives Strict Mode's double effect and Activity hide/show (which re-run effects).
 */
let handoff: { code: string; result: Promise<HandoffExchangeResponse> } | null = null;

function redeemHandoffCode(): Promise<HandoffExchangeResponse> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (errorParam) {
    return Promise.reject(new ApiError(errorParam, 400));
  }

  // Detect OAuth vs Handoff
  let oauthProvider: "google" | "microsoft" | null = null;
  if (stateParam) {
    try {
      const base64 = stateParam.replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(window.atob(base64));
      if (json.provider === "google" || json.provider === "microsoft") {
        oauthProvider = json.provider;
      }
    } catch {
      if (stateParam.includes("microsoft")) oauthProvider = "microsoft";
      else if (stateParam.includes("google")) oauthProvider = "google";
    }
  }

  if (code) {
    // Keep the code out of browser history straight away
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  if (handoff && (!code || code === handoff.code)) return handoff.result;
  if (!code) return Promise.reject(new ApiError("Missing authorization code", 401));

  if (oauthProvider) {
    handoff = {
      code,
      result: api.post<HandoffExchangeResponse>(`/auth/oauth/${oauthProvider}`, {
        provider: oauthProvider,
        code,
        redirectUri: `${window.location.origin}/auth/callback`,
      }),
    };
  } else {
    handoff = {
      code,
      result: api.post<HandoffExchangeResponse>("/auth/handoff/exchange", { code }),
    };
  }

  return handoff.result;
}

const AuthCallbackPage = () => {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    redeemHandoffCode()
      .then(async (exchange) => {
        if (!active) return;
        if (!isAuthenticatedResponse(exchange)) {
          setFailure("Authentication failed. Please verify your credentials.");
          return;
        }
        const user = await refreshSession();
        if (!active) return;
        if (!user) {
          setFailure("Unable to load user profile after authentication.");
          return;
        }
        router.replace(getHomePath(user));
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError) {
          setFailure(err.message || (err.statusCode === 401 ? "Sign-in link has expired." : "Authentication error."));
        } else {
          setFailure("Something went wrong while verifying your account.");
        }
      });

    return () => {
      active = false;
    };
  }, [refreshSession, router]);

  if (failure) {
    return (
      <div className="grid h-dvh place-items-center bg-[var(--gy-background)] px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <Typography variant="h2" className="text-lg font-semibold text-[var(--gy-text)]">
            Authentication failed
          </Typography>
          <Typography variant="p" className="text-sm text-[var(--gy-text-subtle)]">
            {failure}
          </Typography>
          <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
            <Button href="/auth" variant="primary" fullWidth>
              Back to Login
            </Button>
            <Button href={HOME_SIGN_IN_URL} variant="secondary" fullWidth>
              Main Website
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-dvh place-items-center bg-[var(--gy-background)]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" color="primary" />
        <Typography variant="span" className="text-xs uppercase tracking-widest text-[var(--gy-text-subtle)]">
          Signing you in
        </Typography>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
