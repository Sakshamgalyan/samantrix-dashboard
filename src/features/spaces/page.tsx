"use client";

import React from "react";
import { SpacesProvider } from "./context";
import { SpacesContent } from "./components/spaces-content";

export default function SpacesPage() {
  return (
    <SpacesProvider>
      <SpacesContent />
    </SpacesProvider>
  );
}
