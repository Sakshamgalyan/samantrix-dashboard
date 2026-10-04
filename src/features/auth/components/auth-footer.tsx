"use client";

import React from "react";
import { Card, Typography } from "@galyan/ui";

const FOOTER_LINKS = [
  {
    label: "Status",
    message: "Samantrix Security Status: Operational. Zero-Trust perimeter active.",
  },
  { label: "Terms", message: "Samantrix Master Services Agreement & Terms." },
  { label: "Privacy", message: "Samantrix Data Processing & Privacy Policy." },
  { label: "Support", message: "Contact Support: enterprise-support@samantrix.io" },
];

export function AuthFooter() {
  return (
    <footer className="relative z-30 shrink-0 w-full px-3 pb-3 sm:px-5">
      <Card variant="glass" padding="none" radius="xl" className="w-full">
        <div className="flex h-11 w-full items-center justify-between gap-4 px-4 sm:px-5">
      <Typography variant="small" className="text-[11px] text-[var(--gy-text-subtle)]">
        © {new Date().getFullYear()} Samantrix Inc.
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
}
