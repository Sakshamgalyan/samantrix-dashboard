"use client";

import React from "react";
import { Card } from "@galyan/ui";
import { HeaderTitle } from "@/components/layout/header/header-title";
import { Notifications } from "@/components/layout/header/notifications";
import { ProfileMenu } from "@/components/layout/header/profile-menu";
import type { HeaderProps } from "@/components/layout/header/types";

/**
 * Page header: assembles header title, actions, notifications, and profile menu
 * inside a glass Card container.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  eyebrow,
  icon,
  badge,
  badgeColor,
  actions,
  className = "",
}) => {
  return (
    <header className={`sticky top-3 z-20 ml-2.5 mr-3 mt-3 shrink-0 ${className}`.trim()}>
      <Card variant="glass" padding="none" radius="xl" className="w-full">
        {/* Card container indexing header sections */}
        <div className="flex h-16 w-full items-center justify-between gap-4 px-5">
          <HeaderTitle
            title={title}
            eyebrow={eyebrow}
            description={description}
            icon={icon}
            badge={badge}
            badgeColor={badgeColor}
          />

          <div className="flex items-center gap-4">
            {actions}
            <Notifications />
            <ProfileMenu />
          </div>
        </div>
      </Card>
    </header>
  );
};

export default Header;
