"use client";

import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthPageContext } from "../context";
import { orgRegistrationSchema, type OrgRegistrationFormValues } from "../types";
import {
  INITIAL_ORG_FORM,
  ORG_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  COUNTRY_OPTIONS,
  STEP_DEFINITIONS,
} from "../common/constants";
import { AUTOFILL_FIX } from "../common/styles";
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

export function RegisterOrgForm() {
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
    <div className="space-y-4">
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

      <Typography variant="h4" weight="bold" className="tracking-tight text-[var(--gy-text)]">
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

      <form onSubmit={onSubmitByStep[step]} noValidate className="space-y-4">
        <div
          key={step}
          className="space-y-4 transition-all duration-300 ease-out starting:opacity-0 starting:translate-x-3"
        >
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Organization name"
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
                  placeholder="Optional"
                  fullWidth
                  className={AUTOFILL_FIX}
                  {...register("legalName")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="orgType"
                  render={({ field }) => (
                    <Dropdown
                      variant="glass" label="Organization type" options={ORG_TYPE_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="industry"
                  render={({ field }) => (
                    <Dropdown
                      variant="glass" label="Industry" options={INDUSTRY_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="companySize"
                  render={({ field }) => (
                    <Dropdown
                      variant="glass" label="Company size" options={COMPANY_SIZE_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Dropdown
                      variant="glass"
                      label="Country"
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Work email"
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
                  type="tel"
                  autoComplete="tel"
                  placeholder="Optional"
                  fullWidth
                  className={AUTOFILL_FIX}
                  leftIcon={<Phone className="size-4" />}
                  {...register("mobilePhone")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
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
                  label="I agree to the Samantrix Master Services Agreement"
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

        <div className="flex items-center gap-3 pt-1">
          {step > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              leftIcon={<ArrowLeft className="size-4" />}
              onClick={handlePrev}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            variant={step === TOTAL_STEPS ? "success" : "primary"}
            size="lg"
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
}
