import {
  FileText,
  Sparkles,
  Clock,
  BookOpen,
  Code2,
  Bot,
  type LucideIcon,
} from "lucide-react";

export interface ArchetypeMeta {
  archetype: string;
  label: string;
  icon: LucideIcon;
  badgeVariant: "primary" | "success" | "warning" | "neutral" | "danger";
  defaultPrompt: string;
}

export const ARCHETYPE_METAS: Record<string, ArchetypeMeta> = {
  SCRIBE: {
    archetype: "SCRIBE",
    label: "Meeting Scribe",
    icon: FileText,
    badgeVariant: "primary",
    defaultPrompt:
      "You are the autonomous meeting intelligence for Simantrix. Transcribe audio, extract action items with assigned owners, and produce concise executive summaries.",
  },
  CONCIERGE: {
    archetype: "CONCIERGE",
    label: "Lobby Concierge",
    icon: Sparkles,
    badgeVariant: "warning",
    defaultPrompt:
      "You are the Simantrix Virtual Office Receptionist stationed in the Main Lobby. Welcome visitors, provide directions to rooms, and announce guest arrivals.",
  },
  STANDUP: {
    archetype: "STANDUP",
    label: "Standup Bot",
    icon: Clock,
    badgeVariant: "success",
    defaultPrompt:
      "You are the agile standup assistant. Collect daily updates: what was accomplished, what is planned, and what is blocking progress. Summarize for leads.",
  },
  KNOWLEDGE: {
    archetype: "KNOWLEDGE",
    label: "Knowledge AI",
    icon: BookOpen,
    badgeVariant: "primary",
    defaultPrompt:
      "You are the organization knowledge assistant. Provide clear, accurate answers referencing company documentation and policies.",
  },
  CODER: {
    archetype: "CODER",
    label: "Code Reviewer",
    icon: Code2,
    badgeVariant: "neutral",
    defaultPrompt:
      "You are a senior software engineer assistant helping the team review commits, explain code patterns, and draft pull request descriptions.",
  },
  CUSTOM: {
    archetype: "CUSTOM",
    label: "Custom Bot",
    icon: Bot,
    badgeVariant: "neutral",
    defaultPrompt:
      "You are a dedicated AI assistant in the Simantrix virtual workplace.",
  },
};

export function getArchetypeMeta(archetype: string): ArchetypeMeta {
  return (
    ARCHETYPE_METAS[archetype] || {
      archetype,
      label: archetype,
      icon: Bot,
      badgeVariant: "neutral",
      defaultPrompt: "You are an assistant.",
    }
  );
}

export const ARCHETYPE_OPTIONS = [
  { value: "SCRIBE", label: "Meeting Scribe" },
  { value: "CONCIERGE", label: "Lobby Concierge" },
  { value: "STANDUP", label: "Standup Bot" },
  { value: "KNOWLEDGE", label: "Knowledge AI" },
  { value: "CODER", label: "Code Reviewer" },
  { value: "CUSTOM", label: "Custom Bot" },
];

export const MODEL_OPTIONS = [
  { value: "simantrix-scribe-v2", label: "Simantrix Audio Scribe v2 (Optimized for speech)" },
  { value: "gemini-1.5-pro", label: "Google Gemini 1.5 Pro (Multimodal & Fast)" },
  { value: "gpt-4o", label: "OpenAI GPT-4o (High Intelligence)" },
  { value: "claude-3-5-sonnet", label: "Anthropic Claude 3.5 Sonnet (Coding & Nuance)" },
];

export const FILTER_OPTIONS = [
  { value: "ALL", label: "All Assistants" },
  { value: "SCRIBE", label: "Meeting Scribes" },
  { value: "CONCIERGE", label: "Concierges" },
  { value: "STANDUP", label: "Standup Bots" },
  { value: "KNOWLEDGE", label: "Knowledge AI" },
  { value: "CODER", label: "Code Reviewers" },
  { value: "CUSTOM", label: "Custom" },
];
