"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Dropdown,
  DropdownOption,
  Banner,
  useToast,
} from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Organization, OrgSettings } from "@/types/dashboard";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";

interface ProfileForm {
  name: string;
  legalName: string;
  website: string;
  industry: string;
  companySize: string;
  businessEmail: string;
  businessPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface SettingsData {
  orgData: Organization | null;
  settingsData: OrgSettings | null;
}

const INDUSTRY_OPTIONS: DropdownOption[] = [
  "Software & Technology",
  "Financial Services",
  "Healthcare & BioTech",
  "Digital Media & Creative",
  "Consulting & Professional",
  "Manufacturing & Retail",
  "Other",
].map((v) => ({ value: v, label: v }));

const COMPANY_SIZE_OPTIONS: DropdownOption[] = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const TIMEZONE_OPTIONS: DropdownOption[] = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
];

const LOCALE_OPTIONS: DropdownOption[] = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "de-DE", label: "Deutsch (Deutschland)" },
  { value: "fr-FR", label: "Français (France)" },
  { value: "ja-JP", label: "日本語 (日本)" },
];

async function loadSettings(): Promise<SettingsData> {
  const [orgData, settingsData] = await Promise.all([
    api.get<Organization>("/organizations/me"),
    api.get<OrgSettings>("/organizations/me/settings").catch(() => null),
  ]);
  return { orgData: orgData ?? null, settingsData };
}

function toProfileForm(orgData: Organization): ProfileForm {
  return {
    name: orgData.name || "",
    legalName: orgData.legalName || "",
    website: orgData.website || "",
    industry: orgData.industry || "Software & Technology",
    companySize: orgData.companySize || "1-10",
    businessEmail: orgData.businessEmail || "",
    businessPhone: orgData.businessPhone || "",
    address: orgData.address || "",
    city: orgData.city || "",
    state: orgData.state || "",
    country: orgData.country || "United States",
  };
}

