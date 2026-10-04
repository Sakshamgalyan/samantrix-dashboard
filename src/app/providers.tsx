"use client";

import React from "react";
import { ThemeProvider } from "@galyan/theme";
import { ToasterProvider } from "@galyan/ui";
import { AuthProvider } from "@/lib/auth-context";
import { RealtimeProvider } from "@/lib/realtime-context";

/**
 * App-wide providers shared by the auth page and the console SPA.
 * The app has a single look: Galyan's Samantrix light theme (`samantrixLightBrand`), with no
 * stored preference (`storageKey={null}`), so an old saved colour-mode choice is ignored.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider brand="samantrix" defaultColorMode="light" storageKey={null}>
      <ToasterProvider>
        <AuthProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </AuthProvider>
      </ToasterProvider>
    </ThemeProvider>
  );
}
