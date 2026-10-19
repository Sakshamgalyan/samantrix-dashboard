"use client";

import React from "react";
import { Card, Chip, Typography } from "@galyan/ui";
import {
  ArrowRight,
  Network,
} from "lucide-react";
import type { EcosystemService } from "@/features/ecosystem/types";
import { GLASS_ROW } from "@/components/layout/common/glass";

interface QuickPingPanelProps {
  services: EcosystemService[];
}

export const QuickPingPanel = ({ services }: QuickPingPanelProps) => {
  const backend = services.find((s) => s.id === "backend");
  const frontend = services.find((s) => s.id === "frontend");
  const home = services.find((s) => s.id === "home");

  const links = [
    {
      source: "simantrix-frontend",
      target: "simantrix-backend",
      protocol: "REST /api/v1 + Socket.IO 4.8",
      port: "4200 ➔ 5000",
      status: frontend?.status === "ONLINE" && backend?.status === "HEALTHY" ? "active" : "standby",
    },
    {
      source: "simantrix-home",
      target: "simantrix-backend",
      protocol: "BFF Proxy + Gateway Secret",
      port: "4000 ➔ 5000",
      status: home?.status === "ONLINE" && backend?.status === "HEALTHY" ? "active" : "standby",
    },
    {
      source: "simantrix-app",
      target: "simantrix-frontend",
      protocol: "Electron 43 Webview Shell",
      port: "IPC ➔ 4200",
      status: "active",
    },
    {
      source: "simantrix-backend",
      target: "PostgreSQL & Mongo",
      protocol: "Prisma 7.9 ORM + Mongoose 8",
      port: "5000 ➔ 5432 / 27017",
      status: backend?.status === "HEALTHY" ? "active" : "degraded",
    },
  ];

  return (
    <Card variant="glass" radius="lg" className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[var(--gy-border)]/60">
        <div className="flex items-center gap-2">
          <Network className="size-4 text-[var(--gy-primary)] shrink-0" />
          <Typography variant="p" className="font-semibold text-[var(--gy-text)] text-sm">
            Ecosystem Inter-Service Matrix & Communication Bus
          </Typography>
        </div>
        <Chip variant="soft" size="sm" className="text-xs shrink-0 self-start sm:self-auto">
          Multi-Tenant Mesh
        </Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map((link) => (
          <div
            key={link.source + link.target}
            className={`${GLASS_ROW} p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[var(--gy-primary)]/40 transition-colors`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gy-text)] flex-wrap">
                <span>{link.source}</span>
                <ArrowRight className="size-3 text-[var(--gy-text-subtle)] shrink-0" />
                <span className="text-[var(--gy-primary)]">{link.target}</span>
              </div>
              <Typography variant="small" className="text-[var(--gy-text-secondary)] text-[11px] block truncate">
                {link.protocol}
              </Typography>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end gap-1.5 shrink-0">
              <Chip variant="outline" size="sm" className="font-mono text-[10px]">
                {link.port}
              </Chip>
              <Chip
                variant={link.status === "active" ? "success" : "warning"}
                size="sm"
                className="text-[10px]"
              >
                {link.status.toUpperCase()}
              </Chip>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

