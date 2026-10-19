"use client";

import React from "react";
import { Button, Card, Chip, Modal, Typography } from "@galyan/ui";
import {
  Cpu,
  Server,
  Zap,
} from "lucide-react";
import { useEcosystem } from "@/features/ecosystem/context";
import { closeDetailModalAction } from "@/features/ecosystem/context/action";
import { GLASS_ROW } from "@/components/layout/common/glass";

export const ServiceDetailModal = () => {
  const { state, dispatch } = useEcosystem();
  const { selectedService, isDetailModalOpen } = state;

  if (!selectedService) return null;

  const isOnline = ["HEALTHY", "ONLINE", "READY"].includes(selectedService.status);

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={() => dispatch(closeDetailModalAction())}
      title={
        <div className="flex items-center gap-2">
          <Server className="size-4 text-[var(--gy-success)]" />
          <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
            {selectedService.name} — Architecture & Telemetry
          </Typography>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {/* Basic Header Banner */}
        <div className={`${GLASS_ROW} p-3.5 flex items-center justify-between flex-wrap gap-2`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Typography variant="h6" className="font-bold text-[var(--gy-text)] text-base">
                {selectedService.name}
              </Typography>
              <Chip variant="soft" size="sm" className="font-mono text-xs">
                {selectedService.port > 0 ? `Port :${selectedService.port}` : "IPC Deep-link"}
              </Chip>
              <Chip variant="outline" size="sm" className="text-[var(--gy-text-subtle)] text-[10px]">
                {selectedService.version}
              </Chip>
            </div>
            <Typography variant="small" className="text-[var(--gy-text-secondary)] text-xs mt-0.5 block">
              {selectedService.description}
            </Typography>
          </div>

          <div className="flex items-center gap-2">
            <Chip
              variant={isOnline ? "success" : "danger"}
              size="sm"
              icon={
                <span
                  className={`size-1.5 rounded-full ${
                    isOnline ? "bg-[var(--gy-success)] animate-pulse" : "bg-[var(--gy-danger)]"
                  }`}
                />
              }
            >
              {selectedService.status}
            </Chip>
            {typeof selectedService.latencyMs === "number" && (
              <Chip variant="outline" size="sm" className="text-[10px] text-[var(--gy-text-subtle)]">
                <Zap className="size-2.5 mr-1 text-[var(--gy-warning)]" />
                {selectedService.latencyMs}ms
              </Chip>
            )}
          </div>
        </div>

        {/* System Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Card variant="glass" radius="lg" className="p-3">
            <Typography variant="small" className="text-[var(--gy-text-subtle)] text-xs block">
              Service Endpoint
            </Typography>
            <Typography variant="p" className="font-mono text-[var(--gy-text)] text-xs truncate mt-0.5">
              {selectedService.url}
            </Typography>
          </Card>

          <Card variant="glass" radius="lg" className="p-3">
            <Typography variant="small" className="text-[var(--gy-text-subtle)] text-xs block">
              Uptime Runtime
            </Typography>
            <Typography variant="p" className="font-mono text-[var(--gy-text)] text-xs truncate mt-0.5">
              {selectedService.uptime}
            </Typography>
          </Card>

          <Card variant="glass" radius="lg" className="p-3">
            <Typography variant="small" className="text-[var(--gy-text-subtle)] text-xs block">
              Deployment Info
            </Typography>
            <Typography variant="p" className="font-mono text-[var(--gy-text)] text-xs truncate mt-0.5">
              {selectedService.lastDeployed}
            </Typography>
          </Card>
        </div>

        {/* Detailed Metrics Table */}
        <div className="space-y-2">
          <Typography variant="h6" className="font-semibold text-[var(--gy-text)] text-sm flex items-center gap-1.5">
            <Cpu className="size-3.5 text-[var(--gy-primary)]" />
            Internal Process & Engine Telemetry
          </Typography>

          <div className="rounded-lg border border-[var(--gy-border)] overflow-x-auto min-w-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--gy-bg-elevated)] text-[var(--gy-text-secondary)] border-b border-[var(--gy-border)]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Metric Attribute</th>
                  <th className="py-2.5 px-3 font-medium">Recorded Value</th>
                  <th className="py-2.5 px-3 font-medium text-right">Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gy-border)]/50">
                {selectedService.metrics.map((m) => (
                  <tr key={m.name} className="hover:bg-[var(--gy-bg-elevated)]/40 transition-colors">
                    <td className="py-2 px-3 text-[var(--gy-text)] font-medium">{m.name}</td>
                    <td className="py-2 px-3 font-mono text-[var(--gy-text)]">{m.value}</td>
                    <td className="py-2 px-3 text-right">
                      <Chip
                        variant={
                          m.status === "optimal"
                            ? "success"
                            : m.status === "warning"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {m.status.toUpperCase()}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[var(--gy-border)]/60">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(closeDetailModalAction())}
          >
            Close Telemetry Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
};

