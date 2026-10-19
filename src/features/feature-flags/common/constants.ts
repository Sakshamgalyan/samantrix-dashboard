import type { ElementType } from "react";
import {
  Bot,
  BarChart3,
  Cpu,
  KeyRound,
  FileSpreadsheet,
  Blocks,
  ShieldCheck,
  Building2,
  Video,
  Sparkles,
  MessageSquare,
  Volume2,
  PenTool,
  Film,
  Kanban,
  ScrollText,
  Palette,
  Fingerprint,
} from "lucide-react";
import type { ChipVariant } from "@galyan/ui";
import type { PlanTier } from "@/features/feature-flags/types";

export const ALL_CATEGORIES = "ALL";
export const DEFAULT_CATEGORY = "General";

/** Offered in the category picker alongside the categories already in use. */
export const CATEGORY_SUGGESTIONS = [
  "General",
  "Workplace",
  "Intelligence",
  "Communication",
  "Meetings",
  "Collaboration",
  "Analytics",
  "Operations",
  "Security",
  "Integrations",
  "Reporting",
  "Administration",
];

export const PLAN_TIERS: PlanTier[] = [
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
];

export const PLAN_META: Record<
  PlanTier,
  { label: string; variant: ChipVariant; description: string }
> = {
  FREE: {
    label: "Free",
    variant: "neutral",
    description: "Every organization",
  },
  STARTER: {
    label: "Starter",
    variant: "soft",
    description: "Starter plan and above",
  },
  PROFESSIONAL: {
    label: "Professional",
    variant: "warning",
    description: "Professional and Enterprise",
  },
  ENTERPRISE: {
    label: "Enterprise",
    variant: "success",
    description: "Enterprise only",
  },
};

export const FALLBACK_ERROR = "That didn't work. Please try again.";

/** Resolves visual icon dynamically from featureKey and category. */
export const getFeatureIcon = (
  featureKey: string,
  category?: string,
): ElementType<{ className?: string }> => {
  const normalizedKey = (featureKey || "").toLowerCase();

  switch (normalizedKey) {
    case "virtual_office":
      return Building2;
    case "proximity_meetings":
      return Video;
    case "team_chat":
      return MessageSquare;
    case "spatial_audio":
      return Volume2;
    case "whiteboard":
      return PenTool;
    case "ai_agent":
      return Bot;
    case "integrations":
      return Blocks;
    case "advanced_analytics":
      return BarChart3;
    case "project_boards":
      return Kanban;
    case "meeting_recording":
      return Film;
    case "data_automation":
      return Cpu;
    case "api_access":
      return KeyRound;
    case "audit_logs":
      return ScrollText;
    case "advanced_security":
      return ShieldCheck;
    case "custom_reports":
      return FileSpreadsheet;
    case "custom_branding":
      return Palette;
    case "sso_saml":
      return Fingerprint;
  }

  const normalizedCategory = (category || "").toLowerCase();
  if (normalizedCategory.includes("workplace") || normalizedCategory.includes("spatial")) {
    return Building2;
  }
  if (normalizedCategory.includes("intel") || normalizedCategory.includes("ai")) {
    return Bot;
  }
  if (normalizedCategory.includes("analytic")) {
    return BarChart3;
  }
  if (normalizedCategory.includes("operat") || normalizedCategory.includes("workflow")) {
    return Cpu;
  }
  if (normalizedCategory.includes("integrat") || normalizedCategory.includes("api")) {
    return Blocks;
  }
  if (normalizedCategory.includes("secur")) {
    return ShieldCheck;
  }
  if (normalizedCategory.includes("report")) {
    return FileSpreadsheet;
  }

  return Sparkles;
};
