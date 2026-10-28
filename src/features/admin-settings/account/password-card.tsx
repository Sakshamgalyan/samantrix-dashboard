"use client";

import React, { useEffect, useState } from "react";
import { Banner, Button, Input, Typography, useToast } from "@galyan/ui";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
  Send,
} from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import {
  errorMessage,
  retryAfterSeconds,
  useChangePasswordMutation,
  useRequestPasswordCodeMutation,
} from "@/features/admin-settings/account/api";

type Step = "idle" | "code" | "done";

const passwordProblem = (value: string): string | undefined => {
  if (value.length < 8) return "At least 8 characters";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value))
    return "Use letters and numbers";
  return undefined;
};

/** Countdown to when another code may be requested. */
const useCountdown = (): [number, (seconds: number) => void] => {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (until <= now) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until, now]);
  const start = (seconds: number) => {
    setNow(Date.now());
    setUntil(Date.now() + seconds * 1000);
  };
  return [Math.max(0, Math.ceil((until - now) / 1000)), start];
};

/** Change password: a code goes to the account email, then code + new password. */
export const PasswordCard = () => {
  const { toast } = useToast();
  const [requestPasswordCode] = useRequestPasswordCodeMutation();
  const [changePassword] = useChangePasswordMutation();
  const [step, setStep] = useState<Step>("idle");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedOut, setSignedOut] = useState(0);
  const [resendIn, startResend] = useCountdown();

  const sendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await requestPasswordCode().unwrap();
      setSentTo(res.email);
      startResend(res.resendAfterSeconds);
      setStep("code");
    } catch (err) {
      const wait = retryAfterSeconds(err);
      if (wait) {
        startResend(wait);
        setStep("code");
      }
      setError(errorMessage(err, "Could not send the code. Please try again."));
    } finally {
      setSending(false);
    }
  };

  const problem = password ? passwordProblem(password) : undefined;
  const mismatch =
    confirm && confirm !== password ? "Passwords don't match" : undefined;
  const canSubmit =
    /^\d{6}$/.test(code) &&
    currentPassword.trim().length > 0 &&
    password &&
    !problem &&
    confirm === password;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await changePassword({
        code,
        currentPassword: currentPassword.trim(),
        newPassword: password,
      }).unwrap();
      setSignedOut(res.signedOutSessions);
      setStep("done");
      setCode("");
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
      // Invalidates the device list, which refetches once
      toast.success("Password changed");
    } catch (err) {
      setError(errorMessage(err, "Could not change your password."));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep("idle");
    setError(null);
    setCode("");
    setCurrentPassword("");
    setPassword("");
    setConfirm("");
  };

  return (
    <GlassSection
      title="Password"
      subtitle="Changing it needs a code sent to your email"
    >
      {step === "idle" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography
            variant="p"
            textColor="var(--gy-text-secondary)"
            className="text-xs"
          >
            We&apos;ll email you a 6-digit code. Your other devices are signed
            out once the password changes.
          </Typography>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send className="size-3.5" />}
            isLoading={sending}
            onClick={() => void sendCode()}
          >
            Change password
          </Button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--gy-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <MailCheck className="size-3.5 text-[var(--gy-success)] shrink-0" />
              {sentTo ? (
                <span>
                  Code sent to{" "}
                  <strong className="text-[var(--gy-text)]">{sentTo}</strong> ·
                  valid 10 minutes
                </span>
              ) : (
                <span>Enter the code from your latest email</span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={resendIn > 0 || sending}
              onClick={() => void sendCode()}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Button>
          </div>
          {error && (
            <Banner
              variant="danger"
              size="sm"
              bannerStyle="subtle"
              description={error}
            />
          )}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <Input
              label="Verification code"
              size="sm"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              leftIcon={<KeyRound className="size-3.5" />}
            />
            <Input
              label="Current password"
              size="sm"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              rightIcon={
                showCurrent ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )
              }
              onRightIconClick={() => setShowCurrent((v) => !v)}
            />
            <Input
              label="New password"
              size="sm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={problem}
              rightIcon={
                show ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )
              }
              onRightIconClick={() => setShow((v) => !v)}
            />
            <Input
              label="Confirm new password"
              size="sm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={mismatch}
            />
          </div>
          <div className="flex justify-end gap-2 flex-wrap pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={reset}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              disabled={!canSubmit}
              onClick={() => void submit()}
            >
              Update password
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm text-[var(--gy-text)]">
            <CheckCircle2 className="size-4 text-[var(--gy-success)] shrink-0" />
            <Typography
              variant="span"
              weight="medium"
              textColor="var(--gy-text)"
            >
              Password updated
            </Typography>
            {signedOut > 0 && (
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs"
              >
                · signed out {signedOut} other{" "}
                {signedOut === 1 ? "device" : "devices"}
              </Typography>
            )}
          </span>
          <Button variant="ghost" size="sm" onClick={reset}>
            Done
          </Button>
        </div>
      )}
    </GlassSection>
  );
};
