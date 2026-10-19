import type { Dispatch } from "react";
import type { PlatformAuditLog } from "@/features/platform-audit/types";

export interface PlatformAuditState {
  searchQuery: string;
  categoryFilter: string;
  page: number;
  limit: number;
  selectedLog: PlatformAuditLog | null;
  isDetailModalOpen: boolean;
}

export type PlatformAuditAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_CATEGORY_FILTER"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "OPEN_DETAIL_MODAL"; payload: PlatformAuditLog }
  | { type: "CLOSE_DETAIL_MODAL" }
  | { type: "RESET_FILTERS" };

export interface PlatformAuditContextValue {
  state: PlatformAuditState;
  dispatch: Dispatch<PlatformAuditAction>;
}
