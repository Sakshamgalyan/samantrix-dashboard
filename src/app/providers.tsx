"use client";

import React, { useEffect } from "react";
import { ThemeProvider, useTheme, type ThemeRole } from "@galyan/theme";
import { ToasterProvider } from "@galyan/ui";
import { AuthProvider, useAuth } from "@/features/auth";
import { RealtimeProvider } from "@/features/realtime";
import { StoreProvider } from "@/store";

/**
 * Synchronizes the active user session's role with Galyan's direct color schemes:
 * - org-owner / superadmin -> Coral color scheme (Rose / Crimson #f43f5e)
 * - developer-manager / org-manager -> Blue color scheme (Cobalt #3b82f6)
 * - org-viewer / developer-user / auditor -> Cyan color scheme (Sky Blue #0ea5e9)
 * - org-admin -> Amber color scheme (Governance Amber #f59e0b)
 * - developer / organization -> Violet color scheme (Platform Indigo #6366f1)
 * - org-member / developer-member -> Green color scheme (Emerald #10b981)
 * - default -> Simantrix signature violet (#7c5cff)
 */
const ThemeRoleSync = () => {
  const { user } = useAuth();
  const { setRole } = useTheme();

  useEffect(() => {
    if (!user) {
      setRole("simantrix");
      return;
    }

    let targetRole: ThemeRole = "simantrix";

    if (user.userType === "DEVELOPER") {
      const pRole = (user.platformRole ?? "").toUpperCase();
      switch (pRole) {
        case "SUPERADMIN":
          targetRole = "simantrix";
          break;
        case "MANAGER":
          targetRole = "coral";
          break;
        case "MEMBER":
          targetRole = "green";
          break;
        case "AUDITOR":
          targetRole = "blue";
        case "USER":
          targetRole = "cyan";
          break;
        default:
          targetRole = "violet";
      }
    } else {
      const oRole = (user.organization?.role ?? user.role ?? "").toUpperCase();
      switch (oRole) {
        case "OWNER":
          targetRole = "simantrix";
          break;
        case "ADMIN":
          targetRole = "blue";
          break;
        case "MANAGER":
          targetRole = "coral";
          break;
        case "MEMBER":
          targetRole = "green";
          break;
        case "VIEWER":
          targetRole = "cyan";
          break;
        default:
          targetRole = "violet";
      }
    }

    setRole(targetRole);
  }, [user, setRole]);

  return null;
}

/**
 * App-wide providers shared by the auth page and the console SPA.
 * Defaults to Simantrix brand and role, supporting full Light and Dark modes.
 */
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider brand="simantrix" role="simantrix" defaultColorMode="light" storageKey={null}>
      <ToasterProvider position="top-right">
        <StoreProvider>
          <AuthProvider>
            <ThemeRoleSync />
            <RealtimeProvider>{children}</RealtimeProvider>
          </AuthProvider>
        </StoreProvider>
      </ToasterProvider>
    </ThemeProvider>
  );
};
