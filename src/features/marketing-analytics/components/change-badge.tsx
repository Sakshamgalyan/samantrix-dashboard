"use client";

import { Chip } from "@galyan/ui";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/** Change vs the previous period: "+12.5%" / "-3 pts"; nothing when there's no baseline. */
export function ChangeBadge({
  value,
  unit = "%",
}: {
  value: number | null;
  unit?: "%" | "pts";
}) {
  if (value === null) return null;
  const suffix = unit === "%" ? "%" : " pts";
  if (value === 0) {
    return (
      <Chip size="sm" variant="neutral" className="whitespace-nowrap">
        <span className="inline-flex items-center gap-0.5">
          <Minus className="size-3" />0{suffix}
        </span>
      </Chip>
    );
  }
  const up = value > 0;
  return (
    <Chip
      size="sm"
      variant={up ? "success" : "danger"}
      className="whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-0.5">
        {up ? (
          <ArrowUpRight className="size-3" />
        ) : (
          <ArrowDownRight className="size-3" />
        )}
        {up ? "+" : ""}
        {value}
        {suffix}
      </span>
    </Chip>
  );
}
