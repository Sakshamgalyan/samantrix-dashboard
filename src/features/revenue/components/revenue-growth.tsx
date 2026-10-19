import React from "react";

export function RevenueGrowth({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-[var(--gy-success)]" : "text-[var(--gy-danger)]"}`}>
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}
