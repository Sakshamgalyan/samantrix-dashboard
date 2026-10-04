"use client";

import { Chip } from "@galyan/ui";
import { ArrowUpRight, Rocket } from "lucide-react";
import { GLASS_ROW, GlassSection, SectionEmpty } from "@/components/admin";
import { relativeTime } from "@/lib/format";
import { APP_META, CHANNEL_META } from "../common/constants";
import { useVersioningContext } from "../context";
import { RELEASE_APPS, RELEASE_CHANNELS, type Release } from "../types";

const key = (r: Pick<Release, "app" | "channel">) => `${r.app}:${r.channel}`;

/** Live version of every app per channel, with any rollout in progress on top of it. */
export function CurrentVersions() {
  const { summary } = useVersioningContext();
  if (!summary) return null;

  const live = new Map(summary.current.map((r) => [key(r), r]));
  const rolling = new Map<string, Release[]>();
  for (const r of summary.rollingOut) {
    rolling.set(key(r), [...(rolling.get(key(r)) ?? []), r]);
  }

  const empty = summary.current.length === 0 && summary.rollingOut.length === 0;

  return (
    <GlassSection
      title="Current versions"
      subtitle="The latest released version of each app on every channel"
    >
      {empty ? (
        <SectionEmpty
          icon={<Rocket className="size-5" />}
          title="Nothing released yet"
          description="Once a release reaches Released, it shows here as the live version for its app and channel."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {RELEASE_APPS.map((app) => {
            const channels = RELEASE_CHANNELS.filter(
              (c) => live.has(`${app}:${c}`) || rolling.has(`${app}:${c}`),
            );
            return (
              <div key={app} className={`${GLASS_ROW} p-4`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--gy-text)]">
                    {APP_META[app].label}
                  </span>
                  <span className="truncate text-[11px] text-[var(--gy-text-subtle)]">
                    {APP_META[app].description}
                  </span>
                </div>
                {channels.length === 0 ? (
                  <p className="mt-3 text-xs text-[var(--gy-text-subtle)]">
                    No live release yet
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {channels.map((channel) => {
                      const current = live.get(`${app}:${channel}`);
                      const staged = rolling.get(`${app}:${channel}`) ?? [];
                      return (
                        <li key={channel} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0">
                              <Chip
                                size="sm"
                                variant={CHANNEL_META[channel].variant}
                              >
                                {CHANNEL_META[channel].label}
                              </Chip>
                            </span>
                            {current ? (
                              <>
                                <span className="font-mono text-sm font-semibold text-[var(--gy-text)]">
                                  {current.version}
                                </span>
                                {current.releasedAt && (
                                  <span className="ml-auto whitespace-nowrap text-[var(--gy-text-subtle)]">
                                    {relativeTime(current.releasedAt)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[var(--gy-text-subtle)]">
                                Not released
                              </span>
                            )}
                          </div>
                          {staged.map((r) => (
                            <div
                              key={r.id}
                              className="mt-1 flex items-center gap-1.5 pl-[4.5rem] text-[var(--gy-warning)]"
                            >
                              <ArrowUpRight className="size-3" />
                              <span className="font-mono">{r.version}</span>
                              <span>rolling out · {r.rolloutPercent}%</span>
                            </div>
                          ))}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassSection>
  );
}
