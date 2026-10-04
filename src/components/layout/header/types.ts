import type React from "react";

export interface HeaderProps {
  /** Page name shown as the heading. */
  title: string;
  /** What the page is for; shown in a tooltip beside the title. */
  description?: string;
  /** Small label above the title (e.g. the console name). */
  eyebrow?: string;
  /** Optional icon for the active view / page. */
  icon?: React.ReactNode;
  /** Optional badge text (e.g. "Beta", "New"). */
  badge?: string;
  /** Badge color variant matching route specification. */
  badgeColor?: "primary" | "danger" | "success" | "warning" | "neutral";
  /** Extra controls rendered before notifications. */
  actions?: React.ReactNode;
}
