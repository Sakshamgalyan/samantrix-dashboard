"use client";

import React from "react";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { AuthFooter } from "@/features/auth/components/auth-footer";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col justify-between relative overflow-hidden antialiased bg-[var(--gy-background)] text-[var(--gy-text)] transition-colors duration-500">
      {/* Ambient backdrop — all colours come from Galyan tokens, so it follows the colour mode */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(var(--gy-border-strong)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)] opacity-60" />
        <div className="absolute -top-48 -left-32 size-[34rem] rounded-full bg-[var(--gy-primary)]/35 blur-[120px] animate-pulse [animation-duration:9s]" />
        <div className="absolute top-1/3 right-[-10rem] size-[30rem] rounded-full bg-[var(--gy-info)]/30 blur-[120px] animate-pulse [animation-duration:12s]" />
        <div className="absolute -bottom-56 left-1/3 size-[32rem] rounded-full bg-[var(--gy-secondary)]/30 blur-[130px]" />
        {/* Behind the sign-in card, so its glass frosts colour rather than plain white */}
        <div className="absolute right-[8%] top-[18%] size-[26rem] rounded-full bg-[var(--gy-primary)]/30 blur-[110px]" />
        <div className="absolute left-[12%] bottom-[10%] size-[22rem] rounded-full bg-[var(--gy-info)]/25 blur-[110px]" />
      </div>

      <AuthHeader />

      {/* Sized to fit a laptop viewport without any page scroll */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2 flex items-center justify-center overflow-y-auto">
        {children}
      </main>

      <AuthFooter />
    </div>
  );
};
