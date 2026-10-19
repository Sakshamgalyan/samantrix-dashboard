import type { ChipVariant } from "@galyan/ui";
import {
  Boxes,
  Globe,
  Laptop,
  LayoutDashboard,
  Monitor,
  Server,
  type LucideIcon,
} from "lucide-react";
import type {
  ReleaseApp,
  ReleaseChangeType,
  ReleaseChannel,
  ReleaseStatus,
} from "@/features/versioning/types";

export interface AppMetadata {
  label: string;
  description: string;
  icon: LucideIcon;
  badge: string;
}

export const APP_META: Record<ReleaseApp, AppMetadata> = {
  DESKTOP: {
    label: "Simantrix Desktop",
    description: "Electron 43 desktop shell",
    icon: Laptop,
    badge: "Desktop App",
  },
  BACKEND: {
    label: "Backend",
    description: "NestJS Central API & realtime",
    icon: Server,
    badge: "API / Gateway",
  },
  FRONTEND: {
    label: "Workplace",
    description: "Digital workplace web app",
    icon: Monitor,
    badge: "Web App",
  },
  DASHBOARD: {
    label: "Dashboard",
    description: "Developer & admin console",
    icon: LayoutDashboard,
    badge: "Admin UI",
  },
  HOME: {
    label: "Website",
    description: "Marketing & landing portal",
    icon: Globe,
    badge: "Portal",
  },
  UNITY: {
    label: "Unity",
    description: "Unity 6 3D WebGL office",
    icon: Boxes,
    badge: "3D Engine",
  },
};

export const getAppIcon = (app: ReleaseApp): LucideIcon => {
  return APP_META[app]?.icon ?? Laptop;
};

export const CHANNEL_META: Record<
  ReleaseChannel,
  { label: string; variant: ChipVariant; description: string }
> = {
  STABLE: {
    label: "Stable (Prod)",
    variant: "success",
    description: "Production desktop client builds for all users",
  },
  BETA: {
    label: "Beta (Pre-prod)",
    variant: "primary",
    description: "Candidate desktop builds for early testing",
  },
  CANARY: {
    label: "Canary (Nightly)",
    variant: "neutral",
    description: "Nightly experimental desktop builds",
  },
};

export const STATUS_META: Record<
  ReleaseStatus,
  { label: string; variant: ChipVariant }
> = {
  DRAFT: { label: "Staged Draft", variant: "neutral" },
  ROLLING_OUT: { label: "Rolling Out", variant: "warning" },
  RELEASED: { label: "Live in Prod", variant: "success" },
  ROLLED_BACK: { label: "Rolled Back", variant: "danger" },
};

export const ROLLOUT_PRESETS = [10, 25, 50, 75, 90] as const;

export const CHANGE_META: Record<
  ReleaseChangeType,
  { label: string; variant: ChipVariant }
> = {
  feature: { label: "Feature", variant: "success" },
  improvement: { label: "Improvement", variant: "primary" },
  fix: { label: "Fix", variant: "warning" },
};
