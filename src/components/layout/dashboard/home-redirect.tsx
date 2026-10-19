"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { getHomePath } from "@/utils/home-path";

/** Unknown console URL → the user's own console home. */
export function HomeRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.replace(getHomePath(user));
  }, [user, router]);

  return null;
}
