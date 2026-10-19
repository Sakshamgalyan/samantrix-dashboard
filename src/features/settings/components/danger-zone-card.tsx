"use client";

import React from "react";
import { Card, CardHeader, CardBody, Button, Input, Typography } from "@galyan/ui";
import { AlertTriangle } from "lucide-react";

export interface DangerZoneCardProps {
  organizationName: string;
  confirmName: string;
  deactivating: boolean;
  onConfirmNameChange: (val: string) => void;
  onDeactivate: () => void;
}

export const DangerZoneCard = ({
  organizationName,
  confirmName,
  deactivating,
  onConfirmNameChange,
  onDeactivate,
}: DangerZoneCardProps) => {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="lg"
      className="border border-[var(--gy-danger)]/40 bg-[var(--gy-danger)]/5 shadow-xs space-y-4"
    >
      <CardHeader>
        <div className="flex items-center gap-2.5 text-[var(--gy-danger)]">
          <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-danger)]/15 text-[var(--gy-danger)] shrink-0">
            <AlertTriangle className="size-4.5" />
          </div>
          <div>
            <Typography variant="h3" weight="bold" textColor="var(--gy-danger)" className="text-base sm:text-lg">
              Danger zone
            </Typography>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm mt-0.5">
              Deactivating your organization will revoke member access and freeze virtual offices.
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="mt-2">
        <div className="max-w-md space-y-3">
          <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
            Type{" "}
            <Typography variant="span" weight="bold" textColor="var(--gy-text)" className="font-mono">
              {organizationName}
            </Typography>{" "}
            to confirm deactivation.
          </Typography>
          <Input
            type="text"
            size="sm"
            aria-label="Confirm organization name"
            value={confirmName}
            onChange={(e) => onConfirmNameChange(e.target.value)}
            placeholder="Confirm organization name"
            fullWidth
          />
          <Button
            variant="danger"
            size="sm"
            onClick={onDeactivate}
            disabled={confirmName !== organizationName || deactivating}
            isLoading={deactivating}
            loadingText="Deactivating..."
            className="w-full sm:w-auto"
          >
            Deactivate organization
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
