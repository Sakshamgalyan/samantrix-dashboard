import type React from "react";
import type { SpacesState } from "./state";
import type { SpacesAction } from "./actions";

export interface SpacesContextValue {
  state: SpacesState;
  dispatch: React.Dispatch<SpacesAction>;
}
