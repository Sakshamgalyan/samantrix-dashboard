import type { AuditLogsState } from "@/features/audit-logs/types/state";
import type { AuditLogsAction } from "@/features/audit-logs/types/actions";

export const initialAuditLogsState: AuditLogsState = {
  searchQuery: "",
  actionFilter: "ALL",
  page: 1,
  isClearModalOpen: false,
  isClearing: false,
};

export function auditLogsReducer(
  state: AuditLogsState,
  action: AuditLogsAction,
): AuditLogsState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload, page: 1 };
    case "SET_ACTION_FILTER":
      return { ...state, actionFilter: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "RESET_FILTERS":
      return { ...state, searchQuery: "", actionFilter: "ALL", page: 1 };
    case "SET_CLEAR_MODAL_OPEN":
      return { ...state, isClearModalOpen: action.payload };
    case "SET_CLEARING":
      return { ...state, isClearing: action.payload };
    default:
      return state;
  }
}
