"use client";

import React from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  Textarea,
  Typography,
  useToast,
} from "@galyan/ui";
import { AlertTriangle, Info, Megaphone, Send, ShieldAlert } from "lucide-react";
import { useRealtimeMonitor } from "@/features/realtime-monitor/context";
import {
  closeBroadcastModalAction,
  resetBroadcastFormAction,
  setIsBroadcastingAction,
  updateBroadcastFormAction,
} from "@/features/realtime-monitor/context/action";
import { useBroadcastGatewayAnnouncementMutation } from "@/features/realtime-monitor/context/api";

export const BroadcastModal = () => {
  const { state, dispatch } = useRealtimeMonitor();
  const { isBroadcastModalOpen, broadcastForm, isBroadcasting } = state;
  const { toast } = useToast();

  const [broadcastMutation] = useBroadcastGatewayAnnouncementMutation();

  if (!isBroadcastModalOpen) return null;

  const handleSend = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both an announcement title and message content.",
        variant: "warning",
      });
      return;
    }

    dispatch(setIsBroadcastingAction(true));
    try {
      const res = await broadcastMutation(broadcastForm).unwrap();
      toast({
        title: "Announcement Dispatched",
        description: `Broadcast sent live across ${res.broadcastCount} active WebSocket connection(s).`,
        variant: "success",
      });
      dispatch(resetBroadcastFormAction());
      dispatch(closeBroadcastModalAction());
    } catch {
      toast({
        title: "Broadcast Failed",
        description: "Could not emit the announcement through the Realtime Gateway.",
        variant: "error",
      });
    } finally {
      dispatch(setIsBroadcastingAction(false));
    }
  };

  const getSeverityVariant = () => {
    switch (broadcastForm.severity) {
      case "urgent":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Modal
      isOpen={isBroadcastModalOpen}
      onClose={() => dispatch(closeBroadcastModalAction())}
      title={
        <div className="flex items-center gap-2">
          <Megaphone className="size-4 text-[var(--gy-warning)]" />
          <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
            Workplace Announcement Broadcast
          </Typography>
        </div>
      }
      size="md"
    >
      <div className="space-y-4">
        <Typography variant="small" className="text-[var(--gy-text-secondary)] text-xs block">
          Dispatch an instant system notification to all connected virtual office clients (3D Unity, 2D Blueprint, and Web).
        </Typography>

        {/* Title Input */}
        <div className="space-y-1">
          <Typography variant="label" className="text-xs font-medium text-[var(--gy-text-secondary)] block">
            Announcement Title
          </Typography>
          <Input
            placeholder="e.g. Scheduled Maintenance in 10 Minutes"
            value={broadcastForm.title}
            onChange={(e) =>
              dispatch(updateBroadcastFormAction({ title: e.target.value }))
            }
          />
        </div>

        {/* Message Input */}
        <div className="space-y-1">
          <Typography variant="label" className="text-xs font-medium text-[var(--gy-text-secondary)] block">
            Broadcast Message
          </Typography>
          <Textarea
            placeholder="Provide context or instructions for active users..."
            value={broadcastForm.message}
            onChange={(e) =>
              dispatch(updateBroadcastFormAction({ message: e.target.value }))
            }
            rows={3}
          />
        </div>

        {/* Severity Selector */}
        <div className="space-y-1.5">
          <Typography variant="label" className="text-xs font-medium text-[var(--gy-text-secondary)] block">
            Severity Level
          </Typography>
          <div className="flex items-center gap-2 flex-wrap">
            {(["info", "warning", "urgent"] as const).map((sev) => (
              <Chip
                key={sev}
                variant={broadcastForm.severity === sev ? getSeverityVariant() : "outline"}
                size="sm"
                clickable
                onClick={() =>
                  dispatch(updateBroadcastFormAction({ severity: sev }))
                }
                className="capitalize cursor-pointer"
              >
                {sev}
              </Chip>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        {broadcastForm.title && (
          <div className="space-y-1 pt-1">
            <Typography variant="small" className="text-[11px] text-[var(--gy-text-subtle)] block">
              Live Announcement Preview:
            </Typography>
            <div
              className={`p-3 rounded-lg border ${
                broadcastForm.severity === "urgent"
                  ? "bg-[var(--gy-danger)]/10 border-[var(--gy-danger)]/30 text-[var(--gy-danger)]"
                  : broadcastForm.severity === "warning"
                  ? "bg-[var(--gy-warning)]/10 border-[var(--gy-warning)]/30 text-[var(--gy-warning)]"
                  : "bg-[var(--gy-primary)]/10 border-[var(--gy-primary)]/30 text-[var(--gy-primary)]"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                {broadcastForm.severity === "urgent" ? (
                  <ShieldAlert className="size-3.5" />
                ) : broadcastForm.severity === "warning" ? (
                  <AlertTriangle className="size-3.5" />
                ) : (
                  <Info className="size-3.5" />
                )}
                <span>{broadcastForm.title}</span>
              </div>
              <p className="text-xs mt-1 text-[var(--gy-text)] break-words">{broadcastForm.message || "Message details..."}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--gy-border)]/60">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(closeBroadcastModalAction())}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={isBroadcasting}
          >
            <Send className="size-3.5 mr-1.5" />
            {isBroadcasting ? "Broadcasting..." : "Dispatch Now"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

