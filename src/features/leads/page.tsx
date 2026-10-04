"use client";

import React from "react";
import { Card, CardHeader, CardBody, Chip, Button } from "@galyan/ui";
import { Target, Users, Mail, Clock, RefreshCw } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card variant="elevated" radius="xl" padding="lg">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="solid" size="sm">
                Inbound & Growth
              </Chip>
              <Chip variant="soft" size="sm">
                Waitlist Queue
              </Chip>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--gy-text)] sm:text-2xl">
              Leads & Early Access Waitlist
            </h2>
            <p className="max-w-2xl text-sm text-[var(--gy-text-secondary)]">
              Track inbound contact requests, enterprise inquiries, and manage the early-access waitlist queue.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card variant="default" radius="lg" padding="md">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
              <Target className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--gy-text-secondary)]">Total Inquiries</p>
              <p className="text-lg font-semibold text-[var(--gy-text)]">Active Pipeline</p>
            </div>
          </div>
        </Card>

        <Card variant="default" radius="lg" padding="md">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--gy-text-secondary)]">Pending Follow-up</p>
              <p className="text-lg font-semibold text-[var(--gy-text)]">Review Queue</p>
            </div>
          </div>
        </Card>

        <Card variant="default" radius="lg" padding="md">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-success)]/10 text-[var(--gy-success)]">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--gy-text-secondary)]">Waitlist</p>
              <p className="text-lg font-semibold text-[var(--gy-text)]">Early Access</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card variant="elevated" radius="xl" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
              <Mail className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--gy-text)]">
                Inbound Lead Pipeline
              </h3>
              <p className="text-xs text-[var(--gy-text-secondary)]">
                Lead management interface is currently being connected to the backend API.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="mt-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--gy-border)] p-12 text-center">
            <Target className="size-10 text-[var(--gy-text-subtle)]" />
            <h4 className="mt-3 text-sm font-semibold text-[var(--gy-text)]">
              Lead Management Hub
            </h4>
            <p className="mt-1 max-w-sm text-xs text-[var(--gy-text-secondary)]">
              Inbound contact form submissions and waitlist entries from the marketing site will appear here for review and status updates.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
