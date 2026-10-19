import type { Dispatch } from "react";
import type { OverviewState } from "@/features/overview/types/state";
import type { OverviewAction } from "@/features/overview/types/actions";

export interface OverviewContextValue {
  state: OverviewState;
  dispatch: Dispatch<OverviewAction>;
}
