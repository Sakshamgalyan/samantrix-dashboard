"use client";

import { useState } from "react";
import { Chip, Tabs } from "@galyan/ui";
import { Settings, Shield, SlidersHorizontal, UserRound } from "lucide-react";
import { AdminHero } from "@/components/layout/common/hero";
import { useAuth } from "@/features/auth";
import { developerRoleLabel, hasPermission } from "@/utils/roles";
import { SettingsPageProvider } from "@/features/admin-settings/context";
import { SettingsContent } from "@/features/admin-settings/components/settings-content";
import { AccountSection } from "@/features/admin-settings/account/account-section";

type SettingsTab = "account" | "configuration";

/** Developer console → Settings (route `admin/settings`): your account, plus configuration for superadmins. */
export const SettingsPage = () => {
  const { user } = useAuth();
  const canConfigure = hasPermission(user, "settings:manage");
  const [tab, setTab] = useState<SettingsTab>("account");
  const active: SettingsTab = canConfigure ? tab : "account";

  const roleLabel = user?.platformRole ? developerRoleLabel(user.platformRole) : "Developer";

  return (
    <div className="space-y-4">
      <AdminHero
        title="Settings & System Configuration"
        description="Manage your personal profile, authentication, active devices, and platform-wide configuration settings."
        chips={
          <>
            <Chip size="sm" variant="soft" icon={<Settings className="size-3" />}>
              <span className="whitespace-nowrap">Console Settings</span>
            </Chip>
            <Chip size="sm" variant={canConfigure ? "success" : "neutral"} icon={<Shield className="size-3" />}>
              <span className="whitespace-nowrap">{roleLabel}</span>
            </Chip>
          </>
        }
      />

      {canConfigure && (
        <div className="w-full overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <Tabs
            items={[
              { id: "account", label: "My account", icon: <UserRound className="size-3.5" /> },
              { id: "configuration", label: "Configuration", icon: <SlidersHorizontal className="size-3.5" /> },
            ]}
            activeTab={active}
            onTabChange={(id) => setTab(id as SettingsTab)}
            variant="button"
            size="sm"
          />
        </div>
      )}

      {active === "account" ? (
        <AccountSection />
      ) : (
        <SettingsPageProvider>
          <SettingsContent />
        </SettingsPageProvider>
      )}
    </div>
  );
};

export default SettingsPage;
