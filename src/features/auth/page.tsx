"use client";

import React from "react";
import { AuthPageProvider } from "@/features/auth/context";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthContent } from "@/features/auth/components/auth-content";
import type { AuthMode } from "@/features/auth/types/state";

export const AuthPage = ({ initialMode = "login" }: { initialMode?: AuthMode }) => {
  return (
    <AuthPageProvider initialMode={initialMode}>
      <AuthLayout>
        <AuthContent />
      </AuthLayout>
    </AuthPageProvider>
  );
};

export default AuthPage;
