import type { ChipVariant } from "@galyan/ui";
import type { ReleaseApp, ReleaseChannel, ReleaseStatus } from "../types";

export const APP_META: Record<ReleaseApp, { label: string; description: string }> =
  {
    BACKEND: { label: "Backend", description: "Central API & realtime" },
    FRONTEND: { label: "Workplace", description: "Digital workplace web app" },
    DASHBOARD: { label: "Dashboard", description: "Admin console" },
    HOME: { label: "Home", description: "Marketing portal" },
    DESKTOP: { label: "Desktop", description: "Electron desktop app" },
    UNITY: { label: "Unity", description: "3D office client" },
  };

export const CHANNEL_META: Record<
  ReleaseChannel,
  { label: string; variant: ChipVariant }
> = {
  STABLE: { label: "Stable", variant: "soft" },
  BETA: { label: "Beta", variant: "outline" },
  CANARY: { label: "Canary", variant: "neutral" },
};

export const STATUS_META: Record<
  ReleaseStatus,
  { label: string; variant: ChipVariant }
> = {
  DRAFT: { label: "Draft", variant: "neutral" },
  ROLLING_OUT: { label: "Rolling out", variant: "warning" },
  RELEASED: { label: "Released", variant: "success" },
  ROLLED_BACK: { label: "Rolled back", variant: "danger" },
};

export const ROLLOUT_PRESETS = [5, 10, 25, 50, 75] as const;
