"use client";

import { Chip, Typography } from "@galyan/ui";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/** Change vs the previous period: "+12.5%" / "-3 pts"; nothing when there's no baseline. */
export const ChangeBadge = ({
  value,
  unit = "%",
}: {
  value: number | null;
  unit?: "%" | "pts";
}) => {
  if (value === null) return null;
  const suffix = unit === "%" ? "%" : " pts";
  if (value === 0) {
    return (
      <Chip size="sm" variant="neutral" className="whitespace-nowrap">
        <Typography variant="small" as="span" className="inline-flex items-center gap-0.5 font-medium tabular-nums text-xs">
          <Minus className="size-3" />0{suffix}
        </Typography>
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
      <Typography variant="small" as="span" className="inline-flex items-center gap-0.5 font-medium tabular-nums text-xs">
        {up ? (
          <ArrowUpRight className="size-3" />
        ) : (
          <ArrowDownRight className="size-3" />
        )}
        {up ? "+" : ""}
        {value}
        {suffix}
      </Typography>
    </Chip>
  );
};
