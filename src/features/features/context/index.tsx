"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { FeaturesContextValue } from "@/features/features/types/context";
import { initialFeaturesState, featuresReducer } from "@/features/features/context/reducer";

const FeaturesContext = createContext<FeaturesContextValue | undefined>(undefined);

export const FeaturesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(featuresReducer, initialFeaturesState);

  return (
    <FeaturesContext.Provider value={{ state, dispatch }}>
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeatures = (): FeaturesContextValue => {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error("useFeatures must be used within a FeaturesProvider");
  }
  return context;
};
