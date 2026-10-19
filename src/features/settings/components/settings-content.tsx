"use client";

import React, { useEffect } from "react";
import { Banner, Button, Card, Chip, Typography, useToast } from "@galyan/ui";
import { Building2, RotateCw, ShieldCheck, Sliders } from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import type { Organization } from "@/types/dashboard";
import {
  useGetOrgSettingsQuery,
  useUpdateOrgProfileMutation,
  useUpdateOrgSettingsMutation,
} from "@/features/settings/context/api";
import { useSettings } from "@/features/settings/context";
import {
  setProfileForm,
  updateProfileField,
  setSettingsForm,
  updateSettingsField,
  setSavingProfile,
  setSavingSettings,
  setError,
  setConfirmName,
  setDeactivating,
} from "@/features/settings/context/action";
import type { ProfileForm } from "@/features/settings/types/api";
import { OrganizationProfileCard } from "@/features/settings/components/organization-profile-card";
import { WorkspaceDefaultsCard } from "@/features/settings/components/workspace-defaults-card";
import { DangerZoneCard } from "@/features/settings/components/danger-zone-card";

const toProfileForm = (orgData: Organization): ProfileForm => ({
  name: orgData.name || "",
  legalName: orgData.legalName || "",
  website: orgData.website || "",
  industry: orgData.industry || "Software & Technology",
  companySize: orgData.companySize || "1-10",
  businessEmail: orgData.businessEmail || "",
  secondaryEmail: orgData.secondaryEmail || "",
  businessPhone: orgData.businessPhone || "",
  address: orgData.address || "",
  city: orgData.city || "",
  state: orgData.state || "",
  country: orgData.country || "United States",
});

export const SettingsContent = () => {
  const { organization, isOwner, isAdmin, refreshSession } = useAuth();
  const { toast } = useToast();
  const canEdit = isOwner || isAdmin;

  const { state, dispatch } = useSettings();
  const {
    profileForm,
    settingsForm,
    savingProfile,
    savingSettings,
    error,
    confirmName,
    deactivating,
  } = state;

  const settingsQuery = useGetOrgSettingsQuery();
  const [updateOrgProfile] = useUpdateOrgProfileMutation();
  const [updateOrgSettings] = useUpdateOrgSettingsMutation();
  const loading = settingsQuery.isLoading;

  // Sync server data into state
  useEffect(() => {
    if (organization) {
      dispatch(setProfileForm(toProfileForm(organization)));
    }
  }, [organization, dispatch]);

  useEffect(() => {
    if (settingsQuery.data) {
      dispatch(setSettingsForm(settingsQuery.data));
    }
  }, [settingsQuery.data, dispatch]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    dispatch(setSavingProfile(true));
    dispatch(setError(null));

    try {
      await updateOrgProfile({
        name: profileForm.name.trim(),
        legalName: profileForm.legalName.trim() || undefined,
        website: profileForm.website.trim() || undefined,
        industry: profileForm.industry,
        companySize: profileForm.companySize,
        businessEmail: profileForm.businessEmail.trim() || undefined,
        secondaryEmail: profileForm.secondaryEmail.trim() || undefined,
        businessPhone: profileForm.businessPhone.trim() || undefined,
        address: profileForm.address.trim() || undefined,
        city: profileForm.city.trim() || undefined,
        state: profileForm.state.trim() || undefined,
        country: profileForm.country.trim() || undefined,
      }).unwrap();

      await refreshSession();
      toast.success("Organization profile updated successfully.");
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to update profile.");
      dispatch(setError(msg));
    } finally {
      dispatch(setSavingProfile(false));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    dispatch(setSavingSettings(true));
    dispatch(setError(null));

    try {
      await updateOrgSettings({
        timezone: settingsForm.timezone,
        locale: settingsForm.locale,
        defaultRole: settingsForm.defaultRole,
        allowMemberInvites: settingsForm.allowMemberInvites,
        retentionDays: Number(settingsForm.retentionDays),
      }).unwrap();
      toast.success("Workspace general configuration saved.");
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to update workspace settings.");
      dispatch(setError(msg));
    } finally {
      dispatch(setSavingSettings(false));
    }
  };

  const handleDeactivate = async () => {
    if (!isOwner) return;
    if (confirmName !== profileForm.name) {
      dispatch(setError("Organization name does not match confirmation value."));
      return;
    }

    dispatch(setDeactivating(true));
    try {
      await updateOrgProfile({ status: "SUSPENDED" }).unwrap();
      await refreshSession();
      toast.success("Organization has been deactivated.");
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to deactivate organization.");
      dispatch(setError(msg));
    } finally {
      dispatch(setDeactivating(false));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm" icon={<Sliders className="size-3" />}>
                Tenant Settings
              </Chip>
              {organization?.name && (
                <Chip variant="outline" size="sm" icon={<Building2 className="size-3" />}>
                  {organization.name}
                </Chip>
              )}
              {profileForm.industry && (
                <Chip variant="neutral" size="sm" icon={<ShieldCheck className="size-3" />}>
                  {profileForm.industry}
                </Chip>
              )}
              {canEdit ? (
                <Chip variant="success" size="sm">
                  Admin Privileges Active
                </Chip>
              ) : (
                <Chip variant="neutral" size="sm">
                  Read-only Access
                </Chip>
              )}
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Organization & Workspace Settings
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Configure core tenant profile information, legal and contact entity addresses, default workspace behavior, retention policies, and security parameters.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${settingsQuery.isFetching ? "animate-spin" : ""}`} />}
              disabled={settingsQuery.isFetching}
              onClick={() => void settingsQuery.refetch()}
              className="w-full sm:w-auto"
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
          bannerStyle="subtle"
          title="Something went wrong"
          description={error}
          dismissible
          onDismiss={() => dispatch(setError(null))}
        />
      )}

      {/* Organization Profile */}
      <OrganizationProfileCard
        profileForm={profileForm}
        canEdit={canEdit}
        loading={loading}
        saving={savingProfile}
        onChange={(field, value) => dispatch(updateProfileField(field, value))}
        onSubmit={handleSaveProfile}
      />

      {/* Workspace Defaults & Locale */}
      <WorkspaceDefaultsCard
        settingsForm={settingsForm}
        canEdit={canEdit}
        loading={loading}
        saving={savingSettings}
        onChange={(field, value) => dispatch(updateSettingsField(field, value))}
        onSubmit={handleSaveSettings}
      />

      {/* Danger Zone */}
      {isOwner && (
        <DangerZoneCard
          organizationName={profileForm.name}
          confirmName={confirmName}
          deactivating={deactivating}
          onConfirmNameChange={(val) => dispatch(setConfirmName(val))}
          onDeactivate={handleDeactivate}
        />
      )}
    </div>
  );
};
