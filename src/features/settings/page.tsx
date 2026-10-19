"use client";

import React from "react";
import { SettingsProvider } from "@/features/settings/context";
import { SettingsContent } from "@/features/settings/components/settings-content";

const SettingsPage = () => {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
};

export default SettingsPage;
