"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Typography } from "@galyan/ui";
import { useAuth } from "@/features/auth";
import { isPlatformAdmin } from "@/utils/roles";

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }

    // Role / userType check to decide destination
    if (user?.userType === "DEVELOPER" || isPlatformAdmin(user)) {
      router.replace("/admin");
    } else {
      router.replace("/organization");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="grid h-dvh place-items-center bg-[var(--gy-background)]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" color="primary" />
        <Typography
          variant="span"
          className="text-xs uppercase tracking-widest text-[var(--gy-text-subtle)]"
        >
          {isLoading ? "Connecting to Control Center" : "Redirecting to your workspace"}
        </Typography>
      </div>
    </div>
  );
}
