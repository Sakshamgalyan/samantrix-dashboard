"use client";

import React, { useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { pageParams } from "@/features/common/pagination";
import {
  useCreateOrgApiKeyMutation,
  useGetOrgApiKeysQuery,
  useRevokeOrgApiKeyMutation,
  useGetGitHubOrgIntegrationQuery,
} from "@/features/integrations/context/api";
import {
  AnimatedNumber,
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  Typography,
  useToast,
} from "@galyan/ui";
import {
  KeyRound,
  Plus,
  GitBranch,
  Webhook,
  Blocks,
  Sparkles,
  ShieldCheck,
  RotateCw,
} from "lucide-react";
import { useIntegrations } from "@/features/integrations/context";
import {
  setIntegrationsPageAction,
  openCreateModalAction,
  closeCreateModalAction,
  setKeyNameAction,
  setCreatingAction,
  setNewKeySecretAction,
  setCopiedKeyAction,
  setRevokeTargetAction,
  setRevokingAction,
  setActionErrorAction,
  setActiveTabAction,
} from "@/features/integrations/context/action";
import dynamic from "next/dynamic";
import { ApiKeysTable } from "@/features/integrations/components/api-keys-table";
import { EcosystemToolsSection } from "@/features/integrations/components/ecosystem-tools-section";
import { GitHubIntegrationCard } from "@/features/integrations/components/github-integration-card";
import type { IntegrationsSectionTab } from "@/features/integrations/types/state";

const CreateKeyModal = dynamic(
  () =>
    import("@/features/integrations/components/create-key-modal").then(
      (m) => m.CreateKeyModal,
    ),
  { ssr: false },
);

const RevokeKeyModal = dynamic(
  () =>
    import("@/features/integrations/components/revoke-key-modal").then(
      (m) => m.RevokeKeyModal,
    ),
  { ssr: false },
);

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export const IntegrationsContent = () => {
  const { isOwner, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const canEdit = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";

  const { state, dispatch } = useIntegrations();
  const {
    page,
    isCreateOpen,
    keyName,
    creating,
    newKeySecret,
    copiedKey,
    revokeTarget,
    revoking,
    actionError,
    activeTab,
  } = state;

  const keysQuery = useGetOrgApiKeysQuery(pageParams(page));
  const { refetch: refetchKeys, isLoading: isLoadingKeys, isFetching: isFetchingKeys } = keysQuery;
  const [createApiKey] = useCreateOrgApiKeyMutation();
  const [revokeApiKey] = useRevokeOrgApiKeyMutation();

  const { data: githubData, refetch: refetchGithub, isFetching: isFetchingGithub } = useGetGitHubOrgIntegrationQuery();

  const apiKeys = useMemo(() => keysQuery.data?.data ?? [], [keysQuery.data]);
  const keysMeta = keysQuery.data?.meta;
  const githubRepoCount = githubData?.allowedRepoUrls?.length ?? 0;
  const isRefreshing = isFetchingKeys || isFetchingGithub;

  const pageError =
    !isCreateOpen && !revokeTarget && actionError
      ? actionError
      : keysQuery.error
        ? queryErrorMessage(keysQuery.error, "Failed to load API keys.")
        : null;

  const handleOpenCreateModal = useCallback(() => {
    dispatch(openCreateModalAction());
  }, [dispatch]);

  const handleCloseCreateModal = useCallback(() => {
    dispatch(closeCreateModalAction());
  }, [dispatch]);

  const handleKeyNameChange = useCallback(
    (name: string) => {
      dispatch(setKeyNameAction(name));
    },
    [dispatch],
  );

  const handleDismissActionError = useCallback(() => {
    dispatch(setActionErrorAction(null));
  }, [dispatch]);

  const handleCloseRevokeModal = useCallback(() => {
    dispatch(setRevokeTargetAction(null));
  }, [dispatch]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!keyName.trim() || creating) return;
      dispatch(setActionErrorAction(null));
      dispatch(setCreatingAction(true));
      try {
        const res = await createApiKey({ name: keyName.trim(), permissions: ["*"] }).unwrap();
        const secret = res?.secretKey ?? null;
        dispatch(setNewKeySecretAction(secret));
        toast.success("API key generated successfully.");
      } catch (err) {
        dispatch(setActionErrorAction(queryErrorMessage(err, "Failed to create API key.")));
      } finally {
        dispatch(setCreatingAction(false));
      }
    },
    [keyName, creating, createApiKey, dispatch, toast],
  );

  const handleCopyKey = useCallback(() => {
    if (!newKeySecret) return;
    navigator.clipboard.writeText(newKeySecret);
    dispatch(setCopiedKeyAction(true));
    toast.success("API key copied to clipboard.");
  }, [newKeySecret, dispatch, toast]);

  const handleConfirmRevoke = useCallback(async () => {
    if (!revokeTarget) return;
    dispatch(setActionErrorAction(null));
    dispatch(setRevokingAction(true));
    try {
      await revokeApiKey(revokeTarget.id).unwrap();
      toast.success(`Key "${revokeTarget.name}" revoked.`);
      dispatch(setRevokeTargetAction(null));
    } catch (err) {
      dispatch(setActionErrorAction(queryErrorMessage(err, "Failed to revoke API key.")));
    } finally {
      dispatch(setRevokingAction(false));
    }
  }, [revokeTarget, revokeApiKey, dispatch, toast]);

  const tabs: { id: IntegrationsSectionTab; label: string; count?: number }[] = [
    { id: "all", label: "All Integrations" },
    { id: "keys", label: "API Keys", count: apiKeys.length },
    { id: "github", label: "GitHub Multi-Repo", count: githubRepoCount },
    { id: "ecosystem", label: "Ecosystem Bridges", count: 4 },
  ];

  return (
    <div className="space-y-5">
      {/* Elevated Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm" icon={<KeyRound className="size-3" />}>
                Integrations &amp; API
              </Chip>
              <Chip variant="neutral" size="sm">
                {apiKeys.length} API keys
              </Chip>
              <Chip variant="primary" size="sm">
                {githubRepoCount} synced repos
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Developer Ecosystem &amp; Integrations
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Generate secure API keys, authenticate CI/CD automation runners, synchronize GitHub multi-repo workspaces, and connect productivity bridges.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              disabled={isRefreshing}
              onClick={() => {
                void refetchKeys();
                void refetchGithub();
              }}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={handleOpenCreateModal}
                className="flex-1 sm:flex-initial"
              >
                Generate Key
              </Button>
            )}
          </div>
        </div>
      </Card>

      {pageError && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Integrations error"
          description={pageError}
          button={
            <Button variant="danger-soft" size="xs" onClick={() => void refetchKeys()}>
              Retry
            </Button>
          }
        />
      )}

      {/* KPI Overview Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* API Keys KPI */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Active API Keys
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]`}>
              <KeyRound className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
              <AnimatedNumber value={apiKeys.length} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              active credentials
            </Typography>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--gy-text-subtle)]">
            <ShieldCheck className="size-3.5 text-[var(--gy-success)]" />
            <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs truncate">
              SHA-256 hashed &amp; scoped
            </Typography>
          </div>
        </Card>

        {/* GitHub Repos KPI */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              GitHub Repos
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-info,#3b82f6)]/10 text-[var(--gy-info,#3b82f6)]`}>
              <GitBranch className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-info,#3b82f6)]">
              <AnimatedNumber value={githubRepoCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              repositories synced
            </Typography>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--gy-text-subtle)]">
            <Sparkles className="size-3.5 text-[var(--gy-warning)]" />
            <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs truncate">
              Multi-repo branch tracking
            </Typography>
          </div>
        </Card>

        {/* Webhooks KPI */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Webhook Security
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-success)]/10 text-[var(--gy-success)]`}>
              <Webhook className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base sm:text-lg">
              HMAC-SHA256
            </Typography>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--gy-success)] font-medium">
            <Typography variant="span" textColor="var(--gy-success)" className="text-xs truncate">
              Receiver active on port 5000
            </Typography>
          </div>
        </Card>

        {/* Ecosystem Bridges KPI */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Ecosystem Bridges
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]`}>
              <Blocks className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-warning)]">
              <AnimatedNumber value={4} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              bridges available
            </Typography>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--gy-text-subtle)]">
            <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs truncate">
              Slack, Calendar, Discord, Jira
            </Typography>
          </div>
        </Card>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => dispatch(setActiveTabAction(tab.id))}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[var(--gy-primary)] text-[var(--gy-primary-contrast,#ffffff)] shadow-xs"
                  : "bg-[var(--gy-surface-sunken)] border border-[var(--gy-border)] text-[var(--gy-text-secondary)] hover:text-[var(--gy-text)] hover:border-[var(--gy-border-hover)]"
              }`}
            >
              <Typography variant="span" weight="medium" className="text-xs">
                {tab.label}
              </Typography>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--gy-border)] text-[var(--gy-text-subtle)]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section 1: API Keys Management */}
      {(activeTab === "all" || activeTab === "keys") && (
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs space-y-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--gy-border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
                <KeyRound className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base">
                    API Keys &amp; Developer Access Tokens
                  </Typography>
                  <Chip size="xs" variant="neutral">
                    {apiKeys.length} {apiKeys.length === 1 ? "Key" : "Keys"}
                  </Chip>
                </div>
                <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs">
                  Generate scoped developer credentials to authenticate backend microservices, CI/CD runners, and custom bots.
                </Typography>
              </div>
            </div>

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto"
              >
                Generate Key
              </Button>
            )}
          </div>

          {apiKeys.length === 0 && !isLoadingKeys ? (
            <EmptyState
              variant="glass"
              size="sm"
              icon={<KeyRound className="size-8" />}
              title="No API keys generated"
              description="Generate a developer token to securely connect external scripts, GitHub actions, or webhook subscribers."
              action={
                canEdit ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={handleOpenCreateModal}
                  >
                    Generate Key
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ApiKeysTable
              apiKeys={apiKeys}
              meta={keysMeta}
              loading={isLoadingKeys}
              canEdit={canEdit}
              onRevoke={(k) => dispatch(setRevokeTargetAction(k))}
              onPageChange={(p) => dispatch(setIntegrationsPageAction(p))}
            />
          )}
        </Card>
      )}

      {/* Section 2: GitHub Multi-Repo Synchronization */}
      {(activeTab === "all" || activeTab === "github") && (
        <GitHubIntegrationCard canEdit={canEdit} />
      )}

      {/* Section 3: Ecosystem Bridges */}
      {(activeTab === "all" || activeTab === "ecosystem") && (
        <EcosystemToolsSection />
      )}

      {/* Create Key Modal */}
      <CreateKeyModal
        isOpen={isCreateOpen}
        keyName={keyName}
        creating={creating}
        newKeySecret={newKeySecret}
        copiedKey={copiedKey}
        error={isCreateOpen ? actionError : null}
        onClose={handleCloseCreateModal}
        onKeyNameChange={handleKeyNameChange}
        onCreate={handleCreate}
        onCopyKey={handleCopyKey}
        onDismissError={handleDismissActionError}
      />

      {/* Revoke Confirmation Modal (powered by common DeleteModal) */}
      <RevokeKeyModal
        target={revokeTarget}
        revoking={revoking}
        onClose={handleCloseRevokeModal}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
};
