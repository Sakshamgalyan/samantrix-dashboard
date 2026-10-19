"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { AiAssistantsContextValue } from "../types/context";
import { INITIAL_AI_ASSISTANTS_STATE } from "../types/state";
import { aiAssistantsReducer } from "./reducer";

const AiAssistantsContext = createContext<AiAssistantsContextValue | null>(
  null,
);

export function AiAssistantsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    aiAssistantsReducer,
    INITIAL_AI_ASSISTANTS_STATE,
  );

  return (
    <AiAssistantsContext.Provider value={{ state, dispatch }}>
      {children}
    </AiAssistantsContext.Provider>
  );
}

export function useAiAssistants(): AiAssistantsContextValue {
  const context = useContext(AiAssistantsContext);
  if (!context) {
    throw new Error(
      "useAiAssistants must be used within an AiAssistantsProvider",
    );
  }
  return context;
}
