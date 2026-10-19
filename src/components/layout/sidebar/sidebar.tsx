"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Chip,
  Sidebar as GySidebar,
  SidebarText,
  Tabs,
} from "@galyan/ui";
import type { ConsoleScope } from "@/components/layout/scope-context";
import { useAuth } from "@/features/auth";
import { SCOPE_TABS } from "@/components/layout/sidebar/constants";
import { SidebarBrand } from "@/components/layout/sidebar/sidebar-brand";
import { SidebarUser } from "@/components/layout/sidebar/sidebar-user";
import type { SidebarProps } from "@/components/layout/sidebar/types";
import { useSidebarItems } from "@/components/layout/sidebar/use-sidebar-items";

export const Sidebar = ({ scope, activeRoute, canSwitchScope, onScopeChange }: SidebarProps) => {
  const router = useRouter();
  const { user, organization } = useAuth();

  const orgName = organization?.name || user?.organization?.name || "My Organization";
  const planTier = organization?.planTier;
  const items = useSidebarItems(scope);
  const currentPath = activeRoute?.path;

  // Ensure active sidebar item is always smoothly brought into view
  useEffect(() => {
    if (!currentPath) return;
    const timer = setTimeout(() => {
      const activeEl = document.querySelector(".gy-sidebar-item--active");
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [currentPath]);

  return (
    <GySidebar
      items={items}
      activeItemId={currentPath}
      onItemClick={(id) => router.push(`/${id}`)}
      variant="floating-glass"
      activeVariant="line"
      width={268}
      collapsedWidth={72}
      breakpoint={768}
      className="sx-sidebar"
      header={
        <div className="w-full space-y-3">
          <SidebarBrand subtitle={scope === "admin" ? "Developer Console" : orgName} />
          {canSwitchScope && (
            <SidebarText>
              <Tabs
                items={SCOPE_TABS}
                activeTab={scope}
                onTabChange={(id) => onScopeChange(id as ConsoleScope)}
                variant="ghost"
                size="sm"
                fullWidth
              />
            </SidebarText>
          )}
          {scope === "workspace" && planTier && (
            <SidebarText>
              <Chip variant="soft" size="sm">
                {planTier} plan
              </Chip>
            </SidebarText>
          )}
        </div>
      }
      footer={<SidebarUser />}
    />
  );
};
