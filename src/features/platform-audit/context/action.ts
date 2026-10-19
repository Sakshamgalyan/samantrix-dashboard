import type { PlatformAuditAction } from "@/features/platform-audit/context/types";
import type { PlatformAuditLog } from "@/features/platform-audit/types";

export const setSearchQueryAction = (query: string): PlatformAuditAction => ({
  type: "SET_SEARCH_QUERY",
  payload: query,
});

export const setCategoryFilterAction = (category: string): PlatformAuditAction => ({
  type: "SET_CATEGORY_FILTER",
  payload: category,
});

export const setPageAction = (page: number): PlatformAuditAction => ({
  type: "SET_PAGE",
  payload: page,
});

export const openDetailModalAction = (log: PlatformAuditLog): PlatformAuditAction => ({
  type: "OPEN_DETAIL_MODAL",
  payload: log,
});

export const closeDetailModalAction = (): PlatformAuditAction => ({
  type: "CLOSE_DETAIL_MODAL",
});

export const resetFiltersAction = (): PlatformAuditAction => ({
  type: "RESET_FILTERS",
});
