"use client";

import React from "react";
import { FleetProvider } from "./context";
import { FleetContent } from "./components/fleet-content";

const FleetPage = () => {
  return (
    <FleetProvider>
      <FleetContent />
    </FleetProvider>
  );
};

export default FleetPage;

