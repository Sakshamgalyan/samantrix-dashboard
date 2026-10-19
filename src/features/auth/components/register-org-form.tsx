"use client";

import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { api } from "@/lib/api-client/apiClient";
import { useAuthPageContext } from "@/features/auth/context";
import { orgRegistrationSchema, type OrgRegistrationFormValues } from "@/features/auth/types/forms";

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
import {
  INITIAL_ORG_FORM,
  ORG_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  COUNTRY_OPTIONS,
  STEP_DEFINITIONS,
} from "@/features/auth/common/constants";
import { AUTOFILL_FIX } from "@/features/auth/common/styles";
import {
  Banner,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Spinner,
  Stepper,
  Toggle,
  Typography,
} from "@galyan/ui";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Rocket,
  User,
} from "lucide-react";

const TOTAL_STEPS = STEP_DEFINITIONS.length;

const STEP_TITLES: Record<number, string> = {
  1: "Organization profile",
  2: "Root administrator",
  3: "Secure the root account",
  4: "Review & confirm",
};

export const RegisterOrgForm = () => {
  const {
    step,
    setStep,
    loading,
    error,
    setError,
    totpLoading,
    twoFactorSecret,
    qrCodeDataUrl,
    copiedKey,
    setCopiedKey,
    handleToggle2FA,
    fetch2FASecret,
    handleOrgSubmit,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useAuthPageContext();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm<OrgRegistrationFormValues>({
    resolver: zodResolver(orgRegistrationSchema),
    mode: "onTouched",
    defaultValues: INITIAL_ORG_FORM,
  });

  const setup2FA = useWatch({ control, name: "setup2FA" });
  const organizationName = useWatch({ control, name: "organizationName" });
  const email = useWatch({ control, name: "email" });
  const termsAccepted = useWatch({ control, name: "termsAccepted" });
  const privacyAccepted = useWatch({ control, name: "privacyAccepted" });

  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);

  const handleOAuthRegister = async (provider: "google" | "microsoft") => {
    try {
      setOauthLoading(provider);
      setError(null);
      const orgName = getValues("organizationName");
      const res = await api.get<{ url: string }>(`/auth/oauth/${provider}/url`, {
        params: {
          app: "dashboard",
          redirectUri: `${window.location.origin}/auth/callback`,
          state: orgName ? JSON.stringify({ organizationName: orgName }) : undefined,
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

  const copySecret = () => {
    if (!twoFactorSecret) return;
    navigator.clipboard.writeText(twoFactorSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePrev = () => {
    setError(null);
    setStep(Math.max(1, step - 1));
  };

  const onNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger([
      "organizationName",
      "legalName",
      "orgType",
      "industry",
      "companySize",
      "country",
    ]);

    if (isValid) {
      setError(null);
      setStep(2);
    }
  };

  const onNextStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger([
      "firstName",
      "lastName",
      "email",
      "mobilePhone",
      "password",
      "confirmPassword",
    ]);

    if (getValues("password") !== getValues("confirmPassword")) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (isValid) {
      setError(null);
      setStep(3);

      if (setup2FA && !twoFactorSecret) {
        fetch2FASecret(getValues("email"));
      }
    }
  };

  const onNextStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setup2FA) {
      const code = getValues("twoFactorCode");
      if (!code || code.trim().length !== 6) {
        setError("Please enter the 6-digit code from your authenticator app.");
        return;
      }
    }
    setError(null);
    setStep(4);
  };

  const onFinalSubmit = handleSubmit(async (values) => {
    if (!values.termsAccepted || !values.privacyAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    await handleOrgSubmit({
      ...values,
      twoFactorSecret: twoFactorSecret || values.twoFactorSecret,
    });
  });

  const toggle2FA = async (enable: boolean) => {
    setValue("setup2FA", enable, { shouldValidate: true });
    await handleToggle2FA(enable, getValues("email"));
  };

  const onSubmitByStep: Record<number, (e: React.FormEvent) => void> = {
    1: onNextStep1,
    2: onNextStep2,
    3: onNextStep3,
    4: onFinalSubmit,
  };

  // Four labelled steps overflow the card, so only the active step shows its label
  const stepperSteps = STEP_DEFINITIONS.map(({ id, label }, idx) => ({
    id,
    label: idx === step - 1 ? label : "",
  }));

  const tenantSlug = (organizationName || "your-org").toLowerCase().replace(/[^a-z0-9]/g, "-");

  return (
    <div className="space-y-2">
      <Stepper
        steps={stepperSteps}
        activeStep={step - 1}
        size="sm"
        // Completed steps are clickable to go back; forward moves go through validation
        onStepClick={(idx) => {
          if (idx < step - 1) {
            setError(null);
            setStep(idx + 1);
          }
        }}
      />

      <Typography variant="h5" weight="bold" className="text-base sm:text-lg tracking-tight text-[var(--gy-text)]">
        {STEP_TITLES[step]}
      </Typography>

      {error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      <form onSubmit={onSubmitByStep[step]} noValidate className="space-y-2.5">
        <div
          key={step}
          className="space-y-2.5 transition-all duration-300 ease-out starting:opacity-0 starting:translate-x-3"
        >
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="glass"
                    size="sm"
                    fullWidth
                    leftIcon={<GoogleIcon />}
                    isLoading={oauthLoading === "google"}
                    disabled={oauthLoading !== null}
                    onClick={() => handleOAuthRegister("google")}
                  >
                    Google Workspace
                  </Button>
                  <Button
                    type="button"
                    variant="glass"
                    size="sm"
                    fullWidth
                    leftIcon={<MicrosoftIcon />}
                    isLoading={oauthLoading === "microsoft"}
                    disabled={oauthLoading !== null}
                    onClick={() => handleOAuthRegister("microsoft")}
                  >
                    Microsoft 365
                  </Button>
                </div>
                <div className="flex items-center gap-2 my-0.5">
                  <span className="h-px flex-1 bg-[var(--gy-divider)]" />
                  <Typography variant="span" className="text-[10px] uppercase tracking-wider text-[var(--gy-text-subtle)]">
                    or enter organization details
                  </Typography>
                  <span className="h-px flex-1 bg-[var(--gy-divider)]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  label="Organization name"
                  size="sm"
                  required
                  autoFocus
                  placeholder="Hyperion Global"
                  fullWidth
                  className={AUTOFILL_FIX}
                  leftIcon={<Building2 className="size-4" />}
                  hasError={!!errors.organizationName}
                  error={errors.organizationName?.message}
                  {...register("organizationName")}
                />
                <Input
                  label="Legal entity name"
                  size="sm"
                  placeholder="Optional"
                  fullWidth
                  className={AUTOFILL_FIX}
                  {...register("legalName")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Controller
                  control={control}
                  name="orgType"
                  render={({ field }) => (
                    <Dropdown label="Organization type" size="sm" options={ORG_TYPE_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="industry"
                  render={({ field }) => (
                    <Dropdown label="Industry" size="sm" options={INDUSTRY_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="companySize"
                  render={({ field }) => (
                    <Dropdown label="Company size" size="sm" options={COMPANY_SIZE_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Dropdown
                      label="Country"
                      size="sm"
                      options={COUNTRY_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      searchable
                      leftIcon={<Globe className="size-4" />}
                    />
                  )}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  label="First name"
                  size="sm"
                  required
                  autoFocus
                  autoComplete="given-name"
                  placeholder="Elena"
                  fullWidth
                  className={AUTOFILL_FIX}
                  leftIcon={<User className="size-4" />}
                  hasError={!!errors.firstName}
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <Input
                  label="Last name"
                  size="sm"
                  required
                  autoComplete="family-name"
                  placeholder="Vance"
                  fullWidth
                  className={AUTOFILL_FIX}
                  hasError={!!errors.lastName}
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  label="Work email"
                  size="sm"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="elena@hyperion.com"
                  fullWidth
                  className={AUTOFILL_FIX}
                  leftIcon={<Mail className="size-4" />}
                  hasError={!!errors.email}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Phone"
                  size="sm"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Optional"
                  fullWidth
                  className={AUTOFILL_FIX}
                  leftIcon={<Phone className="size-4" />}
                  {...register("mobilePhone")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  label="Password"
                  size="sm"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  fullWidth
                  className={AUTOFILL_FIX}
                  leftIcon={<Lock className="size-4" />}
                  rightIcon={showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  hasError={!!errors.password}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Input
                  label="Confirm password"
                  size="sm"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  fullWidth
                  className={AUTOFILL_FIX}
                  rightIcon={showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  hasError={!!errors.confirmPassword}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Card variant="glass" padding="md" radius="lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Typography variant="span" weight="semibold" className="block text-sm text-[var(--gy-text)]">
                      Require two-factor authentication
                    </Typography>
                    <Typography variant="span" className="block text-xs text-[var(--gy-text-secondary)]">
                      Recommended for the root administrator.
                    </Typography>
                  </div>
                  <Toggle
                    checked={setup2FA}
                    onChange={(e) => toggle2FA(e.target.checked)}
                    aria-label="Require two-factor authentication"
                  />
                </div>
              </Card>

              {setup2FA && (
                <div className="space-y-3 transition-all duration-300 ease-out starting:opacity-0 starting:-translate-y-2">
                  <Card variant="glass" padding="sm" radius="lg">
                    <div className="flex items-center gap-4">
                      {/* QR codes need a white quiet zone to scan, in either colour mode */}
                      <div className="grid size-20 shrink-0 place-items-center rounded-lg bg-white p-1">
                        {totpLoading || !qrCodeDataUrl ? (
                          <Spinner size="md" color="primary" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={qrCodeDataUrl} alt="Authenticator QR code" className="size-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Typography variant="span" weight="semibold" className="block text-sm text-[var(--gy-text)]">
                          Scan with your authenticator
                        </Typography>
                        <Typography variant="span" className="block text-xs text-[var(--gy-text-secondary)]">
                          Or enter this key manually:
                        </Typography>
                        <Typography
                          variant="span"
                          className="block break-all select-all font-mono text-xs text-[var(--gy-primary)]"
                        >
                          {twoFactorSecret || "Generating…"}
                        </Typography>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          disabled={!twoFactorSecret}
                          onClick={copySecret}
                          leftIcon={copiedKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        >
                          {copiedKey ? "Copied" : "Copy key"}
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Input
                    label="6-digit code"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    fullWidth
                    className={AUTOFILL_FIX}
                    leftIcon={<KeyRound className="size-4" />}
                    hasError={!!errors.twoFactorCode}
                    error={errors.twoFactorCode?.message}
                    {...register("twoFactorCode")}
                  />
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <Card variant="glass" padding="none" radius="lg">
                <dl className="divide-y divide-[var(--gy-divider)] px-4 text-sm">
                  {[
                    { label: "Workspace URL", value: `${tenantSlug}.smtx.cloud` },
                    { label: "Region", value: "US-East (Primary)" },
                    { label: "Administrator", value: email || "—" },
                    { label: "Two-factor", value: setup2FA ? "Enabled" : "Disabled" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[var(--gy-text-secondary)]">{row.label}</dt>
                      <dd className="truncate font-medium text-[var(--gy-text)]">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>

              <div className="space-y-3">
                <Checkbox
                  size="sm"
                  checked={!!termsAccepted}
                  onChange={(e) => setValue("termsAccepted", e.target.checked, { shouldValidate: true })}
                  label="I agree to the Simantrix Master Services Agreement"
                  color={errors.termsAccepted ? "error" : "primary"}
                />
                <Checkbox
                  size="sm"
                  checked={!!privacyAccepted}
                  onChange={(e) => setValue("privacyAccepted", e.target.checked, { shouldValidate: true })}
                  label="I accept the Privacy Policy and data processing terms"
                  color={errors.privacyAccepted ? "error" : "primary"}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-0.5">
          {step > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              leftIcon={<ArrowLeft className="size-4" />}
              onClick={handlePrev}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            variant={step === TOTAL_STEPS ? "success" : "primary"}
            size="md"
            fullWidth
            isLoading={step === TOTAL_STEPS && loading}
            rightIcon={step === TOTAL_STEPS ? <Rocket className="size-4" /> : <ArrowRight className="size-4" />}
          >
            {step === TOTAL_STEPS ? "Create organization" : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
};
