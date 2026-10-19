"use client";

import React, { useState } from "react";
import { Button, Chip, Typography, useToast } from "@galyan/ui";
import { Laptop, LogOut, MonitorSmartphone } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatDateTime, relativeTime } from "@/utils/format";
import { errorMessage, useRevokeSessionMutation, type AccountSession } from "@/features/admin-settings/account/api";

/** Devices currently signed in to this account, with sign-out for the others. */
export const SessionsCard = ({
  sessions,
  maxDevices = 5,
}: {
  sessions: AccountSession[];
  maxDevices?: number;
}) => {
  const { toast } = useToast();
  const [revokeSession] = useRevokeSessionMutation();
  const [revoking, setRevoking] = useState<string | null>(null);

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      // Invalidates the device list, which refetches once
      await revokeSession(id).unwrap();
      toast.success("Device signed out");
    } catch (err) {
      toast.error(errorMessage(err, "Could not sign out that device."));
    } finally {
      setRevoking(null);
    }
  };

  const sorted = [...sessions].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

  return (
    <GlassSection
      title="Signed-in devices"
      subtitle={`Up to ${maxDevices} devices can be signed in at once`}
      aside={
        <Chip size="sm" variant={sessions.length >= maxDevices ? "warning" : "neutral"}>
          {sessions.length} / {maxDevices}
        </Chip>
      }
    >
      {sorted.length === 0 ? (
        <SectionEmpty icon={<MonitorSmartphone className="size-5" />} title="No active devices" />
      ) : (
        <div className="space-y-2">
          {sorted.map((s) => (
            <div key={s.id} className={`${GLASS_ROW} flex flex-wrap items-center justify-between gap-3 px-3 py-2.5`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
                  <Laptop className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="truncate text-sm">
                      {s.deviceName || "Unknown device"}
                    </Typography>
                    {s.isCurrent && (
                      <Chip size="sm" variant="success">
                        This device
                      </Chip>
                    )}
                  </div>
                  <Typography variant="small" textColor="var(--gy-text-secondary)" className="block truncate text-xs mt-0.5">
                    <span title={formatDateTime(s.lastSeenAt)}>Active {relativeTime(s.lastSeenAt)}</span>
                    {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                    {` · signed in ${formatDateTime(s.loginAt)}`}
                  </Typography>
                </div>
              </div>
              {!s.isCurrent && (
                <Button
                  variant="danger-soft"
                  size="sm"
                  leftIcon={<LogOut className="size-3.5" />}
                  isLoading={revoking === s.id}
                  disabled={revoking !== null}
                  onClick={() => void revoke(s.id)}
                  className="text-xs shrink-0 self-end sm:self-auto"
                >
                  Sign out
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassSection>
  );
};

