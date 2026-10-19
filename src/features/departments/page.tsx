"use client";

import React from "react";
import { DepartmentsProvider } from "./context";
import { DepartmentsContent } from "./components/departments-content";

export default function DepartmentsPage() {
  return (
    <DepartmentsProvider>
      <DepartmentsContent />
    </DepartmentsProvider>
  );
}
