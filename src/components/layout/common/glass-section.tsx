"use client";

import type React from "react";
import { Card, CardBody, CardHeader, Typography } from "@galyan/ui";
import { GLASS_DIVIDER } from "@/components/layout/common/glass";

export interface GlassSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right side of the header (filters, chips, buttons). */
  aside?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

/** Glass card with a titled header: the building block for charts, tables and lists. */
export const GlassSection = ({
  title,
  subtitle,
  aside,
  className,
  headerClassName,
  children,
}: GlassSectionProps) => {
  return (
    <Card variant="glass" radius="lg" padding="md" className={className}>
      <CardHeader className={`border-b p-0 pb-3 ${GLASS_DIVIDER}`}>
        <div
          className={`flex w-full flex-col justify-between gap-3 ${
            headerClassName || "sm:flex-row sm:items-center"
          }`}
        >
          <div className="min-w-0">
            <Typography
              variant="h4"
              as="h3"
              weight="semibold"
              textColor="var(--gy-text)"
              className="text-sm font-semibold tracking-tight"
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs"
              >
                {subtitle}
              </Typography>
            )}
          </div>
          {aside && (
            <div className="flex flex-wrap items-center gap-2">{aside}</div>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0 pt-3">{children}</CardBody>
    </Card>
  );
};
