import type { ChipVariant } from "@galyan/ui";
import type { PlanTier } from "../types";

export const ALL_CATEGORIES = "ALL";
export const DEFAULT_CATEGORY = "General";

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
