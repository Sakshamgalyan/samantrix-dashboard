"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { api } from "@/lib/api-client/apiClient";
import { useAuthPageContext } from "@/features/auth/context";
import {
  loginSchema,
  twoFactorSchema,
  type LoginFormValues,
  type TwoFactorFormValues,
} from "@/features/auth/types/forms";
import { Button, Input, Checkbox, Typography, Banner } from "@galyan/ui";
import { AUTOFILL_FIX } from "@/features/auth/common/styles";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

const GoogleIcon = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 23 23" aria-hidden>
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

const Divider = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center gap-2.5 my-0.5">
      <span className="h-px flex-1 bg-[var(--gy-divider)]" />
      <Typography variant="span" className="text-[10px] uppercase tracking-wider text-[var(--gy-text-subtle)]">
        {label}
      </Typography>
      <span className="h-px flex-1 bg-[var(--gy-divider)]" />
    </div>
  );
};

export const LoginForm = () => {
  const {
    loading,
    error,
    setError,
    requires2FA,
    setRequires2FA,
    isBackupCodeMode,
    setIsBackupCodeMode,
    showPassword,
    setShowPassword,
    rememberWorkstation,
    setRememberWorkstation,
    handleLogin,
    handle2FASubmit,
    resetToLogin,
    setAuthMode,
  } = useAuthPageContext();

  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "microsoft") => {
    try {
      setOauthLoading(provider);
      setError(null);
      const res = await api.get<{ url: string }>(`/auth/oauth/${provider}/url`, {
        params: {
          app: "dashboard",
          redirectUri: `${window.location.origin}/auth/callback`,
        },
      });
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error(`Failed to retrieve SSO redirect URL for ${provider}`);
      }
    } catch (err) {
      setOauthLoading(null);
      setError(err instanceof Error ? err.message : "Failed to initiate single sign-on.");
    }
  };

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberWorkstation: true,
    },
  });

  const {
    register: register2FA,
    handleSubmit: handle2FASubmitForm,
    formState: { errors: errors2FA },
    reset: reset2FAForm,
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      twoFactorCode: "",
    },
  });

  const errorBanner = error && (
    <Banner
      variant="danger"
      size="sm"
      bannerStyle="subtle"
      description={error}
      dismissible
      onDismiss={() => setError(null)}
    />
  );

  if (requires2FA) {
    return (
      <form onSubmit={handle2FASubmitForm(handle2FASubmit)} className="space-y-3">
        <div className="space-y-2">
          <span
            className={`grid size-9 place-items-center rounded-lg ${
              isBackupCodeMode
                ? "bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]"
                : "bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]"
            }`}
          >
            {isBackupCodeMode ? <ShieldAlert className="size-4" /> : <KeyRound className="size-4" />}
          </span>
          <div className="space-y-0.5">
            <Typography variant="h4" weight="bold" className="text-base tracking-tight text-[var(--gy-text)]">
              {isBackupCodeMode ? "Use a backup code" : "Two-factor verification"}
            </Typography>
            <Typography variant="p" className="text-xs text-[var(--gy-text-secondary)]">
              {isBackupCodeMode
                ? "Enter one of your one-time recovery codes."
                : "Enter the 6-digit code from your authenticator app."}
            </Typography>
          </div>
        </div>

        {errorBanner}

        <Input
          key={isBackupCodeMode ? "backup" : "totp"}
          label={isBackupCodeMode ? "Recovery code" : "Verification code"}
          type="text"
          size="sm"
          inputMode={isBackupCodeMode ? "text" : "numeric"}
          autoComplete="one-time-code"
          placeholder={isBackupCodeMode ? "7A9B-4C2D" : "123456"}
          maxLength={isBackupCodeMode ? 16 : 6}
          autoFocus
          fullWidth
          className={AUTOFILL_FIX}
          leftIcon={<KeyRound className="size-3.5" />}
          hasError={!!errors2FA.twoFactorCode}
          error={errors2FA.twoFactorCode?.message}
          {...register2FA("twoFactorCode")}
        />

        <div className="space-y-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={loading}
            rightIcon={<ArrowRight className="size-4" />}
          >
            Verify and continue
          </Button>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="size-3.5" />}
              onClick={() => {
                setRequires2FA(false);
                reset2FAForm();
                resetToLogin();
              }}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                setIsBackupCodeMode(!isBackupCodeMode);
                reset2FAForm();
                setError(null);
              }}
            >
              {isBackupCodeMode ? "Use authenticator app" : "Use a backup code"}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="space-y-0.5">
        <Typography variant="h4" weight="bold" className="text-base sm:text-lg tracking-tight text-[var(--gy-text)]">
          Welcome back
        </Typography>
        <Typography variant="p" className="text-xs text-[var(--gy-text-secondary)]">
          Sign in to your Simantrix Control Center.
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="glass"
          size="sm"
          fullWidth
          leftIcon={<GoogleIcon />}
          isLoading={oauthLoading === "google"}
          disabled={loading || oauthLoading !== null}
          onClick={() => handleOAuthSignIn("google")}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="glass"
          size="sm"
          fullWidth
          leftIcon={<MicrosoftIcon />}
          isLoading={oauthLoading === "microsoft"}
          disabled={loading || oauthLoading !== null}
          onClick={() => handleOAuthSignIn("microsoft")}
        >
          Microsoft
        </Button>
      </div>

      <Divider label="or continue with email" />

      <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-2 sm:space-y-2.5" noValidate>
        {errorBanner}

        <Input
          label="Work email"
          type="email"
          size="sm"
          autoComplete="email"
          placeholder="you@company.com"
          fullWidth
          className={AUTOFILL_FIX}
          leftIcon={<Mail className="size-3.5" />}
          hasError={!!loginErrors.email}
          error={loginErrors.email?.message}
          {...registerLogin("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          size="sm"
          autoComplete="current-password"
          placeholder="Enter your password"
          fullWidth
          className={AUTOFILL_FIX}
          leftIcon={<Lock className="size-3.5" />}
          rightIcon={showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          hasError={!!loginErrors.password}
          error={loginErrors.password?.message}
          {...registerLogin("password")}
        />

        <div className="flex items-center justify-between pt-0.5">
          <Checkbox
            size="sm"
            checked={rememberWorkstation}
            onChange={(e) => setRememberWorkstation(e.target.checked)}
            label="Remember me for 30 days"
          />
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setAuthMode("forgot-password")}
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={loading}
          rightIcon={<ArrowRight className="size-4" />}
        >
          Sign in
        </Button>
      </form>

      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        <ShieldCheck className="size-3 text-[var(--gy-success)]" />
        <Typography variant="span" className="text-[10px] sm:text-[11px] text-[var(--gy-text-subtle)]">
          Secured with TLS 1.3 · SOC2 Type II · ISO 27001
        </Typography>
      </div>
    </div>
  );
};
