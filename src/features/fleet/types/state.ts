import type { OrgFleetSession } from "./api";

export type ClientFilterType = "ALL" | "DESKTOP" | "BROWSER" | "MOBILE";

export interface FleetState {
  searchQuery: string;
  clientTypeFilter: ClientFilterType;
  actionError: string | null;
  revokingSession: OrgFleetSession | null;
  isRevoking: boolean;
}

export const initialFleetState: FleetState = {
  searchQuery: "",
  clientTypeFilter: "ALL",
  actionError: null,
  revokingSession: null,
  isRevoking: false,
};
