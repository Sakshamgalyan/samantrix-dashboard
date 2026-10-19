"use client";

import React, { useMemo, useState } from "react";
import { Avatar, Button, Chip, Dropdown, Input, Typography, useToast } from "@galyan/ui";
import { Mail, Save, UserRound } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { useAuth } from "@/features/auth";
import { developerRoleLabel } from "@/utils/roles";
import { formatDate } from "@/utils/format";
import { errorMessage, useUpdateAccountProfileMutation, type AccountProfile } from "@/features/admin-settings/account/api";

const FALLBACK_ZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
  "UTC",
];

const timezoneOptions = () => {
  let zones = FALLBACK_ZONES;
  try {
    const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone");
    if (all?.length) zones = all;
  } catch {
    // Older browsers: short list
  }
  return zones.map((z) => ({ value: z, label: z.replace(/_/g, " ") }));
};

/** Name, phone and timezone; email is fixed (it identifies the account). */
export const ProfileCard = ({ profile }: { profile: AccountProfile }) => {
  const { toast } = useToast();
  const [updateProfile] = useUpdateAccountProfileMutation();
  const { refreshSession } = useAuth();
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "Asia/Kolkata");
  const [saving, setSaving] = useState(false);
  const zones = useMemo(() => timezoneOptions(), []);

  const nameError = fullName.trim().length < 2 ? "Enter your name" : undefined;
  const phoneError =
    phone.trim() && !/^\+?[0-9 ()-]{6,20}$/.test(phone.trim()) ? "Enter a valid phone number" : undefined;
  const dirty =
    fullName.trim() !== profile.fullName ||
    phone.trim() !== (profile.phone ?? "") ||
    timezone !== (profile.timezone ?? "Asia/Kolkata");

  const save = async () => {
    setSaving(true);
    try {
      // The saved profile replaces the cached one, which re-keys (and resets) this form
      await updateProfile({ fullName: fullName.trim(), phone: phone.trim(), timezone }).unwrap();
      void refreshSession();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(errorMessage(err, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  const role = profile.userType === "DEVELOPER" ? developerRoleLabel(profile.platformRole) : "Organization";

  return (
    <GlassSection
      title="Profile"
      subtitle="How you appear to your team"
      aside={
        dirty && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="size-3.5" />}
            isLoading={saving}
            disabled={Boolean(nameError || phoneError)}
            onClick={() => void save()}
          >
            Save
          </Button>
        )
      }
    >
      <div className="flex items-center gap-3 pb-3">
        <Avatar name={profile.fullName} src={profile.avatarUrl ?? undefined} size="md" />
        <div className="min-w-0">
          <Typography variant="p" weight="semibold" textColor="var(--gy-text)" className="truncate text-sm">
            {profile.fullName}
          </Typography>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--gy-text-secondary)] mt-0.5">
            <Chip size="sm" variant="soft">
              {role}
            </Chip>
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
              Member since {formatDate(profile.createdAt)}
            </Typography>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Full name"
          size="sm"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={dirty ? nameError : undefined}
          leftIcon={<UserRound className="size-3.5" />}
        />
        <Input
          label="Email"
          size="sm"
          value={profile.email}
          isDisabled
          leftIcon={<Mail className="size-3.5" />}
          helperText={profile.isEmailVerified ? "Verified" : "Not verified"}
        />
        <Input
          label="Phone"
          size="sm"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={phoneError}
        />
        <Dropdown
          label="Timezone"
          size="sm"
          options={zones}
          value={timezone}
          onChange={(v: string) => setTimezone(v)}
          searchable
          searchPlaceholder="Search timezones"
        />
      </div>
    </GlassSection>
  );
};

