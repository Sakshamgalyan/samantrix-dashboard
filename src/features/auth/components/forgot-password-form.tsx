"use client";

import { useEffect, useReducer } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { Banner, Button, Input, Typography } from "@galyan/ui";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MailCheck,
  RotateCw,
} from "lucide-react";
import { useAuthPageContext } from "@/features/auth/context";
import {
  getApiErrorMessage,
  requestPasswordResetApi,
  resetPasswordApi,
  verifyResetCodeApi,
} from "@/features/auth/context/api";
import {
  forgotEmailSchema,
  newPasswordSchema,
  resetCodeSchema,
  type ForgotEmailFormValues,
  type NewPasswordFormValues,
  type ResetCodeFormValues,
} from "@/features/auth/types/forms";
import { AUTOFILL_FIX } from "@/features/auth/common/styles";

type Step = "email" | "code" | "password" | "done";

interface FlowState {
  step: Step;
  email: string;
  resetToken: string | null;
  loading: boolean;
  error: string | null;
  notice: string | null;
  /** Epoch ms when "Resend code" unlocks */
  resendAt: number;
  now: number;
  showPassword: boolean;
}

type FlowAction =
  | { type: "START" }
  | { type: "FAIL"; error: string }
  | { type: "CODE_SENT"; email: string; resendAfterSeconds: number; resent: boolean }
  | { type: "CODE_VERIFIED"; resetToken: string }
  | { type: "PASSWORD_RESET" }
  | { type: "GO_TO"; step: Step }
  | { type: "TICK" }
  | { type: "TOGGLE_PASSWORD" }
  | { type: "CLEAR_MESSAGES" };

const initialState: FlowState = {
  step: "email",
  email: "",
  resetToken: null,
  loading: false,
  error: null,
  notice: null,
  resendAt: 0,
  now: 0,
  showPassword: false,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: null, notice: null };
    case "FAIL":
      return { ...state, loading: false, error: action.error };
    case "CODE_SENT": {
      const now = Date.now();
      return {
        ...state,
        loading: false,
        step: "code",
        email: action.email,
        resendAt: now + action.resendAfterSeconds * 1000,
        now,
        notice: action.resent ? "A new code is on its way. Earlier codes no longer work." : null,
      };
    }
    case "CODE_VERIFIED":
      return { ...state, loading: false, step: "password", resetToken: action.resetToken };
    case "PASSWORD_RESET":
      return { ...state, loading: false, step: "done", resetToken: null };
    case "GO_TO":
      return { ...state, step: action.step, error: null, notice: null };
    case "TICK":
      return { ...state, now: Date.now() };
    case "TOGGLE_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    case "CLEAR_MESSAGES":
      return { ...state, error: null, notice: null };
  }
}

const StepHeading = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: React.ReactNode }) => {
  return (
    <div className="space-y-3">
      <span className="grid size-11 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
        {icon}
      </span>
      <div className="space-y-1">
        <Typography variant="h4" weight="bold" className="tracking-tight text-[var(--gy-text)]">
          {title}
        </Typography>
        <Typography variant="p" className="text-sm text-[var(--gy-text-secondary)]">
          {subtitle}
        </Typography>
      </div>
    </div>
  );
};

/**
 * Forgot password: email → 6-digit code from the email → new password.
 * A successful reset signs the account out on every device.
 */
