"use client";

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import { fleetReducer } from "./reducer";
import { initialFleetState, type FleetState } from "../types/state";
import type { FleetAction } from "./action";

interface FleetContextValue {
  state: FleetState;
  dispatch: React.Dispatch<FleetAction>;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fleetReducer, initialFleetState);

  return (
    <FleetContext.Provider value={{ state, dispatch }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error("useFleet must be used within a FleetProvider");
  }
  return context;
}
