"use client";

import { Button, Card, Chip, Typography } from "@galyan/ui";
import { useAuthPageContext } from "@/features/auth/context";
import { BookOpen } from "lucide-react";
import { SimantrixMark } from "@/components/brand/simantrix-logo";

export const AuthHeader = () => {
  const { setAuthMode, setStep, setError } = useAuthPageContext();

  const goHome = () => {
    setAuthMode("login");
    setStep(1);
    setError(null);
  };

  return (
    <header className="relative z-30 shrink-0 w-full px-3 pt-2 sm:px-5 sm:pt-2.5">
      {/* Floating Galyan glass bar */}
      <Card variant="glass" padding="none" radius="xl" className="w-full">
        {/* Card wraps children in its own element, so the row layout lives here */}
        <div className="flex h-12 w-full items-center justify-between px-4 sm:px-5">
      <button
        type="button"
        onClick={goHome}
        aria-label="Simantrix home"
        className="group flex items-center gap-2.5 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--gy-focus-outline)]"
      >
        <SimantrixMark
          title=""
          className="size-8 drop-shadow-[0_6px_14px_rgb(124_92_255/0.35)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
        />
        <span className="flex flex-col items-start leading-none">
          <Typography variant="span" weight="extrabold" className="text-sm tracking-tight text-[var(--gy-text)]">
            Simantrix
          </Typography>
          <Typography variant="span" weight="medium" className="mt-1 text-[11px] text-[var(--gy-text-subtle)]">
            Control Center
          </Typography>
        </span>
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:block">
          <Chip
            variant="success"
            size="sm"
            icon={
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--gy-success)] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--gy-success)]" />
              </span>
            }
          >
            All systems operational
          </Chip>
        </div>

        <Button
          variant="glass"
          size="sm"
          leftIcon={<BookOpen className="size-4" />}
          onClick={() =>
            alert(
              "Simantrix System Documentation: Realtime gateway architecture, WebSocket event map, and RBAC policies.",
            )
          }
          className="hidden sm:inline-flex"
        >
          Docs
        </Button>

      </div>
        </div>
      </Card>
    </header>
  );
};
