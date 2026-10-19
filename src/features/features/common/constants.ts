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
import type { ElementType } from "react";
import type { FeatureStatusFilter } from "@/features/features/types/state";

export const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All Categories" },
  { value: "Workplace", label: "Workplace & Spatial" },
  { value: "Intelligence", label: "AI & Intelligence" },
  { value: "Analytics", label: "Analytics & Telemetry" },
  { value: "Operations", label: "Operations & Workflows" },
  { value: "Integration", label: "Integrations & API" },
  { value: "Security", label: "Security & Governance" },
  { value: "Reporting", label: "Compliance & Reporting" },
] as const;

export const STATUS_OPTIONS: { value: FeatureStatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
  { value: "LOCKED", label: "Plan Locked" },
];

/**
 * Resolves the visual Lucide icon dynamically from featureKey and category.
 * Sourced entirely from dynamic metadata without hardcoding mock records.
 */
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
