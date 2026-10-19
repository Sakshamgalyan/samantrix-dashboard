"use client";

import React from "react";
import { Card, Chip, Typography } from "@galyan/ui";
import { Clock, Radio, User, Wifi } from "lucide-react";
import type { ConnectedSocket } from "@/features/realtime-monitor/types";

interface ConnectedSocketsTableProps {
  sockets: ConnectedSocket[];
  isLoading: boolean;
}

export const ConnectedSocketsTable = ({
  sockets,
  isLoading,
}: ConnectedSocketsTableProps) => {
  const formatTime = (ts: number) => {
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return "Active";
    }
  };

  return (
    <Card variant="glass" radius="lg" className="p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--gy-border)]/60">
        <div className="flex items-center gap-2">
          <Wifi className="size-4 text-[var(--gy-success)] shrink-0" />
          <Typography variant="p" className="font-semibold text-[var(--gy-text)] text-sm">
            Live Connected Sockets ({sockets.length})
          </Typography>
        </div>
        <Chip variant="success" size="sm" className="text-xs">
          Handshake Verified
        </Chip>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-[var(--gy-text-subtle)]">
            Loading active socket mesh...
          </div>
        ) : sockets.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--gy-text-subtle)]">
            No active client sockets currently connected.
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< md) */}
            <div className="block md:hidden space-y-2.5">
              {sockets.map((sock) => (
                <div
                  key={sock.socketId}
                  className="p-3 rounded-xl border border-[var(--gy-border)]/50 bg-[var(--gy-surface)]/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-7 rounded-full bg-[var(--gy-bg-elevated)] border border-[var(--gy-border)] flex items-center justify-center text-[var(--gy-text-secondary)] shrink-0">
                        <User className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="truncate block">
                          {sock.fullName}
                        </Typography>
                        {sock.userId && (
                          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-[10px] font-mono truncate block">
                            uid: {sock.userId.slice(0, 8)}...
                          </Typography>
                        )}
                      </div>
                    </div>
                    <Chip variant="outline" size="sm" className="text-[10px] uppercase font-mono shrink-0">
                      {sock.transport}
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--gy-border)]/40 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono truncate">
                      <Radio className="size-3 text-[var(--gy-primary)] shrink-0" />
                      {sock.officeId ? (
                        <span className="text-[var(--gy-primary)] font-medium truncate">
                          office:{sock.officeId.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-[var(--gy-text-subtle)]">In Lobby</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--gy-text-subtle)] shrink-0">
                      <Clock className="size-3" />
                      <span>{formatTime(sock.connectedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--gy-bg-elevated)] text-[var(--gy-text-secondary)] border-b border-[var(--gy-border)]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Socket ID</th>
                    <th className="py-2.5 px-3 font-medium">User Profile</th>
                    <th className="py-2.5 px-3 font-medium">Virtual Office</th>
                    <th className="py-2.5 px-3 font-medium">Transport</th>
                    <th className="py-2.5 px-3 font-medium text-right">Connected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gy-border)]/50">
                  {sockets.map((sock) => (
                    <tr key={sock.socketId} className="hover:bg-[var(--gy-bg-elevated)]/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--gy-text)]">
                        {sock.socketId.slice(0, 12)}...
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-[var(--gy-bg-elevated)] border border-[var(--gy-border)] flex items-center justify-center text-[var(--gy-text-secondary)] shrink-0">
                            <User className="size-3" />
                          </div>
                          <div>
                            <span className="font-medium text-[var(--gy-text)] block">
                              {sock.fullName}
                            </span>
                            {sock.userId && (
                              <span className="font-mono text-[10px] text-[var(--gy-text-subtle)]">
                                {sock.userId.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[var(--gy-text-secondary)] text-[11px]">
                        {sock.officeId ? (
                          <span className="text-[var(--gy-primary)] font-medium">office:{sock.officeId.slice(0, 8)}</span>
                        ) : (
                          <span className="text-[var(--gy-text-subtle)]">In Lobby</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Chip variant="outline" size="sm" className="text-[10px] uppercase font-mono">
                          {sock.transport}
                        </Chip>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[var(--gy-text-subtle)] text-[11px]">
                        {formatTime(sock.connectedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

