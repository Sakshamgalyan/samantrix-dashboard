"use client";

import React, { useEffect } from "react";
import { Banner, Button, Card, Chip, Typography, useToast } from "@galyan/ui";
import { Lock, RotateCw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import type { OrgSecuritySettings } from "@/types/dashboard";
import {
  useGetOrgSecurityQuery,
  useUpdateOrgSecurityMutation,
  useSetupTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
} from "@/features/security/context/api";
import { useSecurity } from "@/features/security/context";
import {
  setPolicyForm,
  updatePolicyField,
  setSavingSettings,
  setError,
  open2FASetup,
  close2FASetup,
  setSetupStep,
  setTotpSecret,
  setQrCode,
  setTotpCode,
  setBackupCodes,
  setTotpLoading,
  setCopiedSecret,
  open2FADisable,
  close2FADisable,
  setDisablePassword,
  setDisableLoading,
  toggleShowDisablePassword,
} from "@/features/security/context/action";
import dynamic from "next/dynamic";
import type { PolicyFormState } from "@/features/security/types/api";
import { UserTwoFactorCard } from "@/features/security/components/user-two-factor-card";
import { OrgSecurityPoliciesCard } from "@/features/security/components/org-security-policies-card";

const TwoFactorSetupModal = dynamic(
  () =>
    import("@/features/security/components/two-factor-setup-modal").then(
      (m) => m.TwoFactorSetupModal,
    ),
  { ssr: false },
);

const TwoFactorDisableModal = dynamic(
  () =>
    import("@/features/security/components/two-factor-disable-modal").then(
      (m) => m.TwoFactorDisableModal,
    ),
  { ssr: false },
);

const toPolicyForm = (data: OrgSecuritySettings): PolicyFormState => ({
  requireTwoFactor: data.requireTwoFactor || false,
  sessionTimeoutMinutes: data.sessionTimeoutMinutes || 60,
  passwordMinLength: data.passwordMinLength || 8,
  passwordExpiresDays: data.passwordExpiresDays || 90,
  allowedEmailDomains: data.allowedEmailDomains || [],
  newDomain: "",
});

export const SecurityContent = () => {
  const { user, isOwner, isAdmin, refreshSession } = useAuth();
  const { toast } = useToast();
  const canEdit = isOwner || isAdmin;

  const { state, dispatch } = useSecurity();
  const {
    policyForm,
    savingSettings,
    error,
    is2FAModalOpen,
    setupStep,
    totpSecret,
    qrCodeDataUrl,
    totpCode,
    backupCodes,
    totpLoading,
    copiedSecret,
    isDisableModalOpen,
    disablePassword,
    disableLoading,
    showDisablePassword,
  } = state;

  const securityQuery = useGetOrgSecurityQuery();
  const [updateOrgSecurity] = useUpdateOrgSecurityMutation();
  const [setupTwoFactor] = useSetupTwoFactorMutation();
  const [enableTwoFactor] = useEnableTwoFactorMutation();
  const [disableTwoFactor] = useDisableTwoFactorMutation();
  const loading = securityQuery.isLoading;

  useEffect(() => {
    if (securityQuery.data) {
      dispatch(setPolicyForm(toPolicyForm(securityQuery.data)));
    }
  }, [securityQuery.data, dispatch]);

  const handleOpen2FASetup = async () => {
    dispatch(open2FASetup());
    try {
      const res = await setupTwoFactor().unwrap();
      if (res) {
        dispatch(setTotpSecret(res.secret ?? null));
        dispatch(setQrCode(res.qrCodeDataUrl ?? null));
      }
    } catch {
      dispatch(setError("Failed to initialize two-factor authenticator setup."));
    } finally {
      dispatch(setTotpLoading(false));
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpSecret || !totpCode.trim()) return;
    dispatch(setTotpLoading(true));
    dispatch(setError(null));
    try {
      const res = await enableTwoFactor({
        secret: totpSecret,
        code: totpCode.trim(),
      }).unwrap();
      if (res && res.backupCodes) {
        dispatch(setBackupCodes(res.backupCodes));
        dispatch(setSetupStep("BACKUP"));
        await refreshSession();
      }
    } catch (err) {
      const msg = queryErrorMessage(err, "Invalid code. Authenticator check failed.");
      dispatch(setError(msg));
    } finally {
      dispatch(setTotpLoading(false));
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;
    dispatch(setDisableLoading(true));
    dispatch(setError(null));
    try {
      await disableTwoFactor({ password: disablePassword }).unwrap();
      dispatch(close2FADisable());
      await refreshSession();
      toast.success("Two-factor authentication has been disabled.");
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to disable 2FA. Verify password.");
      dispatch(setError(msg));
    } finally {
      dispatch(setDisableLoading(false));
    }
  };

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    dispatch(setSavingSettings(true));
    dispatch(setError(null));

    try {
      await updateOrgSecurity({
        requireTwoFactor: policyForm.requireTwoFactor,
        sessionTimeoutMinutes: Number(policyForm.sessionTimeoutMinutes),
        passwordMinLength: Number(policyForm.passwordMinLength),
        passwordExpiresDays: Number(policyForm.passwordExpiresDays),
        allowedEmailDomains: policyForm.allowedEmailDomains,
      }).unwrap();
      toast.success("Organization security policies updated.");
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to save security settings.");
      dispatch(setError(msg));
    } finally {
      dispatch(setSavingSettings(false));
    }
  };

  const handleAddDomain = () => {
    const domain = policyForm.newDomain.trim().toLowerCase();
    if (domain && !policyForm.allowedEmailDomains.includes(domain)) {
      dispatch(
        updatePolicyField("allowedEmailDomains", [
          ...policyForm.allowedEmailDomains,
          domain,
        ]),
      );
      dispatch(updatePolicyField("newDomain", ""));
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    dispatch(
      updatePolicyField(
        "allowedEmailDomains",
        policyForm.allowedEmailDomains.filter((d) => d !== domainToRemove),
      ),
    );
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    dispatch(setCopiedSecret(true));
    setTimeout(() => dispatch(setCopiedSecret(false)), 2000);
  };

  const twoFactorEnabled = Boolean(user?.twoFactorEnabled);

  return (
    <div className="space-y-5">
      {/* Elevated Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm">
                Security &amp; Compliance
              </Chip>
              <Chip variant={twoFactorEnabled ? "success" : "warning"} size="sm">
                2FA: {twoFactorEnabled ? "Active" : "Disabled"}
              </Chip>
              <Chip variant="neutral" size="sm">
                {canEdit ? "Admin access" : "Read-only"}
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Security Policies &amp; Authentication
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Configure tenant-wide access rules, enforce mandatory two-factor authenticator app logins, and manage allowed email domains.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${securityQuery.isFetching ? "animate-spin" : ""}`} />}
              disabled={securityQuery.isFetching}
              onClick={() => void securityQuery.refetch()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Banner
          variant="danger"
          size="sm"
          description={error}
          dismissible
          onDismiss={() => dispatch(setError(null))}
        />
      )}

      {/* Section 1: User Account 2FA */}
      <UserTwoFactorCard
        twoFactorEnabled={twoFactorEnabled}
        onOpenSetup={handleOpen2FASetup}
        onOpenDisable={() => dispatch(open2FADisable())}
      />

      {/* Section 2: Organization-Wide Security Policies */}
      <OrgSecurityPoliciesCard
        policyForm={policyForm}
        loading={loading}
        savingSettings={savingSettings}
        canEdit={canEdit}
        onFieldChange={(field, value) => dispatch(updatePolicyField(field, value))}
        onAddDomain={handleAddDomain}
        onRemoveDomain={handleRemoveDomain}
        onSubmit={handleSavePolicies}
      />

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={is2FAModalOpen}
        setupStep={setupStep}
        totpSecret={totpSecret}
        qrCodeDataUrl={qrCodeDataUrl}
        totpCode={totpCode}
        backupCodes={backupCodes}
        totpLoading={totpLoading}
        copiedSecret={copiedSecret}
        error={error}
        onClose={() => dispatch(close2FASetup())}
        onTotpCodeChange={(code) => dispatch(setTotpCode(code))}
        onConfirm={handleConfirm2FA}
        onCopy={copyToClipboard}
      />

      {/* Disable 2FA Modal */}
      <TwoFactorDisableModal
        isOpen={isDisableModalOpen}
        disablePassword={disablePassword}
        disableLoading={disableLoading}
        showDisablePassword={showDisablePassword}
        error={error}
        onClose={() => dispatch(close2FADisable())}
        onPasswordChange={(val) => dispatch(setDisablePassword(val))}
        onToggleShowPassword={() => dispatch(toggleShowDisablePassword())}
        onSubmit={handleDisable2FA}
      />
    </div>
  );
};
