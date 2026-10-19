"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { DepartmentsContextValue } from "../types/context";
import { INITIAL_DEPARTMENTS_STATE } from "../types/state";
import { departmentsReducer } from "./reducer";

const DepartmentsContext = createContext<DepartmentsContextValue | null>(null);

export function DepartmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    departmentsReducer,
    INITIAL_DEPARTMENTS_STATE,
  );

  return (
    <DepartmentsContext.Provider value={{ state, dispatch }}>
      {children}
    </DepartmentsContext.Provider>
  );
}

export function useDepartments(): DepartmentsContextValue {
  const context = useContext(DepartmentsContext);
  if (!context) {
    throw new Error(
      "useDepartments must be used within a DepartmentsProvider",
    );
  }
  return context;
}
