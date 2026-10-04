"use client";

import React from "react";
import { AuthPageProvider } from "./context";
import { AuthLayout } from "./components/auth-layout";
import { AuthContent } from "./components/auth-content";
import type { AuthMode } from "./types";

export function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  return (
    <AuthPageProvider initialMode={initialMode}>
      <AuthLayout>
        <AuthContent />
      </AuthLayout>
    </AuthPageProvider>
  );
}

export default AuthPage;
