"use client";

import type React from "react";
import { Button, Input, Modal, Typography } from "@galyan/ui";
import { ArrowDownLeft, Gauge, Rocket, Trash2, Undo2 } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { APP_META, ROLLOUT_PRESETS } from "@/features/versioning/common/constants";
import { useVersioningContext } from "@/features/versioning/context";
import { rolloutPercentSchema } from "@/features/versioning/types";

const COPY = {
  rollout: {
    icon: <Gauge className="size-5 text-amber-400" />,
    title: "Progressive Canary Rollout",
    confirm: "Update Traffic Share",
    variant: "primary" as const,
  },
  release: {
    icon: <Rocket className="size-5 text-emerald-400" />,
    title: "Deploy / Promote to 100% Production",
    confirm: "Deploy to Production",
    variant: "primary" as const,
  },
  rollback: {
    icon: <ArrowDownLeft className="size-5 text-rose-400" />,
    title: "Downgrade & Roll Back",
    confirm: "Confirm Rollback / Downgrade",
    variant: "danger" as const,
  },
  delete: {
    icon: <Trash2 className="size-5 text-rose-400" />,
    title: "Delete Release",
    confirm: "Delete Permanently",
    variant: "danger" as const,
  },
};

/** Confirms a status change or deletion of the release in the open dialog. */
export const ReleaseActionModal = () => {
  const { state, closeDialog, confirmAction, setRolloutPercent } = useVersioningContext();
  const dialog = state.dialog;
  const kind = dialog && dialog.kind !== "create" && dialog.kind !== "edit" ? dialog.kind : null;
  if (!dialog || !kind || !("release" in dialog)) return null;

  const { release } = dialog;
  const copy = COPY[kind];
  const name = `Simantrix Desktop v${release.version}`;
  const percent = dialog.kind === "rollout" ? dialog.percent : 0;
  const percentError =
    dialog.kind === "rollout" ? rolloutPercentSchema.safeParse(percent).error?.issues[0]?.message : undefined;

  let body: React.ReactNode;
  switch (dialog.kind) {
    case "rollout":
      body = (
        <div className="space-y-3">
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
            Direct a percentage of users to {name}. Once verified, promote to 100% to fully release.
          </Typography>
          <div className="flex flex-wrap gap-1.5">
            {ROLLOUT_PRESETS.map((p) => (
              <Button
                key={p}
                size="xs"
                variant={p === percent ? "primary" : "secondary"}
                onClick={() => setRolloutPercent(p)}
              >
                {p}% Traffic
              </Button>
            ))}
          </div>
          <Input
            label="Rollout Percentage (1-99%)"
            type="number"
            size="sm"
            value={String(percent)}
            onChange={(e) => setRolloutPercent(Math.round(Number(e.target.value) || 0))}
            hasError={!!percentError}
            error={percentError}
            fullWidth
          />
        </div>
      );
      break;
    case "release":
      body = (
        <div className="space-y-2">
          <Typography variant="small" textColor="var(--gy-text)" className="text-xs font-medium">
            Promoting {name} to 100% Production Traffic.
          </Typography>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs leading-relaxed">
            This will promote {name} to the active live desktop release on the {release.channel.toLowerCase()} channel for all desktop app clients.
          </Typography>
        </div>
      );
      break;
    case "rollback":
      body = (
        <div className="space-y-2">
          <Typography variant="small" textColor="var(--gy-danger)" className="text-xs font-semibold">
            Warning: Instant Desktop Rollback
          </Typography>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs leading-relaxed">
            Rolling back {name} will immediately deactivate this build from desktop clients.
            The desktop application will automatically fallback to the previous stable release.
          </Typography>
        </div>
      );
      break;
    case "delete":
      body = (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
          {name} and all its installer metadata will be permanently deleted from the registry. This action cannot be undone.
        </Typography>
      );
      break;
  }

  return (
    <Modal
      size="sm"
      isOpen
      onClose={closeDialog}
      icon={copy.icon}
      title={`${copy.title}: ${name}`}
      subtitle={release.title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={closeDialog} disabled={state.submitting}>
            Cancel
          </Button>
          <Button
            variant={copy.variant}
            size="sm"
            isLoading={state.submitting}
            disabled={Boolean(percentError)}
            onClick={() => void confirmAction()}
          >
            {copy.confirm}
          </Button>
        </div>
      }
    >
      <div className={`${GLASS_ROW} px-3 py-2.5`}>{body}</div>
    </Modal>
  );
};
