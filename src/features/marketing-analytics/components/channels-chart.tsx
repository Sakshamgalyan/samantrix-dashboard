"use client";

import { useMemo } from "react";
import { BarChart } from "@galyan/ui";
import { Share2 } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { useMarketingContext } from "../context";
import { CHART_COLORS } from "../common/constants";

/** Visits by acquisition channel (UTM source, else referrer). */
export function ChannelsChart({ className }: { className?: string }) {
  const { state } = useMarketingContext();
  const channels = state.report?.channels;

  const data = useMemo(
    () =>
      (channels ?? []).map((c, i) => ({
        label: c.label,
        value: c.count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [channels],
  );

  return (
    <GlassSection
      className={className}
      title="Acquisition channels"
      subtitle="Visits by UTM source or referrer"
    >
      {data.length === 0 ? (
        <SectionEmpty
          icon={<Share2 className="size-5" />}
          title="No channel data yet"
          description="Direct, search, social and campaign traffic appear once visits are tracked."
        />
      ) : (
        <div className="h-[290px] w-full">
          <BarChart variant="filled" data={data} height={290} showValues />
        </div>
      )}
    </GlassSection>
  );
}
