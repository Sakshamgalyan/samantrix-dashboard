"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { SpacesContextValue } from "../types/context";
import { INITIAL_SPACES_STATE } from "../types/state";
import { spacesReducer } from "./reducer";

const SpacesContext = createContext<SpacesContextValue | null>(null);

export function SpacesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(spacesReducer, INITIAL_SPACES_STATE);

  return (
    <SpacesContext.Provider value={{ state, dispatch }}>
      {children}
    </SpacesContext.Provider>
  );
}

export function useSpaces(): SpacesContextValue {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error("useSpaces must be used within a SpacesProvider");
  }
  return context;
}
