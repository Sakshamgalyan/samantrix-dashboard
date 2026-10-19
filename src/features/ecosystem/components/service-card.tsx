"use client";

import React from "react";
import { Button, Card, Chip, Typography } from "@galyan/ui";
import {
  AppWindow,
  ExternalLink,
  Eye,
  Globe,
  Laptop,
  Radio,
  Server,
  Zap,
} from "lucide-react";
import type { EcosystemService } from "@/features/ecosystem/types";
import { useEcosystem } from "@/features/ecosystem/context";
import { openDetailModalAction } from "@/features/ecosystem/context/action";
import { GLASS_ROW } from "@/components/layout/common/glass";

interface ServiceCardProps {
  service: EcosystemService;
  onPingSingle: (service: EcosystemService) => void;
  isPinging: boolean;
}

export const ServiceCard = ({ service, onPingSingle, isPinging }: ServiceCardProps) => {
  const { dispatch } = useEcosystem();

  const getServiceIcon = (id: string) => {
    switch (id) {
      case "backend":
        return <Server className="size-4 text-[var(--gy-success)]" />;
      case "frontend":
        return <AppWindow className="size-4 text-[var(--gy-primary)]" />;
      case "home":
        return <Globe className="size-4 text-[var(--gy-info)]" />;
      case "desktop":
        return <Laptop className="size-4 text-violet-500" />;
      default:
        return <Radio className="size-4 text-[var(--gy-text-subtle)]" />;
    }
  };

  const isOnline = ["HEALTHY", "ONLINE", "READY"].includes(service.status);
  const isDegraded = service.status === "DEGRADED";

  const getStatusVariant = (): "success" | "warning" | "danger" => {
    if (isOnline) return "success";
    if (isDegraded) return "warning";
    return "danger";
  };

  const handleInspect = () => {
    dispatch(openDetailModalAction(service));
  };

  return (
    <Card
      variant="glass"
      radius="lg"
      className="p-4 flex flex-col justify-between transition-all hover:border-[var(--gy-primary)]/40"
    >
      <div>
        {/* Header: Service Name + Port + Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--gy-border)] bg-[var(--gy-bg-elevated)]/60 shrink-0">
              {getServiceIcon(service.id)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Typography variant="p" className="font-semibold text-[var(--gy-text)] text-sm">
                  {service.name}
                </Typography>
                <Chip variant="soft" size="sm" className="font-mono text-xs">
                  {service.port > 0 ? `:${service.port}` : "IPC"}
                </Chip>
                <Chip variant="outline" size="sm" className="text-[var(--gy-text-subtle)] text-[10px]">
                  {service.version}
                </Chip>
              </div>
              <Typography variant="small" className="text-[var(--gy-text-secondary)] line-clamp-1 text-xs mt-0.5 block">
                {service.description}
              </Typography>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end gap-1.5 shrink-0">
            <Chip
              variant={getStatusVariant()}
              size="sm"
              icon={
                <span
                  className={`size-1.5 rounded-full ${
                    isOnline
                      ? "bg-[var(--gy-success)] animate-pulse"
                      : isDegraded
                      ? "bg-[var(--gy-warning)]"
                      : "bg-[var(--gy-danger)]"
                  }`}
                />
              }
            >
              {service.status}
            </Chip>
            {typeof service.latencyMs === "number" && service.latencyMs > 0 && (
              <Chip variant="outline" size="sm" className="text-[10px] text-[var(--gy-text-subtle)]">
                <Zap className="size-2.5 mr-1 text-[var(--gy-warning)]" />
                {service.latencyMs}ms
              </Chip>
            )}
          </div>
        </div>

        {/* Live Metrics Snippet */}
        <div className="mt-3.5 pt-3 border-t border-[var(--gy-border)]/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--gy-text-subtle)] mb-1">
            <span>Uptime:</span>
            <span className="font-mono text-[var(--gy-text)]">{service.uptime}</span>
          </div>

          {service.metrics.slice(0, 3).map((metric) => (
            <div
              key={metric.name}
              className={`${GLASS_ROW} flex items-center justify-between text-xs py-1 px-2.5`}
            >
              <span className="text-[var(--gy-text-secondary)] truncate pr-2">{metric.name}</span>
              <span
                className={`font-mono text-[11px] truncate font-medium shrink-0 ${
                  metric.status === "optimal"
                    ? "text-[var(--gy-success)]"
                    : metric.status === "warning"
                    ? "text-[var(--gy-warning)]"
                    : "text-[var(--gy-danger)]"
                }`}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--gy-border)]/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInspect}
            className="text-xs px-2.5"
          >
            <Eye className="size-3.5 mr-1" />
            Inspect
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPingSingle(service)}
            disabled={isPinging}
            className="text-xs px-2.5"
          >
            <Zap className="size-3 mr-1 text-[var(--gy-warning)]" />
            Ping
          </Button>
        </div>

        {service.url && service.url.startsWith("http") && (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[var(--gy-text-secondary)] hover:text-[var(--gy-primary)] transition-colors"
          >
            Open <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </Card>
  );
};

