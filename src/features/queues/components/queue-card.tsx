"use client";

import React from "react";
import { Button, Card, Chip, Typography, useToast } from "@galyan/ui";
import {
  CheckCircle2,
  Mail,
  Pause,
  Play,
  Server,
  Trash2,
} from "lucide-react";
import type { QueueMetrics } from "@/features/queues/types";
import {
  useCleanQueueMutation,
  usePauseQueueMutation,
  useResumeQueueMutation,
} from "@/features/queues/context/api";
import { GLASS_ROW } from "@/components/layout/common/glass";

interface QueueCardProps {
  queue: QueueMetrics;
}

export const QueueCard = ({ queue }: QueueCardProps) => {
  const { toast } = useToast();
  const [pauseMutation, { isLoading: isPausing }] = usePauseQueueMutation();
  const [resumeMutation, { isLoading: isResuming }] = useResumeQueueMutation();
  const [cleanMutation, { isLoading: isCleaning }] = useCleanQueueMutation();

  const isMail = queue.name === "mail";

  const queueDescriptions: Record<string, string> = {
    mail: "Transactional emails, verification codes, password resets, and waitlist invites.",
    system: "Tenant workspace provisioning, database reconciliation, and security purges.",
  };

  const handleTogglePause = async () => {
    try {
      if (queue.isPaused) {
        await resumeMutation(queue.name).unwrap();
        toast({
          title: `Queue Resumed`,
          description: `Queue "${queue.name}" is now processing incoming jobs.`,
          variant: "success",
        });
      } else {
        await pauseMutation(queue.name).unwrap();
        toast({
          title: `Queue Paused`,
          description: `Queue "${queue.name}" has been paused. New jobs will wait in queue.`,
          variant: "warning",
        });
      }
    } catch {
      toast({
        title: "Action Failed",
        description: `Could not alter state for queue "${queue.name}".`,
        variant: "error",
      });
    }
  };

  const handleClean = async (status: "completed" | "failed") => {
    try {
      const res = await cleanMutation({ name: queue.name, status }).unwrap();
      toast({
        title: `Queue Cleaned`,
        description: res.message,
        variant: "success",
      });
    } catch {
      toast({
        title: "Clean Failed",
        description: `Could not clean ${status} jobs for queue "${queue.name}".`,
        variant: "error",
      });
    }
  };

  return (
    <Card
      variant="glass"
      radius="lg"
      className="p-4 flex flex-col justify-between transition-all hover:border-[var(--gy-primary)]/40"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--gy-border)] bg-[var(--gy-bg-elevated)]/60 shrink-0">
              {isMail ? (
                <Mail className="size-4 text-[var(--gy-warning)]" />
              ) : (
                <Server className="size-4 text-[var(--gy-primary)]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Typography variant="p" className="font-semibold text-[var(--gy-text)] text-sm uppercase tracking-wide">
                  {queue.name} Queue
                </Typography>
                <Chip variant="soft" size="sm" className="font-mono text-[10px]">
                  BullMQ
                </Chip>
              </div>
              <Typography variant="small" className="text-[var(--gy-text-secondary)] text-xs mt-0.5 block line-clamp-1">
                {queueDescriptions[queue.name] || "Asynchronous task worker"}
              </Typography>
            </div>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <Chip
              variant={queue.isPaused ? "warning" : "success"}
              size="sm"
              icon={
                <span
                  className={`size-1.5 rounded-full ${
                    queue.isPaused ? "bg-[var(--gy-warning)]" : "bg-[var(--gy-success)] animate-pulse"
                  }`}
                />
              }
            >
              {queue.isPaused ? "PAUSED" : "ACTIVE"}
            </Chip>
          </div>
        </div>

        {/* Counts Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className={`${GLASS_ROW} p-2.5`}>
            <Typography variant="small" weight="semibold" textColor="var(--gy-text-subtle)" className="text-[10px] uppercase block">
              Waiting
            </Typography>
            <Typography variant="span" weight="bold" textColor="var(--gy-info)" className="font-mono text-base mt-0.5 block">
              {queue.waiting}
            </Typography>
          </div>

          <div className={`${GLASS_ROW} p-2.5`}>
            <Typography variant="small" weight="semibold" textColor="var(--gy-text-subtle)" className="text-[10px] uppercase block">
              Active
            </Typography>
            <Typography variant="span" weight="bold" textColor="var(--gy-success)" className="font-mono text-base mt-0.5 block">
              {queue.active}
            </Typography>
          </div>

          <div className={`${GLASS_ROW} p-2.5`}>
            <Typography variant="small" weight="semibold" textColor="var(--gy-text-subtle)" className="text-[10px] uppercase block">
              Completed
            </Typography>
            <Typography variant="span" weight="bold" textColor="var(--gy-primary)" className="font-mono text-base mt-0.5 block">
              {queue.completed}
            </Typography>
          </div>

          <div className={`${GLASS_ROW} p-2.5`}>
            <Typography variant="small" weight="semibold" textColor="var(--gy-text-subtle)" className="text-[10px] uppercase block">
              Failed
            </Typography>
            <Typography
              variant="span"
              weight="bold"
              textColor={queue.failed > 0 ? "var(--gy-danger)" : "var(--gy-text-subtle)"}
              className="font-mono text-base mt-0.5 block"
            >
              {queue.failed}
            </Typography>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-[var(--gy-border)]/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTogglePause}
            disabled={isPausing || isResuming}
            className="text-xs px-2.5"
          >
            {queue.isPaused ? (
              <>
                <Play className="size-3 mr-1 text-[var(--gy-success)]" />
                Resume
              </>
            ) : (
              <>
                <Pause className="size-3 mr-1 text-[var(--gy-warning)]" />
                Pause
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleClean("completed")}
            disabled={isCleaning || queue.completed === 0}
            className="text-xs px-2.5"
          >
            <CheckCircle2 className="size-3 mr-1 text-[var(--gy-primary)]" />
            Purge Done
          </Button>
        </div>

        {queue.failed > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleClean("failed")}
            disabled={isCleaning}
            className="text-xs px-2.5"
          >
            <Trash2 className="size-3 mr-1" />
            Clear Failed ({queue.failed})
          </Button>
        )}
      </div>
    </Card>
  );
};

