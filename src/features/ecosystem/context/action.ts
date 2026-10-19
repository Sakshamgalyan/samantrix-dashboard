import type { EcosystemAction, PingResult } from "./types";
import type { EcosystemService, ServiceFilter } from "../types";

export const setSearchQueryAction = (query: string): EcosystemAction => ({
  type: "SET_SEARCH_QUERY",
  payload: query,
});

export const setStatusFilterAction = (filter: ServiceFilter): EcosystemAction => ({
  type: "SET_STATUS_FILTER",
  payload: filter,
});

export const openDetailModalAction = (service: EcosystemService): EcosystemAction => ({
  type: "OPEN_DETAIL_MODAL",
  payload: service,
});

export const closeDetailModalAction = (): EcosystemAction => ({
  type: "CLOSE_DETAIL_MODAL",
});

export const toggleAutoRefreshAction = (): EcosystemAction => ({
  type: "TOGGLE_AUTO_REFRESH",
});

export const setAutoRefreshIntervalAction = (seconds: number): EcosystemAction => ({
  type: "SET_AUTO_REFRESH_INTERVAL",
  payload: seconds,
});

export const setIsPingingAction = (isPinging: boolean): EcosystemAction => ({
  type: "SET_IS_PINGING",
  payload: isPinging,
});

export const setPingResultAction = (
  serviceId: string,
  result: PingResult,
): EcosystemAction => ({
  type: "SET_PING_RESULT",
  payload: { serviceId, result },
});

export const recordManualRefreshAction = (): EcosystemAction => ({
  type: "RECORD_MANUAL_REFRESH",
});
