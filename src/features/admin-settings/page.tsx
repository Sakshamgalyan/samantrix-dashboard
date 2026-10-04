"use client";

import { SettingsPageProvider } from "./context";
import { SettingsContent } from "./components/settings-content";

/** Admin console → Platform Settings (route `admin/settings`). */
export default function PlatformSettingsPage() {
  return (
    <SettingsPageProvider>
      <SettingsContent />
    </SettingsPageProvider>
  );
}
