"use client";

import { useEffect } from "react";

/** Calls `load` once on mount and then every `intervalMs` (default 60s) while mounted. */
export function useAutoRefresh(load: () => void, intervalMs = 60_000) {
  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load, intervalMs]);
}
