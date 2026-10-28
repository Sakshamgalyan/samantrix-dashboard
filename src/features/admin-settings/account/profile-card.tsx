"use client";

import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  Input,
  Typography,
  useToast,
  type UploadedFileItem,
} from "@galyan/ui";
import { Camera, Mail, Save, UserRound, Trash2 } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { useAuth } from "@/features/auth";
import { developerRoleLabel } from "@/utils/roles";
import { formatDate } from "@/utils/format";
import {
  errorMessage,
  uploadFileToStorage,
  useGetUploadUrlMutation,
  useUpdateAccountProfileMutation,
  type AccountProfile,
} from "@/features/admin-settings/account/api";

const AvatarUploadModal = dynamic(
  () =>
    import("@/features/admin-settings/account/avatar-upload-modal").then(
      (m) => m.AvatarUploadModal,
    ),
  { ssr: false },
);

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
    const all = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (all?.length) zones = all;
  } catch {
    // Older browsers: short list
  }
  return zones.map((z) => ({ value: z, label: z.replace(/_/g, " ") }));
};

/** Name, phone, timezone, and profile picture avatar; email is fixed (it identifies the account). */
export const ProfileCard = ({ profile }: { profile: AccountProfile }) => {
  const { toast } = useToast();
  const [updateProfile] = useUpdateAccountProfileMutation();
  const [getUploadUrl] = useGetUploadUrlMutation();
  const { refreshSession } = useAuth();
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "Asia/Kolkata");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>(
    profile.avatarUrl
      ? [
          {
            id: "current-avatar",
            name: "Current avatar",
            status: "completed",
            progress: 100,
            url: profile.avatarUrl,
          },
        ]
      : [],
  );

  const zones = useMemo(() => timezoneOptions(), []);

  const nameError = fullName.trim().length < 2 ? "Enter your name" : undefined;
  const phoneError =
    phone.trim() && !/^\+?[0-9 ()-]{6,20}$/.test(phone.trim())
      ? "Enter a valid phone number"
      : undefined;

  const dirty =
    fullName.trim() !== profile.fullName ||
    phone.trim() !== (profile.phone ?? "") ||
    timezone !== (profile.timezone ?? "Asia/Kolkata") ||
    (avatarUrl.trim() || null) !== (profile.avatarUrl ?? null);

  const handleAvatarFileSelected = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be 5MB or smaller");
      return;
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9_\-\. ]/g, "_");
    const mimeType = file.type || "image/png";

    setIsUploading(true);
    setUploadedFiles([
      {
        id: "uploading",
        name: file.name,
        size: file.size,
        type: mimeType,
        status: "uploading",
        progress: 25,
      },
    ]);

    try {
      const presigned = await getUploadUrl({
        fileName: safeFileName,
        contentType: mimeType,
        folder: "avatars",
      }).unwrap();

      setUploadedFiles([
        {
          id: presigned.key,
          name: file.name,
          size: file.size,
          type: mimeType,
          status: "uploading",
          progress: 65,
        },
      ]);

      await uploadFileToStorage(presigned.uploadUrl, file, mimeType);

      setAvatarUrl(presigned.fileUrl);
      setUploadedFiles([
        {
          id: presigned.key,
          name: file.name,
          size: file.size,
          type: mimeType,
          status: "completed",
          progress: 100,
          url: presigned.fileUrl,
        },
      ]);

      toast.success(
        "Avatar uploaded to storage provider! Click Save to apply changes.",
      );
      setIsUploadModalOpen(false);
    } catch (err) {
      setUploadedFiles([]);
      toast.error(
        errorMessage(err, "Failed to upload avatar to storage provider."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setUploadedFiles([]);
  };

  const save = async () => {
    setSaving(true);
    try {
      // The saved profile replaces the cached one, which re-keys (and resets) this form
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        timezone,
        avatarUrl: avatarUrl.trim() || null,
      }).unwrap();
      void refreshSession();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(errorMessage(err, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  const role =
    profile.userType === "DEVELOPER"
      ? developerRoleLabel(profile.platformRole)
      : "Organization";

  return (
    <GlassSection
      title="Profile"
      subtitle="How you appear to your team across the developer console"
      aside={
        dirty && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="size-3.5" />}
            isLoading={saving || isUploading}
            disabled={Boolean(nameError || phoneError || isUploading)}
            onClick={() => void save()}
          >
            Save
          </Button>
        )
      }
    >
      <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--gy-border)]">
        <div className="relative inline-block">
          <Avatar
            name={fullName || profile.fullName}
            src={avatarUrl.trim() || undefined}
            size="lg"
            className="ring-2 ring-[var(--gy-primary)]/20 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsUploadModalOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[var(--gy-primary)] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-[var(--gy-surface)]"
            title="Change avatar"
            aria-label="Change avatar"
          >
            <Camera className="size-3" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <Typography
            variant="p"
            weight="semibold"
            textColor="var(--gy-text)"
            className="truncate text-sm sm:text-base"
          >
            {fullName || profile.fullName}
          </Typography>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--gy-text-secondary)] mt-0.5">
            <Chip size="sm" variant="soft">
              {role}
            </Chip>
            <Typography
              variant="small"
              textColor="var(--gy-text-secondary)"
              className="text-xs"
            >
              Member since {formatDate(profile.createdAt)}
            </Typography>
          </div>
        </div>
        {avatarUrl.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            leftIcon={<Trash2 className="size-3 text-[var(--gy-error)]" />}
            onClick={handleRemoveAvatar}
            className="text-xs text-[var(--gy-text-secondary)] hover:text-[var(--gy-error)]"
          >
            Remove avatar
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 pt-2">
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

      <AvatarUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadedFiles={uploadedFiles}
        isUploading={isUploading}
        onFilesSelected={(files) => void handleAvatarFileSelected(files)}
        onRemoveFile={handleRemoveAvatar}
      />
    </GlassSection>
  );
};
