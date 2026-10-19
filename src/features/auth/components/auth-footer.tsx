"use client";

import React from "react";
import { Card, Typography } from "@galyan/ui";

const FOOTER_LINKS = [
  {
    label: "Status",
    message: "Simantrix Security Status: Operational. Zero-Trust perimeter active.",
  },
  { label: "Terms", message: "Simantrix Master Services Agreement & Terms." },
  { label: "Privacy", message: "Simantrix Data Processing & Privacy Policy." },
  { label: "Support", message: "Contact Support: enterprise-support@Simantrix.io" },
];

export const AuthFooter = () => {
  return (
    <footer className="relative z-30 shrink-0 w-full px-3 pb-2 sm:px-5 sm:pb-2.5">
      <Card variant="glass" padding="none" radius="xl" className="w-full">
        <div className="flex h-9 sm:h-10 w-full items-center justify-between gap-4 px-4 sm:px-5">
      <Typography variant="small" className="text-[11px] text-[var(--gy-text-subtle)]">
        © {new Date().getFullYear()} Simantrix Inc.
      </Typography>

      <nav className="flex items-center gap-4">
        {FOOTER_LINKS.map((link) => (
          <Typography
            key={link.label}
            as="button"
            variant="small"
            weight="medium"
            onClick={() => alert(link.message)}
            className="cursor-pointer text-[11px] text-[var(--gy-text-subtle)] transition-colors hover:text-[var(--gy-text)]"
          >
            {link.label}
          </Typography>
        ))}
      </nav>
        </div>
      </Card>
    </footer>
  );
};
