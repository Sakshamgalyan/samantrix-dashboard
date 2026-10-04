"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Menu,
  Typography,
  type MenuItem,
} from "@galyan/ui";
import {
  Building2,
  ExternalLink,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/src/lib/auth-context";

const WORKPLACE_URL =
  process.env.NEXT_PUBLIC_WORKPLACE_URL || "http://localhost:4000/office";

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, organization, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = user?.platformRole || user?.role;
  const initial = user?.fullName?.charAt(0).toUpperCase() || "?";

  const items: MenuItem[] = [
    {
      id: "settings",
      label: "Organization profile",
      icon: <Building2 className="size-4" />,
    },
    {
      id: "security",
      label: "Security & 2FA",
      icon: <Shield className="size-4" />,
    },
    {
      id: "workplace",
      label: "Open workplace",
      icon: <ExternalLink className="size-4" />,
    },
    { id: "divider", label: "", divider: true },
    { id: "logout", label: "Sign out", icon: <LogOut className="size-4" /> },
  ];

  const onSelect = (id: string) => {
    if (id === "logout") logout();
    else if (id === "workplace")
      window.open(WORKPLACE_URL, "_blank", "noopener,noreferrer");
    else navigate(`/${id}`);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="primary"
        size="sm"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="size-9 rounded-full p-0 text-sm font-bold shadow-md shadow-[var(--gy-primary)]/30 !rounded-full !p-0"
      >
        {initial}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Menu
            items={items}
            size="sm"
            variant="bordered"
            onItemClick={(id) => {
              setIsOpen(false);
              onSelect(id);
            }}
            className="w-64 shadow-xl"
          >
            <div className="space-y-1.5 text-left">
              <Typography
                variant="span"
                weight="semibold"
                className="block truncate text-sm text-[var(--gy-text)]"
              >
                {user?.fullName || "—"}
              </Typography>
              <Typography
                variant="span"
                className="block truncate text-xs text-[var(--gy-text-secondary)]"
              >
                {user?.email}
              </Typography>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {role && (
                  <Chip size="sm" variant="soft">
                    {role}
                  </Chip>
                )}
                {organization?.planTier && (
                  <Chip size="sm" variant="neutral">
                    {organization.planTier}
                  </Chip>
                )}
              </div>
            </div>
          </Menu>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
