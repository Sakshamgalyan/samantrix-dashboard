"use client";

import React from "react";
import { Button, Card, Chip, Modal, Typography } from "@galyan/ui";
import { Clock, Globe, ShieldAlert, User } from "lucide-react";
import { usePlatformAudit } from "@/features/platform-audit/context";
import { closeDetailModalAction } from "@/features/platform-audit/context/action";
import { GLASS_ROW } from "@/components/layout/common/glass";

export const PlatformAuditModal = () => {
  const { state, dispatch } = usePlatformAudit();
  const { selectedLog, isDetailModalOpen } = state;

  if (!selectedLog) return null;

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={() => dispatch(closeDetailModalAction())}
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-[var(--gy-primary)]" />
          <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
            Audit Record Telemetry
          </Typography>
        </div>
      }
      size="md"
    >
      <div className="space-y-4">
        {/* Header Summary */}
        <div className={`${GLASS_ROW} p-3 flex items-center justify-between flex-wrap gap-2`}>
          <div className="min-w-0">
            <Typography variant="small" weight="bold" textColor="var(--gy-text)" className="font-mono text-xs block break-all">
              {selectedLog.action}
            </Typography>
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-[11px] block mt-0.5 truncate">
              Resource: {selectedLog.target || "System Resource"}
            </Typography>
          </div>

          <Chip variant="soft" size="sm" className="uppercase font-mono text-[10px] shrink-0">
            {selectedLog.category}
          </Chip>
        </div>

        {/* Actor & Network Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <Card variant="glass" radius="lg" className="p-2.5 space-y-1">
            <Typography variant="small" weight="semibold" textColor="var(--gy-text-subtle)" className="text-[10px] uppercase block">
              Actor Identity
            </Typography>
            <div className="flex items-center gap-1.5 font-medium text-[var(--gy-text)]">
              <User className="size-3 text-[var(--gy-text-secondary)] shrink-0" />
              <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="truncate">
                {selectedLog.actorName || "Platform User"}
              </Typography>
            </div>
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="font-mono text-[11px] block truncate">
              {selectedLog.actorEmail || "system@simantrix.com"}
            </Typography>
            <Chip variant="primary" size="sm" className="text-[10px] mt-1 inline-flex">
              {selectedLog.actorRole || "MEMBER"}
            </Chip>
          </Card>

          <Card variant="glass" radius="lg" className="p-2.5 space-y-1">
            <Typography variant="small" weight="semibold" textColor="var(--gy-text-subtle)" className="text-[10px] uppercase block">
              Network Origin
            </Typography>
            <div className="flex items-center gap-1.5 font-mono text-[var(--gy-text)]">
              <Globe className="size-3 text-[var(--gy-text-secondary)] shrink-0" />
              <Typography variant="small" textColor="var(--gy-text)" className="font-mono text-xs">
                {selectedLog.ipAddress || "127.0.0.1"}
              </Typography>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--gy-text-subtle)]">
              <Clock className="size-3 text-[var(--gy-text-subtle)] shrink-0" />
              <Typography variant="small" textColor="var(--gy-text-subtle)" className="font-mono text-[11px]">
                {new Date(selectedLog.createdAt).toLocaleString()}
              </Typography>
            </div>
            {selectedLog.organizationId && (
              <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-[10px] font-mono block truncate mt-1">
                org: {selectedLog.organizationId}
              </Typography>
            )}
          </Card>
        </div>

        {/* JSON Details Block */}
        <div className="space-y-1.5">
          <Typography variant="small" weight="semibold" textColor="var(--gy-text-secondary)" className="text-xs block">
            Payload Changes & State Context
          </Typography>
          <pre className="p-3 rounded-lg bg-[var(--gy-bg-elevated)] border border-[var(--gy-border)] text-[11px] font-mono text-[var(--gy-text)] overflow-x-auto max-h-48 sm:max-h-56">
            {JSON.stringify(selectedLog.details || {}, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[var(--gy-border)]/60">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(closeDetailModalAction())}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
};

