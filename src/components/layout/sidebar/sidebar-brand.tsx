"use client";

import { Typography, useSidebar } from "@galyan/ui";
import { SimantrixMark } from "@/components/brand/simantrix-logo";

interface SidebarBrandProps {
  subtitle: string;
}

/** Brand block; collapses to the logo mark when the rail is collapsed. */
export function SidebarBrand({ subtitle }: SidebarBrandProps) {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={`flex items-center min-w-0 ${
        isCollapsed ? "w-full justify-center" : "gap-3"
      }`}
    >
      <SimantrixMark
        title={isCollapsed ? "Simantrix" : ""}
        className={`size-9 shrink-0 drop-shadow-[0_6px_14px_rgb(124_92_255/0.35)]`}
      />
      {!isCollapsed && (
        <div className="min-w-0">
          <Typography variant="span" weight="bold" className="block tracking-tight">
            Simantrix
          </Typography>
          <Typography variant="small" className="block truncate">
            {subtitle}
          </Typography>
        </div>
      )}
    </div>
  );
}