export const ForgotPasswordForm = () => {
  const { resetToLogin } = useAuthPageContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  const emailForm = useForm<ForgotEmailFormValues>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<ResetCodeFormValues>({
    resolver: zodResolver(resetCodeSchema),
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Countdown for "Resend code"
  const waitingToResend = state.step === "code" && state.now < state.resendAt;
  useEffect(() => {
    if (!waitingToResend) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [waitingToResend]);
  const secondsLeft = Math.max(0, Math.ceil((state.resendAt - state.now) / 1000));

  const sendCode = async (email: string, resent = false) => {
    dispatch({ type: "START" });
    try {
      const result = await requestPasswordResetApi(email);
      codeForm.reset({ code: "" });
      dispatch({ type: "CODE_SENT", email, resendAfterSeconds: result.resendAfterSeconds ?? 60, resent });
    } catch (err) {
      dispatch({ type: "FAIL", error: getApiErrorMessage(err, "Couldn't send the code. Please try again.") });
    }
  };

  const verifyCode = async ({ code }: ResetCodeFormValues) => {
    dispatch({ type: "START" });
    try {
      const resetToken = await verifyResetCodeApi(state.email, code);
      dispatch({ type: "CODE_VERIFIED", resetToken });
    } catch (err) {
      dispatch({ type: "FAIL", error: getApiErrorMessage(err, "That code didn't work. Please try again.") });
    }
  };

  const savePassword = async ({ password }: NewPasswordFormValues) => {
    if (!state.resetToken) {
      dispatch({ type: "GO_TO", step: "email" });
      return;
    }
    dispatch({ type: "START" });
    try {
      await resetPasswordApi(state.resetToken, password);
      passwordForm.reset();
      dispatch({ type: "PASSWORD_RESET" });
    } catch (err) {
      dispatch({ type: "FAIL", error: getApiErrorMessage(err, "Couldn't update your password. Please try again.") });
    }
  };

  const messages = (
    <>
      {state.error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          description={state.error}
          dismissible
          onDismiss={() => dispatch({ type: "CLEAR_MESSAGES" })}
        />
      )}
      {state.notice && <Banner variant="success" size="sm" bannerStyle="subtle" description={state.notice} />}
    </>
  );

  const backToSignIn = (
    <Button type="button" variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-3.5" />} onClick={resetToLogin}>
      Back to sign in
    </Button>
  );

  if (state.step === "done") {
    return (
      <div className="space-y-5">
        <StepHeading
          icon={<CheckCircle2 className="size-5" />}
          title="Password updated"
          subtitle="You've been signed out on every device. Sign in with your new password."
        />
        <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight className="size-4" />} onClick={resetToLogin}>
          Back to sign in
        </Button>
      </div>
    );
  }

  if (state.step === "password") {
    return (
      <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4" noValidate>
        <StepHeading
          icon={<Lock className="size-5" />}
          title="Choose a new password"
          subtitle="Use at least 8 characters. You'll be signed out on every device."
        />
        {messages}
        <Input
          label="New password"
          type={state.showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          autoFocus
          fullWidth
          className={AUTOFILL_FIX}
          leftIcon={<Lock className="size-4" />}
          rightIcon={state.showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          onRightIconClick={() => dispatch({ type: "TOGGLE_PASSWORD" })}
          hasError={!!passwordForm.formState.errors.password}
          error={passwordForm.formState.errors.password?.message}
          {...passwordForm.register("password")}
        />
        <Input
          label="Confirm new password"
          type={state.showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter the new password"
          fullWidth
          className={AUTOFILL_FIX}
          leftIcon={<Lock className="size-4" />}
          hasError={!!passwordForm.formState.errors.confirmPassword}
          error={passwordForm.formState.errors.confirmPassword?.message}
          {...passwordForm.register("confirmPassword")}
        />
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={state.loading} rightIcon={<ArrowRight className="size-4" />}>
          Update password
        </Button>
        <div className="flex justify-center">{backToSignIn}</div>
      </form>
    );
  }

  if (state.step === "code") {
    return (
      <form onSubmit={codeForm.handleSubmit(verifyCode)} className="space-y-4" noValidate>
        <StepHeading
          icon={<MailCheck className="size-5" />}
          title="Check your email"
          subtitle={
            <>
              If <span className="font-semibold text-[var(--gy-text)]">{state.email}</span> has an account, we sent a
              6-digit code. It expires in 10 minutes.
            </>
          }
        />
        {messages}
        <Controller
          name="code"
          control={codeForm.control}
          render={({ field, fieldState }) => (
            <Input
              label="Verification code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              autoFocus
              fullWidth
              // Input puts className on its wrapper; space out only the digits, not the label
              className={`${AUTOFILL_FIX} [&_input]:font-mono [&_input]:tracking-[0.4em]`}
              leftIcon={<KeyRound className="size-4" />}
              hasError={!!fieldState.error}
              error={fieldState.error?.message}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              // Digits only, so a pasted "482 913" or "482-913" still works
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          )}
        />
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={state.loading} rightIcon={<ArrowRight className="size-4" />}>
          Verify code
        </Button>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="size-3.5" />}
            onClick={() => dispatch({ type: "GO_TO", step: "email" })}
          >
            Use a different email
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            leftIcon={<RotateCw className="size-3.5" />}
            disabled={waitingToResend || state.loading}
            onClick={() => sendCode(state.email, true)}
          >
            {waitingToResend ? `Resend in ${secondsLeft}s` : "Resend code"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={emailForm.handleSubmit(({ email }) => sendCode(email.trim().toLowerCase()))} className="space-y-4" noValidate>
      <StepHeading
        icon={<KeyRound className="size-5" />}
        title="Reset your password"
        subtitle="Enter your work email and we'll send you a 6-digit verification code."
      />
      {messages}
      <Input
        label="Work email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        autoFocus
        fullWidth
        className={AUTOFILL_FIX}
        leftIcon={<Mail className="size-4" />}
        hasError={!!emailForm.formState.errors.email}
        error={emailForm.formState.errors.email?.message}
        {...emailForm.register("email")}
      />
      <Button type="submit" variant="primary" size="lg" fullWidth isLoading={state.loading} rightIcon={<ArrowRight className="size-4" />}>
        Send code
      </Button>
      <div className="flex justify-center">{backToSignIn}</div>
    </form>
  );
};
