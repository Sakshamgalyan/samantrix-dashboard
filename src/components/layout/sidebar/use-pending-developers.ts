import { POLL_INTERVAL_MS } from "@/store";
import { useGetDevelopersSummaryQuery } from "@/features/developers/context/api";

/** Developers awaiting approval, for the sidebar badge (platform admins in the admin console only). */
export function usePendingDevelopers(enabled: boolean): number {
  // Counts only: the same cached summary as the Developers KPI cards and the overview
  const { data } = useGetDevelopersSummaryQuery(undefined, {
    skip: !enabled,
    pollingInterval: POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });
  return enabled ? (data?.counts.pending ?? 0) : 0;
}
