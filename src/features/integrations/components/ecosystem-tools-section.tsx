"use client";

import React from "react";
import { Card, Chip, Typography } from "@galyan/ui";
import {
  Blocks,
  Calendar,
  MessageSquare,
  Sparkles,
  Bot,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { ECOSYSTEM_TOOLS, type EcosystemTool } from "@/features/integrations/common/constants";

interface EcosystemToolWithMeta extends EcosystemTool {
  icon: React.ReactNode;
  category: string;
  badgeVariant?: "success" | "neutral" | "warning";
}

const EXTENDED_TOOLS: EcosystemToolWithMeta[] = [
  {
    name: "Slack Workplace",
    description:
      "Push virtual room presence alerts, direct mentions, and meeting reminders directly to your team's Slack channels.",
    status: "Enterprise Ready",
    category: "Communication",
    badgeVariant: "success",
    icon: <MessageSquare className="size-5 text-[var(--gy-success)]" />,
  },
  {
    name: "Google Calendar",
    description:
      "Synchronize scheduled calendar invites into automatically reserved 3D meeting spaces with spatial audio.",
    status: "Available",
    category: "Scheduling",
    badgeVariant: "neutral",
    icon: <Calendar className="size-5 text-[var(--gy-info,#3b82f6)]" />,
  },
  {
    name: "Discord Bot Bridge",
    description:
      "Sync voice channels and proximity audio states between your external Discord community and Simantrix office.",
    status: "Available",
    category: "Audio & Voice",
    badgeVariant: "neutral",
    icon: <Bot className="size-5 text-[var(--gy-primary)]" />,
  },
  {
    name: "Linear & Jira Tracker",
    description:
      "Display real-time sprint boards, ticket statuses, and roadmap items on virtual office whiteboards and screens.",
    status: "Preview",
    category: "Issue Tracking",
    badgeVariant: "warning",
    icon: <Layers className="size-5 text-[var(--gy-warning)]" />,
  },
];

export const EcosystemToolsSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
            <Blocks className="size-4" />
          </div>
          <div>
            <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-sm sm:text-base">
              Supported Ecosystem Bridges
            </Typography>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs">
              Connect industry-standard productivity tools with your digital workplace.
            </Typography>
          </div>
        </div>
        <Chip size="sm" icon={<Sparkles className="size-3" />} variant="neutral">
          4 BRIDGES
        </Chip>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EXTENDED_TOOLS.map((tool) => (
          <Card
            key={tool.name}
            variant="elevated"
            radius="xl"
            padding="md"
            className="group flex flex-col justify-between border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--gy-border-strong)]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)]">
                  {tool.icon}
                </div>
                <Chip size="xs" variant={tool.badgeVariant || "neutral"}>
                  {tool.status}
                </Chip>
              </div>

              <div>
                <Typography
                  variant="span"
                  textColor="var(--gy-text-subtle)"
                  className="text-[10px] font-semibold uppercase tracking-wider block"
                >
                  {tool.category}
                </Typography>
                <Typography
                  variant="h4"
                  weight="semibold"
                  textColor="var(--gy-text)"
                  className="mt-0.5 group-hover:text-[var(--gy-primary)] transition-colors text-sm sm:text-base"
                >
                  {tool.name}
                </Typography>
              </div>

              <Typography
                variant="p"
                textColor="var(--gy-text-secondary)"
                className="text-xs leading-relaxed line-clamp-3"
              >
                {tool.description}
              </Typography>
            </div>

            <div className="pt-4 border-t border-[var(--gy-border)] mt-4 flex items-center justify-between">
              <Typography
                variant="span"
                textColor="var(--gy-text-subtle)"
                className="text-[11px]"
              >
                Webhook &amp; OAuth 2.0
              </Typography>
              <div className="text-[var(--gy-text-subtle)] group-hover:text-[var(--gy-primary)] transition-colors">
                <ArrowUpRight className="size-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
