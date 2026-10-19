"use client";

import React, { createContext, useReducer, type ReactNode } from "react";
import { initialQueuesState, queuesReducer } from "@/features/queues/context/reducer";
import type { QueuesContextValue } from "@/features/queues/context/types";

export const QueuesContext = createContext<QueuesContextValue | undefined>(
  undefined,
);

export const QueuesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(queuesReducer, initialQueuesState);

  return (
    <QueuesContext.Provider value={{ state, dispatch }}>
      {children}
    </QueuesContext.Provider>
  );
};

export { useQueues } from "@/features/queues/context/hooks";