export default function SettingsPage() {
  const { isOwner, isAdmin, refreshSession } = useAuth();
  const { toast } = useToast();
  const canEdit = isOwner || isAdmin;

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    legalName: "",
    website: "",
    industry: "",
    companySize: "",
    businessEmail: "",
    businessPhone: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const [settingsForm, setSettingsForm] = useState<OrgSettings>({
    id: "",
    organizationId: "",
    timezone: "UTC",
    locale: "en-US",
    defaultRole: "MEMBER",
    allowMemberInvites: false,
    retentionDays: 365,
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danger zone state
  const [confirmName, setConfirmName] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const applySettings = useCallback(({ orgData, settingsData }: SettingsData) => {
    if (orgData) setProfileForm(toProfileForm(orgData));
    if (settingsData) setSettingsForm(settingsData);
  }, []);

  const handleLoadError = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "Failed to load settings.");
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      applySettings(await loadSettings());
    } catch (err) {
      handleLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [applySettings, handleLoadError]);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then((data) => {
        if (!cancelled) applySettings(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) handleLoadError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySettings, handleLoadError]);

  const updateProfile = (field: keyof ProfileForm, value: string) =>
    setProfileForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSavingProfile(true);
    setError(null);

    try {
      await api.patch("/organizations/me", {
        name: profileForm.name.trim(),
        legalName: profileForm.legalName.trim() || undefined,
        website: profileForm.website.trim() || undefined,
        industry: profileForm.industry,
        companySize: profileForm.companySize,
        businessEmail: profileForm.businessEmail.trim() || undefined,
        businessPhone: profileForm.businessPhone.trim() || undefined,
        address: profileForm.address.trim() || undefined,
        city: profileForm.city.trim() || undefined,
        state: profileForm.state.trim() || undefined,
        country: profileForm.country.trim() || undefined,
      });

      await refreshSession();
      toast.success("Organization profile updated successfully.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update profile.";
      setError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSavingSettings(true);
    setError(null);

    try {
      await api.patch("/organizations/me/settings", {
        timezone: settingsForm.timezone,
        locale: settingsForm.locale,
        defaultRole: settingsForm.defaultRole,
        allowMemberInvites: settingsForm.allowMemberInvites,
        retentionDays: Number(settingsForm.retentionDays),
      });

      await fetchData();
      toast.success("Workspace general configuration saved.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update workspace settings.";
      setError(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeactivate = async () => {
    if (!isOwner) return;
    if (confirmName !== profileForm.name) {
      setError("Organization name does not match confirmation value.");
      return;
    }

    setDeactivating(true);
    try {
      await api.patch("/organizations/me", { status: "SUSPENDED" });
      await refreshSession();
      toast.success("Organization has been deactivated.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to deactivate organization.";
      setError(msg);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="max-w-2xl text-sm text-[var(--gy-text-secondary)]">
          Manage your legal entity details, workspace locale defaults, and tenant governance.
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Banner
          variant="danger"
          title="Something went wrong"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Organization Profile */}
      <Card variant="elevated" radius="xl" padding="lg" isLoading={loading} skeletonLines={6}>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--gy-text)]">Organization profile</h2>
          <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
            Official company naming and regional operational attributes.
          </p>
        </CardHeader>
        <CardBody className="mt-5">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Display organization name"
                type="text"
                required
                value={profileForm.name}
                disabled={!canEdit}
                onChange={(e) => updateProfile("name", e.target.value)}
                fullWidth
              />
              <Input
                label="Legal registered entity name"
                type="text"
                value={profileForm.legalName}
                disabled={!canEdit}
                onChange={(e) => updateProfile("legalName", e.target.value)}
                placeholder="e.g. Acme Innovations Inc."
                fullWidth
              />
              <Dropdown
                label="Primary industry"
                options={INDUSTRY_OPTIONS}
                value={profileForm.industry}
                disabled={!canEdit}
                onChange={(val) => updateProfile("industry", val)}
              />
              <Dropdown
                label="Company size"
                options={COMPANY_SIZE_OPTIONS}
                value={profileForm.companySize}
                disabled={!canEdit}
                onChange={(val) => updateProfile("companySize", val)}
              />
              <Input
                label="Official website"
                type="url"
                value={profileForm.website}
                disabled={!canEdit}
                onChange={(e) => updateProfile("website", e.target.value)}
                placeholder="https://acme.com"
                fullWidth
              />
              <Input
                label="Business contact email"
                type="email"
                value={profileForm.businessEmail}
                disabled={!canEdit}
                onChange={(e) => updateProfile("businessEmail", e.target.value)}
                placeholder="contact@acme.com"
                fullWidth
              />
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<Save className="size-3.5" />}
                  disabled={savingProfile}
                  isLoading={savingProfile}
                  loadingText="Saving profile..."
                >
                  Save profile details
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Workspace Defaults & Locale */}
      <Card variant="elevated" radius="xl" padding="lg" isLoading={loading} skeletonLines={3}>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--gy-text)]">Workspace locale & defaults</h2>
          <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
            Global date and time settings applied across your digital offices and calendar integrations.
          </p>
        </CardHeader>
        <CardBody className="mt-5">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Dropdown
                label="Workspace timezone"
                options={TIMEZONE_OPTIONS}
                value={settingsForm.timezone}
                disabled={!canEdit}
                searchable
                onChange={(val) => setSettingsForm((prev) => ({ ...prev, timezone: val }))}
              />
              <Dropdown
                label="Locale format"
                options={LOCALE_OPTIONS}
                value={settingsForm.locale}
                disabled={!canEdit}
                onChange={(val) => setSettingsForm((prev) => ({ ...prev, locale: val }))}
              />
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<Save className="size-3.5" />}
                  disabled={savingSettings}
                  isLoading={savingSettings}
                  loadingText="Saving settings..."
                >
                  Save locale defaults
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card
          variant="outlined"
          radius="xl"
          padding="lg"
          className="border-[var(--gy-danger)]/40 bg-[var(--gy-danger)]/5"
        >
          <CardHeader>
            <div className="flex items-center gap-2 text-[var(--gy-danger)]">
              <AlertTriangle className="size-5" />
              <h2 className="text-base font-semibold">Danger zone</h2>
            </div>
            <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
              Deactivating your organization will revoke member access and freeze virtual offices.
            </p>
          </CardHeader>
          <CardBody className="mt-4">
            <div className="max-w-md space-y-3">
              <p className="text-sm text-[var(--gy-text-secondary)]">
                Type <span className="font-semibold text-[var(--gy-text)]">{profileForm.name}</span> to
                confirm
              </p>
              <Input
                type="text"
                aria-label="Confirm organization name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Confirm organization name"
                fullWidth
              />
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeactivate}
                disabled={confirmName !== profileForm.name || deactivating}
                isLoading={deactivating}
                loadingText="Deactivating..."
              >
                Deactivate organization
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
