"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Banner, Button, Card, Chip, Skeleton, Toggle } from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { OrgFeature } from "@/types/dashboard";
import {
  Bot,
  BarChart3,
  Cpu,
  KeyRound,
  FileSpreadsheet,
  Blocks,
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface FeatureDetail {
  key: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  minTier: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
}

const FEATURE_CATALOG: FeatureDetail[] = [
  {
    key: "AI_AGENT",
    name: "AI Autonomous Agents",
    description: "Deploy interactive AI agents in virtual rooms to take notes, answer queries, and assist team meetings.",
    icon: Bot,
    minTier: "STARTER",
  },
  {
    key: "ADVANCED_ANALYTICS",
    name: "Real-Time Telemetry & Heatmaps",
    description: "Granular office density heatmaps, room dwell times, and team collaboration pattern analytics.",
    icon: BarChart3,
    minTier: "PROFESSIONAL",
  },
  {
    key: "DATA_AUTOMATION",
    name: "Data Automation Pipelines",
    description: "Automatic scheduled synchronizations between virtual rooms, external CRMs, and ticketing systems.",
    icon: Cpu,
    minTier: "PROFESSIONAL",
  },
  {
    key: "API_ACCESS",
    name: "Platform REST API Keys",
    description: "Programmatic access to organization endpoints, member provisioning, and webhooks via signed API keys.",
    icon: KeyRound,
    minTier: "PROFESSIONAL",
  },
  {
    key: "CUSTOM_REPORTS",
    name: "Executive Compliance Reports",
    description: "Automated exportable SOC2 and GDPR compliance audit trails formatted in PDF and CSV.",
    icon: FileSpreadsheet,
    minTier: "PROFESSIONAL",
  },
  {
    key: "INTEGRATIONS",
    name: "Third-Party SaaS Integrations",
    description: "Two-way live bridge with Slack, Microsoft Teams, Google Calendar, and Discord channels.",
    icon: Blocks,
    minTier: "ENTERPRISE",
  },
  {
    key: "ADVANCED_SECURITY",
    name: "Enterprise Security & SSO",
    description: "Organization-wide mandatory 2FA enforcement, IP address whitelisting, and Okta/SAML SSO.",
    icon: ShieldCheck,
    minTier: "ENTERPRISE",
  },
];

export default function FeaturesManagementPage() {
  const { organization, isOwner, isAdmin } = useAuth();
  const [features, setFeatures] = useState<OrgFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get<OrgFeature[]>("/organizations/me/features")
      .then((data) => {
        if (!active) return;
        setFeatures(data || []);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Failed to load features.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const fetchFeatures = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const canManage = isOwner || isAdmin;

  const handleToggle = async (featureKey: string, currentEnabled: boolean) => {
    if (!canManage) return;
    setTogglingKey(featureKey);
    setError(null);

    try {
      await api.patch(`/organizations/me/features/${featureKey}`, {
        isEnabled: !currentEnabled,
      });
      const data = await api.get<OrgFeature[]>("/organizations/me/features");
      setFeatures(data || []);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Failed to update feature state. Ensure your plan permits this entitlement.";
      setError(msg);
    } finally {
      setTogglingKey(null);
    }
  };

  const planTier = organization?.planTier || "FREE";

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[var(--gy-text)]">Feature management</h2>
            <Chip variant="soft" size="sm">
              Plan: {planTier}
            </Chip>
          </div>
          <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
            Configure available modules. Features must be both entitled by your subscription and enabled by an
            administrator.
          </p>
        </div>

        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="size-4" />} onClick={fetchFeatures}>
          Refresh entitlements
        </Button>
      </div>

      {error && (
        <Banner
          variant="danger"
          title="Something went wrong"
          description={error}
          button={
            <Button variant="danger-soft" size="sm" onClick={fetchFeatures}>
              Retry
            </Button>
          }
        />
      )}

      {/* Features grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {FEATURE_CATALOG.map((catItem) => {
          const Icon = catItem.icon;
          const orgFeature = features.find((f) => f.featureKey === catItem.key);
          const isEntitled = Boolean(orgFeature?.isEntitled);
          const isEnabled = Boolean(orgFeature?.isEnabled);
          const isToggling = togglingKey === catItem.key;

          const cardClass = isEnabled
            ? "border border-[var(--gy-primary)]/40"
            : isEntitled
              ? "border border-[var(--gy-border)]"
              : "border border-[var(--gy-border)] opacity-80";

          const iconClass = isEnabled
            ? "border-[var(--gy-primary)]/30 bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]"
            : isEntitled
              ? "border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] text-[var(--gy-text-secondary)]"
              : "border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] text-[var(--gy-text-subtle)]";

          return (
            <Card key={catItem.key} padding="lg" radius="xl" className={`relative ${cardClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`grid size-11 shrink-0 place-items-center rounded-2xl border ${iconClass}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--gy-text)]">{catItem.name}</h3>
                      {isEnabled && (
                        <Chip variant="success" size="sm">
                          Active
                        </Chip>
                      )}
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-[var(--gy-text-secondary)]">
                      {catItem.description}
                    </p>
                  </div>
                </div>

                {/* Toggle or upgrade required */}
                <div className="flex shrink-0 flex-col items-end">
                  {loading ? (
                    <Skeleton variant="rectangular" width="2.75rem" height="1.5rem" className="rounded-full" />
                  ) : isEntitled ? (
                    <Toggle
                      aria-label={`${isEnabled ? "Disable" : "Enable"} ${catItem.name}`}
                      checked={isEnabled}
                      isDisabled={isToggling || !canManage}
                      onChange={() => handleToggle(catItem.key, isEnabled)}
                    />
                  ) : (
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-[var(--gy-text-subtle)]">
                        <Lock className="size-3" />
                        <span>Requires {catItem.minTier}</span>
                      </div>
                      <Link
                        to="/subscription"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--gy-primary)] hover:underline"
                      >
                        <span>Upgrade</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-5 flex items-center justify-between border-t border-[var(--gy-divider)] pt-4 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--gy-text-secondary)]">
                  <span className="font-medium">Plan entitlement:</span>
                  <span
                    className={`font-semibold ${
                      isEntitled ? "text-[var(--gy-success)]" : "text-[var(--gy-text-subtle)]"
                    }`}
                  >
                    {isEntitled ? "Allowed" : "Not included"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[var(--gy-text-secondary)]">
                  <span className="font-medium">Workspace state:</span>
                  <span
                    className={`font-semibold ${
                      isEnabled ? "text-[var(--gy-primary)]" : "text-[var(--gy-text-subtle)]"
                    }`}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
