"use client";

import React from "react";
import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Tooltip,
  Typography,
} from "@galyan/ui";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Gauge,
  Laptop,
  Plus,
  Rocket,
  ShieldAlert,
} from "lucide-react";
import { relativeTime } from "@/utils/format";
import {
  APP_META,
  CHANNEL_META,
} from "@/features/versioning/common/constants";
import { useVersioningContext } from "@/features/versioning/context";
import {
  RELEASE_CHANNELS,
  type ReleaseBrief,
  type ReleaseChannel,
  type ReleaseListItem,
} from "@/features/versioning/types";

const CHANNEL_ICONS: Record<ReleaseChannel, React.ReactNode> = {
  STABLE: <CheckCircle2 className="size-4 text-emerald-400" />,
  BETA: <Gauge className="size-4 text-[var(--gy-primary)]" />,
  CANARY: <ShieldAlert className="size-4 text-amber-400" />,
};

export const CurrentVersions = () => {
  const { summary, releases, canManage, openDialog } = useVersioningContext();
  if (!summary) return null;

  // Filter releases exclusively for Simantrix Desktop App
  const desktopLive = new Map(
    summary.current
      .filter((r) => r.app === "DESKTOP")
      .map((r) => [r.channel, r]),
  );

  const desktopRolling = summary.rollingOut.filter((r) => r.app === "DESKTOP");

  const findFullRelease = (
    id: string,
    fallback: ReleaseBrief,
  ): ReleaseListItem => {
    const existing = releases.find((item) => item.id === id);
    if (existing) return existing;
    return {
      id: fallback.id,
      app: "DESKTOP",
      version: fallback.version,
      channel: fallback.channel,
      status: "RELEASED",
      title: `Simantrix Desktop v${fallback.version}`,
      summary: null,
      rolloutPercent: fallback.rolloutPercent,
      isMandatory: false,
      showOnHome: false,
      releasedAt: fallback.releasedAt,
      createdAt: fallback.releasedAt ?? new Date().toISOString(),
      createdBy: null,
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Typography
              variant="h4"
              weight="semibold"
              textColor="var(--gy-text)"
              className="text-base tracking-tight"
            >
              Simantrix Desktop Channels
            </Typography>
            <Chip size="xs" variant="primary" icon={<Laptop className="size-3" />}>
              Electron 43
            </Chip>
          </div>
          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs"
          >
            Production, beta, and canary release channels for the Simantrix Desktop application.
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<Plus className="size-3" />}
              onClick={() =>
                openDialog({ kind: "create", defaultApp: "DESKTOP" })
              }
            >
              New Desktop Release
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {RELEASE_CHANNELS.map((channel) => {
          const meta = CHANNEL_META[channel];
          const liveRelease = desktopLive.get(channel);
          const liveFull = liveRelease
            ? releases.find((r) => r.id === liveRelease.id)
            : null;
          const activeRollout = desktopRolling.find(
            (r) => r.channel === channel,
          );
          const icon = CHANNEL_ICONS[channel];

          return (
            <Card
              key={channel}
              variant="glass"
              radius="lg"
              padding="sm"
              className="group relative flex flex-col justify-between transition-all duration-200 hover:border-[var(--gy-primary)]/40 hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Header: Channel Name & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] transition-transform duration-200 group-hover:scale-105">
                      {icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Typography
                          variant="p"
                          weight="semibold"
                          textColor="var(--gy-text)"
                          className="text-sm font-semibold tracking-tight"
                        >
                          {meta.label}
                        </Typography>
                        <Chip
                          size="xs"
                          variant={meta.variant}
                          className="text-[10px]"
                        >
                          {channel}
                        </Chip>
                      </div>
                      <Typography
                        variant="small"
                        textColor="var(--gy-text-subtle)"
                        className="text-[11px] block truncate max-w-[200px]"
                      >
                        {meta.description}
                      </Typography>
                    </div>
                  </div>

                  <div>
                    {activeRollout ? (
                      <Chip
                        size="xs"
                        variant="warning"
                        icon={<Gauge className="size-3 animate-spin" />}
                      >
                        Rollout {activeRollout.rolloutPercent}%
                      </Chip>
                    ) : liveRelease ? (
                      <Chip
                        size="xs"
                        variant="success"
                        icon={
                          <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        }
                      >
                        Active
                      </Chip>
                    ) : (
                      <Chip size="xs" variant="neutral">
                        No Build
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Primary Version Block */}
                <div className="rounded-md border border-[var(--gy-border)]/50 bg-[var(--gy-bg-subtle)]/40 p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--gy-text-subtle)]">
                      Current Build
                    </span>
                    {liveFull?.isMandatory && (
                      <Chip size="xs" variant="warning" className="text-[10px]">
                        Mandatory Update
                      </Chip>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    {liveRelease ? (
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-base font-bold text-[var(--gy-text)] tracking-tight">
                            v{liveRelease.version}
                          </span>
                          {liveRelease.releasedAt && (
                            <span className="flex items-center gap-1 text-[11px] text-[var(--gy-text-subtle)]">
                              <Clock className="size-2.5" />
                              {relativeTime(liveRelease.releasedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--gy-text-subtle)] italic">
                        No active release on {channel}
                      </span>
                    )}

                    {canManage && liveRelease && (
                      <Tooltip
                        content="Rollback / Downgrade"
                        position="top"
                        size="sm"
                      >
                        <Button
                          variant="danger-soft"
                          size="xs"
                          className="h-6 px-1.5 text-[11px]"
                          leftIcon={<ArrowDownLeft className="size-2.5" />}
                          onClick={() => {
                            const fullItem = findFullRelease(
                              liveRelease.id,
                              liveRelease,
                            );
                            openDialog({
                              kind: "rollback",
                              release: fullItem,
                            });
                          }}
                        >
                          Downgrade
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Staged Rollout Banner (if applicable) */}
                {activeRollout && (
                  <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[var(--gy-warning)]">
                        <ArrowUpRight className="size-3" />
                        <span className="font-medium text-[11px]">
                          Canary Rollout:{" "}
                          <span className="font-mono font-semibold">
                            v{activeRollout.version}
                          </span>
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--gy-text-secondary)]">
                        {activeRollout.rolloutPercent}% clients
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <ProgressBar
                        progress={activeRollout.rolloutPercent}
                        size="sm"
                        variant="warning"
                      />
                    </div>

                    {canManage && (
                      <div className="mt-2 flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-5 px-1.5 text-[10px]"
                          onClick={() => {
                            const full = findFullRelease(
                              activeRollout.id,
                              activeRollout,
                            );
                            openDialog({
                              kind: "rollout",
                              release: full,
                              percent: activeRollout.rolloutPercent,
                            });
                          }}
                        >
                          Adjust %
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          className="h-5 px-2 text-[10px]"
                          leftIcon={<Rocket className="size-2.5" />}
                          onClick={() => {
                            const full = findFullRelease(
                              activeRollout.id,
                              activeRollout,
                            );
                            openDialog({ kind: "release", release: full });
                          }}
                        >
                          Promote 100%
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="mt-3 border-t border-[var(--gy-border)]/50 pt-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-2 rounded-full ${
                        liveRelease ? "bg-emerald-500" : "bg-neutral-600/40"
                      }`}
                    />
                    <span className="text-[11px] text-[var(--gy-text-subtle)]">
                      {liveRelease ? `v${liveRelease.version} Deployed` : "Awaiting build"}
                    </span>
                  </div>

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-xs"
                      leftIcon={<Plus className="size-3" />}
                      onClick={() =>
                        openDialog({
                          kind: "create",
                          defaultApp: "DESKTOP",
                        })
                      }
                    >
                      Deploy Build
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentVersions;
