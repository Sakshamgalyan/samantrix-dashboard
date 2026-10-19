import type { Dispatch } from "react";
import type { EcosystemService, ServiceFilter } from "../types";

export interface PingResult {
  latencyMs: number;
  status: "up" | "down";
  timestamp: number;
}

export interface EcosystemState {
  searchQuery: string;
  statusFilter: ServiceFilter;
  selectedService: EcosystemService | null;
  isDetailModalOpen: boolean;
  isAutoRefresh: boolean;
  autoRefreshIntervalSec: number;
  isPinging: boolean;
  pingResults: Record<string, PingResult>;
  lastManualRefreshAt: number;
}

export type EcosystemAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: ServiceFilter }
  | { type: "OPEN_DETAIL_MODAL"; payload: EcosystemService }
  | { type: "CLOSE_DETAIL_MODAL" }
  | { type: "TOGGLE_AUTO_REFRESH" }
  | { type: "SET_AUTO_REFRESH_INTERVAL"; payload: number }
  | { type: "SET_IS_PINGING"; payload: boolean }
  | { type: "SET_PING_RESULT"; payload: { serviceId: string; result: PingResult } }
  | { type: "RECORD_MANUAL_REFRESH" };

export interface EcosystemContextValue {
  state: EcosystemState;
  dispatch: Dispatch<EcosystemAction>;
}
