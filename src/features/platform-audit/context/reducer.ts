import type { PlatformAuditAction, PlatformAuditState } from "@/features/platform-audit/context/types";

export const initialPlatformAuditState: PlatformAuditState = {
  searchQuery: "",
  categoryFilter: "ALL",
  page: 1,
  limit: 15,
  selectedLog: null,
  isDetailModalOpen: false,
};

export const platformAuditReducer = (
  state: PlatformAuditState,
  action: PlatformAuditAction,
): PlatformAuditState => {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, page: 1 };

    case "SET_CATEGORY_FILTER":
      return { ...state, categoryFilter: action.payload, page: 1 };

    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "OPEN_DETAIL_MODAL":
      return { ...state, selectedLog: action.payload, isDetailModalOpen: true };

    case "CLOSE_DETAIL_MODAL":
      return { ...state, selectedLog: null, isDetailModalOpen: false };

    case "RESET_FILTERS":
      return { ...state, searchQuery: "", categoryFilter: "ALL", page: 1 };

    default:
      return state;
  }
}
