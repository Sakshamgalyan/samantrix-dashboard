"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { OrgSecuritySettings } from "@/types/dashboard";
import {
  Banner,
  Button,
  Card,
  Chip,
  Input,
  Modal,
  Skeleton,
  Spinner,
  Toggle,
  Typography,
  useToast,
} from "@galyan/ui";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Copy,
  Check,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface PolicyFormState {
  requireTwoFactor: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordExpiresDays: number;
  allowedEmailDomains: string[];
  newDomain: string;
}

interface TwoFactorSetupResponse {
  secret?: string;
  qrCodeDataUrl?: string;
}

interface TwoFactorEnableResponse {
  backupCodes?: string[];
}

const SETUP_FORM_ID = "security-2fa-setup-form";
const DISABLE_FORM_ID = "security-2fa-disable-form";

const FACTS = [
  { label: "Standard RFC 6238", value: "Compatible with Google, Microsoft and 1Password", tone: "text-[var(--gy-text)]" },
  { label: "Secret storage", value: "AES-256-GCM encrypted at rest", tone: "text-[var(--gy-success)]" },
  { label: "Backup recovery", value: "SHA-256 hashed single-use codes", tone: "text-[var(--gy-text)]" },
];

export default function SecurityPage() {
  const { user, isOwner, isAdmin, refreshSession } = useAuth();
  const { toast } = useToast();
  const canEdit = isOwner || isAdmin;
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA Setup Modal State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<"SETUP" | "BACKUP">("SETUP");
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpLoading, setTotpLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // 2FA Disable Modal State
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  // Policy Form State
  const [policyForm, setPolicyForm] = useState<PolicyFormState>({
    requireTwoFactor: false,
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    passwordExpiresDays: 90,
    allowedEmailDomains: [],
    newDomain: "",
  });

  const fetchData = useCallback(
    () =>
      api
        .get<OrgSecuritySettings>("/organizations/me/security")
        .then((data) => {
          setError(null);
          if (data) {
            setPolicyForm({
              requireTwoFactor: data.requireTwoFactor || false,
              sessionTimeoutMinutes: data.sessionTimeoutMinutes || 60,
              passwordMinLength: data.passwordMinLength || 8,
              passwordExpiresDays: data.passwordExpiresDays || 90,
              allowedEmailDomains: data.allowedEmailDomains || [],
              newDomain: "",
            });
          }
        })
        .catch((err: unknown) => {
          setError(err instanceof ApiError ? err.message : "Failed to load security policies.");
        })
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Open 2FA setup flow
  const handleOpen2FASetup = async () => {
    setIs2FAModalOpen(true);
    setSetupStep("SETUP");
    setTotpCode("");
    setTotpSecret(null);
    setQrCodeDataUrl(null);
    setTotpLoading(true);
    setError(null);
    try {
      const res = await api.post<TwoFactorSetupResponse>("/auth/2fa/setup");
      if (res) {
        setTotpSecret(res.secret ?? null);
        setQrCodeDataUrl(res.qrCodeDataUrl ?? null);
      }
    } catch {
      setError("Failed to initialize two-factor authenticator setup.");
    } finally {
      setTotpLoading(false);
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpSecret || !totpCode.trim()) return;
    setTotpLoading(true);
    setError(null);
    try {
      const res = await api.post<TwoFactorEnableResponse>("/auth/2fa/enable", {
        secret: totpSecret,
        code: totpCode.trim(),
      });
      if (res && res.backupCodes) {
        setBackupCodes(res.backupCodes);
        setSetupStep("BACKUP");
        await refreshSession();
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid code. Authenticator check failed.";
      setError(msg);
    } finally {
      setTotpLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;
    setDisableLoading(true);
    setError(null);
    try {
      await api.post("/auth/2fa/disable", { password: disablePassword });
      setIsDisableModalOpen(false);
      setDisablePassword("");
      await refreshSession();
      toast.success("Two-factor authentication has been disabled.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to disable 2FA. Verify password.";
      setError(msg);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSavingSettings(true);
    setError(null);

    try {
      await api.patch("/organizations/me/security", {
        requireTwoFactor: policyForm.requireTwoFactor,
        sessionTimeoutMinutes: Number(policyForm.sessionTimeoutMinutes),
        passwordMinLength: Number(policyForm.passwordMinLength),
        passwordExpiresDays: Number(policyForm.passwordExpiresDays),
        allowedEmailDomains: policyForm.allowedEmailDomains,
      });
      await fetchData();
      toast.success("Organization security policies updated.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save security settings.";
      setError(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddDomain = () => {
    const domain = policyForm.newDomain.trim().toLowerCase();
    if (domain && !policyForm.allowedEmailDomains.includes(domain)) {
      setPolicyForm((prev) => ({
        ...prev,
        allowedEmailDomains: [...prev.allowedEmailDomains, domain],
        newDomain: "",
      }));
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setPolicyForm((prev) => ({
      ...prev,
      allowedEmailDomains: prev.allowedEmailDomains.filter((d) => d !== domainToRemove),
    }));
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const closeDisableModal = () => {
    setIsDisableModalOpen(false);
    setDisablePassword("");
    setShowDisablePassword(false);
  };

  const twoFactorEnabled = Boolean(user?.twoFactorEnabled);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="p" className="text-sm text-[var(--gy-text-secondary)]">
          Configure multi-factor authentication, account protection and tenant-wide security policies.
        </Typography>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={() => void fetchData()}
        >
          Refresh policies
        </Button>
      </div>

      {error && (
        <Banner variant="danger" description={error} dismissible onDismiss={() => setError(null)} />
      )}

      {/* Section 1: User Account 2FA */}
      <Card variant="default" padding="lg" radius="xl" className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-[var(--gy-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                twoFactorEnabled
                  ? "bg-[var(--gy-success)]/15 text-[var(--gy-success)]"
                  : "bg-[var(--gy-warning)]/15 text-[var(--gy-warning)]"
              }`}
            >
              {twoFactorEnabled ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant="h3" weight="bold" className="text-base text-[var(--gy-text)]">
                  Your two-factor authentication
                </Typography>
                <Chip size="sm" variant={twoFactorEnabled ? "success" : "warning"}>
                  {twoFactorEnabled ? "Active" : "Disabled"}
                </Chip>
              </div>
              <p className="mt-0.5 text-sm text-[var(--gy-text-secondary)]">
                {twoFactorEnabled
                  ? "Your account requires an authenticator code or emergency recovery code during login."
                  : "Protect administrative actions by attaching a standard TOTP authenticator application."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {twoFactorEnabled ? (
              <Button variant="danger-soft" onClick={() => setIsDisableModalOpen(true)}>
                Disable 2FA
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon={<KeyRound className="size-4" />}
                onClick={() => void handleOpen2FASetup()}
              >
                Configure authenticator
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="space-y-1 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4"
            >
              <span className="text-xs font-semibold text-[var(--gy-text-subtle)]">{fact.label}</span>
              <p className={`text-sm font-medium ${fact.tone}`}>{fact.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 2: Organization-Wide Security Policies */}
      <Card variant="default" padding="lg" radius="xl" className="space-y-6">
        <div>
          <Typography variant="h3" weight="bold" className="text-base text-[var(--gy-text)]">
            Organization security policies
          </Typography>
          <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
            Enforce compliance rules across all team members belonging to this tenant.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" height="4.5rem" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton variant="rectangular" height="4rem" />
              <Skeleton variant="rectangular" height="4rem" />
              <Skeleton variant="rectangular" height="4rem" />
            </div>
            <Skeleton variant="rectangular" height="4rem" />
          </div>
        ) : (
          <form onSubmit={handleSavePolicies} className="space-y-6">
            <div className="space-y-5">
              {/* Mandatory 2FA */}
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--gy-text)]">
                    Require two-factor auth for all members
                  </p>
                  <p className="text-xs text-[var(--gy-text-secondary)]">
                    When enabled, members without 2FA will be required to set up an authenticator on their next login.
                  </p>
                </div>
                <Toggle
                  checked={policyForm.requireTwoFactor}
                  isDisabled={!canEdit}
                  aria-label="Require two-factor auth for all members"
                  onChange={(e) =>
                    setPolicyForm((prev) => ({ ...prev, requireTwoFactor: e.target.checked }))
                  }
                />
              </div>

              {/* Inputs Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  type="number"
                  label="Session timeout (minutes)"
                  min={15}
                  max={1440}
                  fullWidth
                  value={policyForm.sessionTimeoutMinutes}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      sessionTimeoutMinutes: Number(e.target.value),
                    }))
                  }
                />
                <Input
                  type="number"
                  label="Minimum password length"
                  min={8}
                  max={64}
                  fullWidth
                  value={policyForm.passwordMinLength}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      passwordMinLength: Number(e.target.value),
                    }))
                  }
                />
                <Input
                  type="number"
                  label="Password rotation (days)"
                  min={0}
                  max={365}
                  fullWidth
                  value={policyForm.passwordExpiresDays}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      passwordExpiresDays: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* Allowed Domains */}
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      label="Allowed email domains for team invitations"
                      placeholder="e.g. acme.com"
                      fullWidth
                      leftIcon={<Globe className="size-4" />}
                      value={policyForm.newDomain}
                      disabled={!canEdit}
                      onChange={(e) => setPolicyForm((prev) => ({ ...prev, newDomain: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDomain();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!canEdit || !policyForm.newDomain.trim()}
                    onClick={handleAddDomain}
                  >
                    Add domain
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {policyForm.allowedEmailDomains.length === 0 ? (
                    <span className="text-xs text-[var(--gy-text-subtle)]">
                      No domain restrictions enforced (any email domain can be invited).
                    </span>
                  ) : (
                    policyForm.allowedEmailDomains.map((dom) => (
                      <Chip
                        key={dom}
                        variant="soft"
                        size="md"
                        icon={<Globe className="size-3" />}
                        removable={canEdit}
                        onRemove={() => handleRemoveDomain(dom)}
                      >
                        {dom}
                      </Chip>
                    ))
                  )}
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={savingSettings} loadingText="Saving changes...">
                  Save security policies
                </Button>
              </div>
            )}
          </form>
        )}
      </Card>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        size="md"
        icon={<ShieldCheck className="size-4" />}
        title={setupStep === "SETUP" ? "Set up authenticator app" : "Save recovery backup codes"}
        footer={
          setupStep === "SETUP" ? (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIs2FAModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form={SETUP_FORM_ID}
                variant="primary"
                disabled={totpCode.length !== 6 || totpLoading}
              >
                Verify &amp; enable
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                leftIcon={
                  copiedSecret ? (
                    <Check className="size-4 text-[var(--gy-success)]" />
                  ) : (
                    <Copy className="size-4" />
                  )
                }
                onClick={() => copyToClipboard(backupCodes.join("\n"))}
              >
                {copiedSecret ? "Copied" : "Copy codes"}
              </Button>
              <Button variant="primary" onClick={() => setIs2FAModalOpen(false)}>
                Done
              </Button>
            </div>
          )
        }
      >
        {setupStep === "SETUP" ? (
          <form id={SETUP_FORM_ID} onSubmit={handleConfirm2FA} className="space-y-5">
            {error && <Banner variant="danger" size="sm" description={error} />}
            {totpLoading && !totpSecret ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--gy-text-secondary)]">
                <Spinner size="sm" color="primary" />
                <span>Generating TOTP secret and QR code...</span>
              </div>
            ) : (
              <div className="grid items-center gap-5 sm:grid-cols-12">
                <div className="flex flex-col items-center rounded-2xl bg-white p-3 sm:col-span-5">
                  {qrCodeDataUrl && (
                    <img src={qrCodeDataUrl} alt="Authenticator QR code" className="size-36 object-contain" />
                  )}
                </div>

                <div className="space-y-4 sm:col-span-7">
                  <Input
                    type="text"
                    label="Manual setup key"
                    readOnly
                    fullWidth
                    className="font-mono"
                    value={totpSecret || ""}
                    rightIcon={
                      copiedSecret ? (
                        <Check className="size-4 text-[var(--gy-success)]" />
                      ) : (
                        <Copy className="size-4" />
                      )
                    }
                    onRightIconClick={() => copyToClipboard(totpSecret || "")}
                    helperText="Scan the QR code, or enter this key in your app."
                  />
                  <Input
                    type="text"
                    label="6-digit verification code"
                    inputMode="numeric"
                    maxLength={6}
                    fullWidth
                    className="font-mono tracking-widest"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.trim())}
                    placeholder="123456"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <Banner
              variant="warning"
              description="Save these recovery codes. Each code can be used once to access your account if your device is unavailable."
            />
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3 font-mono text-sm text-[var(--gy-text)]">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="rounded-md bg-[var(--gy-surface)] p-1.5 text-center tracking-widest">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        isOpen={isDisableModalOpen}
        onClose={closeDisableModal}
        size="sm"
        icon={<ShieldAlert className="size-4" />}
        title="Confirm disabling 2FA"
        subtitle="Enter your account password to confirm removal of two-factor authentication."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeDisableModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={DISABLE_FORM_ID}
              variant="danger"
              disabled={disableLoading || !disablePassword}
              isLoading={disableLoading}
              loadingText="Disabling..."
            >
              Disable 2FA
            </Button>
          </div>
        }
      >
        <form id={DISABLE_FORM_ID} onSubmit={handleDisable2FA} className="space-y-4">
          {error && <Banner variant="danger" size="sm" description={error} />}
          <Input
            type={showDisablePassword ? "text" : "password"}
            fullWidth
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Enter current password"
            aria-label="Current password"
            required
            autoFocus
            leftIcon={<Lock className="size-4" />}
            rightIcon={showDisablePassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            onRightIconClick={() => setShowDisablePassword((v) => !v)}
          />
        </form>
      </Modal>
    </div>
  );
}
