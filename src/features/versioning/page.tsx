"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Table,
  Column,
  Input,
  Dropdown,
  Toggle,
  useToast,
} from "@galyan/ui";
import { Tag, Rocket, Globe } from "lucide-react";

type ReleaseChannel = "STABLE" | "BETA" | "CANARY";

export interface ReleaseEntry {
  version: string;
  codename: string;
  channel: ReleaseChannel;
  releaseDate: string;
  headline: string;
  highlights: string[];
  isCurrentMarketingRelease: boolean;
}

const CHANNEL_OPTIONS: { value: ReleaseChannel; label: string }[] = [
  { value: "STABLE", label: "Stable production" },
  { value: "BETA", label: "Public beta" },
  { value: "CANARY", label: "Canary nightly" },
];

export default function AdminVersioningPage() {
  const { toast } = useToast();

  // Current Marketing Version State
  const [versionNumber, setVersionNumber] = useState("v1.4.0");
  const [codename, setCodename] = useState("Horizon Nebula");
  const [channel, setChannel] = useState<ReleaseChannel>("STABLE");
  const [headline, setHeadline] = useState(
    "Next.js 16 App Router, LiveKit SFU Spatial Audio & Unity 6 WebGL Integration",
  );
  const [showMarketingBanner, setShowMarketingBanner] = useState(true);
  const [bannerMessage, setBannerMessage] = useState(
    "🚀 Samantrix v1.4.0 Horizon is live! Experience low-latency spatial audio in virtual office.",
  );

  const [saving, setSaving] = useState(false);

  // Past Releases History
  const [history, setHistory] = useState<ReleaseEntry[]>([
    {
      version: "v1.4.0",
      codename: "Horizon Nebula",
      channel: "STABLE",
      releaseDate: "2026-10-01",
      headline: "LiveKit SFU 3D audio, Next.js 16 proxy, Electron 43 desktop shell.",
      highlights: ["LiveKit SFU Attenuation", "Galyan UI Design Tokens", "Prisma 7 Multi-DB"],
      isCurrentMarketingRelease: true,
    },
    {
      version: "v1.3.2",
      codename: "Helios Dawn",
      channel: "STABLE",
      releaseDate: "2026-08-15",
      headline: "Three.js office scene optimizations and multi-tenant DB2 workspace isolation.",
      highlights: ["Three.js Desk Assets", "JWT Refresh Cycle", "Audit Logging Category"],
      isCurrentMarketingRelease: false,
    },
    {
      version: "v1.2.0",
      codename: "Starlight Prime",
      channel: "STABLE",
      releaseDate: "2026-06-10",
      headline: "Initial multi-tenant virtual workplace release with Socket.IO real-time sync.",
      highlights: ["Socket.IO 4.8 Gateway", "Redis Presence Cache", "Stripe Billing Webhooks"],
      isCurrentMarketingRelease: false,
    },
  ]);

  const handlePublishRelease = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHistory((prev) => [
        {
          version: versionNumber,
          codename,
          channel,
          releaseDate: new Date().toISOString().split("T")[0],
          headline,
          highlights: ["Realtime Telemetry", "Marketing Version Sync", "RBAC Controls"],
          isCurrentMarketingRelease: true,
        },
        ...prev.map((r) => ({ ...r, isCurrentMarketingRelease: false })),
      ]);

      toast.success(
        `Version ${versionNumber} (${codename}) published and synced with the samantrix-home marketing page.`,
      );
    }, 600);
  };

  const columns: Column<ReleaseEntry>[] = [
    {
      key: "version",
      header: "Version",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--gy-text)]">
            {row.version}
          </span>
          <span className="text-xs font-medium text-[var(--gy-primary)]">{row.codename}</span>
        </div>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      accessor: (row) => (
        <Chip
          variant={
            row.channel === "STABLE" ? "success" : row.channel === "BETA" ? "warning" : "danger"
          }
          size="sm"
        >
          {CHANNEL_OPTIONS.find((o) => o.value === row.channel)?.label ?? row.channel}
        </Chip>
      ),
    },
    {
      key: "headline",
      header: "Highlights",
      accessor: (row) => (
        <p className="max-w-md truncate text-xs text-[var(--gy-text-secondary)]" title={row.headline}>
          {row.headline}
        </p>
      ),
    },
    {
      key: "releaseDate",
      header: "Release date",
      accessor: (row) => (
        <span className="text-xs tabular-nums text-[var(--gy-text-subtle)]">{row.releaseDate}</span>
      ),
    },
    {
      key: "isCurrentMarketingRelease",
      header: "Status",
      align: "right",
      accessor: (row) =>
        row.isCurrentMarketingRelease ? (
          <Chip variant="solid" size="sm">
            Live on portal
          </Chip>
        ) : (
          <Chip variant="neutral" size="sm">
            Archived
          </Chip>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card variant="elevated" radius="xl" padding="lg">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="warning" size="sm">
                Release management
              </Chip>
              <Chip variant="soft" size="sm">
                Marketing sync
              </Chip>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--gy-text)] sm:text-2xl">
              Platform versioning & release notes
            </h2>
            <p className="max-w-2xl text-sm text-[var(--gy-text-secondary)]">
              Publish new Samantrix software versions, update public release announcements on the
              marketing website, and broadcast changelog updates.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Rocket className="size-3.5" />}
            onClick={handlePublishRelease}
            disabled={saving}
            isLoading={saving}
            loadingText="Publishing..."
          >
            Publish & sync
          </Button>
        </div>
      </Card>

      {/* Release Editor Card */}
      <Card variant="elevated" radius="xl" padding="lg">
        <CardHeader>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
                <Tag className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--gy-text)]">
                  Active marketing release
                </h3>
                <p className="text-xs text-[var(--gy-text-secondary)]">
                  Values reflected live in the public marketing header & changelog
                </p>
              </div>
            </div>
            <Chip variant="success" size="sm">
              Current: {versionNumber}
            </Chip>
          </div>
        </CardHeader>

        <CardBody className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Semantic version tag"
              value={versionNumber}
              onChange={(e) => setVersionNumber(e.target.value)}
              placeholder="v1.4.0"
              fullWidth
            />
            <Input
              label="Release codename"
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              placeholder="Horizon Nebula"
              fullWidth
            />
            <Dropdown
              label="Release channel"
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={(val) => setChannel(val as ReleaseChannel)}
            />
          </div>

          <Input
            label="Public release headline / summary"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Summary of major features and improvements..."
            fullWidth
          />

          {/* Marketing Top Banner Announcement */}
          <div className="space-y-3 rounded-2xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-[var(--gy-info)]" />
                <span className="text-sm font-medium text-[var(--gy-text)]">
                  Marketing page announcement banner
                </span>
              </div>
              <Toggle
                size="sm"
                checked={showMarketingBanner}
                onChange={(e) => setShowMarketingBanner(e.target.checked)}
                label={showMarketingBanner ? "Visible" : "Hidden"}
                aria-label="Show marketing announcement banner"
              />
            </div>

            {showMarketingBanner && (
              <Input
                value={bannerMessage}
                onChange={(e) => setBannerMessage(e.target.value)}
                aria-label="Banner message"
                fullWidth
              />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Release History Table */}
      <Card variant="elevated" radius="xl" padding="lg">
        <CardHeader>
          <div className="flex w-full items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-[var(--gy-text)]">Release timeline</h3>
            <span className="text-xs text-[var(--gy-text-subtle)]">
              {history.length} versions
            </span>
          </div>
        </CardHeader>

        <CardBody className="mt-4">
          <div className="overflow-x-auto">
            <Table<ReleaseEntry>
              columns={columns}
              data={history}
              rowKey={(row) => row.version}
              variant="striped"
              hoverable={true}
              size="md"
              emptyStateLabel="No releases published yet"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
