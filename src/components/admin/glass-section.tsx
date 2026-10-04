"use client";

import type React from "react";
import { Card, CardBody, CardHeader } from "@galyan/ui";
import { GLASS_DIVIDER } from "./glass";

interface GlassSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right side of the header (filters, chips, buttons). */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Glass card with a titled header: the building block for admin charts, tables and lists. */
export function GlassSection({
  title,
  subtitle,
  aside,
  className,
  children,
}: GlassSectionProps) {
  return (
    <Card variant="glass" radius="xl" padding="lg" className={className}>
      <CardHeader className={`border-b p-0 pb-4 ${GLASS_DIVIDER}`}>
        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[var(--gy-text)]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-[var(--gy-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {aside && (
            <div className="flex flex-wrap items-center gap-3">{aside}</div>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0 pt-4">{children}</CardBody>
    </Card>
  );
}
