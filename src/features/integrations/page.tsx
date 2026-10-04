"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { OrgApiKey } from "@/types/dashboard";
import {
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Table,
  Typography,
  useToast,
  type Column,
} from "@galyan/ui";
import { KeyRound, Plus, Trash2, Copy, Check, Blocks, RefreshCw } from "lucide-react";

interface CreateApiKeyResponse {
  key?: string;
}

const CREATE_FORM_ID = "integrations-create-key-form";

const ECOSYSTEM_TOOLS = [
  {
    name: "Slack Workplace",
    description: "Push virtual room presence alerts and meeting reminders directly to Slack channels.",
    status: "Available in Enterprise",
  },
  {
    name: "Google Calendar",
    description: "Synchronize scheduled calendar events into automatically reserved 3D meeting spaces.",
    status: "Available in Enterprise",
  },
  {
    name: "Discord Bot Bridge",
    description: "Sync voice states and proximity audio between your Discord server and Samantrix.",
    status: "Available in Enterprise",
  },
];

export default function IntegrationsPage() {
  const { isOwner, isAdmin } = useAuth();
  const { toast } = useToast();
  const canEdit = isOwner || isAdmin;
  const [apiKeys, setApiKeys] = useState<OrgApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Key Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<OrgApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = useCallback(
    () =>
      api
        .get<OrgApiKey[]>("/organizations/me/api-keys")
        .then((data) => {
          setError(null);
          setApiKeys(data || []);
        })
        .catch((err: unknown) => {
          setError(err instanceof ApiError ? err.message : "Failed to load API keys.");
        })
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await api.post<CreateApiKeyResponse>("/organizations/me/api-keys", {
        name: keyName.trim(),
        scopes: ["read", "write"],
      });

      if (res && res.key) {
        setNewKeySecret(res.key);
        await fetchKeys();
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to generate API key.";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await api.delete(`/organizations/me/api-keys/${revokeTarget.id}`);
      await fetchKeys();
      toast.success(`API key "${revokeTarget.name}" revoked.`);
      setRevokeTarget(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to revoke key.";
      setError(msg);
      setRevokeTarget(null);
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const openCreateModal = () => {
    setNewKeySecret(null);
    setKeyName("");
    setIsCreateOpen(true);
  };

  const columns = useMemo<Column<OrgApiKey>[]>(() => {
    const base: Column<OrgApiKey>[] = [
      {
        key: "name",
        header: "Key label",
        accessor: (k) => <span className="font-semibold text-[var(--gy-text)]">{k.name}</span>,
      },
      {
        key: "prefix",
        header: "Key prefix",
        accessor: (k) => (
          <span className="font-mono text-xs text-[var(--gy-primary)]">{k.keyPrefix}••••••••</span>
        ),
      },
      {
        key: "created",
        header: "Created",
        accessor: (k) => (
          <span className="text-[var(--gy-text-secondary)]">{new Date(k.createdAt).toLocaleDateString()}</span>
        ),
      },
      {
        key: "lastUsed",
        header: "Last used",
        accessor: (k) =>
          k.lastUsedAt ? (
            <span className="text-[var(--gy-text-secondary)]">{new Date(k.lastUsedAt).toLocaleDateString()}</span>
          ) : (
            <span className="text-[var(--gy-text-subtle)]">Never used</span>
          ),
      },
    ];
    if (canEdit) {
      base.push({
        key: "actions",
        header: "Actions",
        align: "right",
        headerAlign: "right",
        accessor: (k) => (
          <Button
            variant="danger-soft"
            size="sm"
            leftIcon={<Trash2 className="size-3.5" />}
            aria-label={`Revoke ${k.name}`}
            title="Revoke key"
            onClick={() => setRevokeTarget(k)}
          />
        ),
      });
    }
    return base;
  }, [canEdit]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="p" className="text-sm text-[var(--gy-text-secondary)]">
          Generate REST API access tokens and connect your virtual workplace to external SaaS tools.
        </Typography>
        {canEdit && (
          <Button variant="primary" leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
            Generate new API key
          </Button>
        )}
      </div>

      {error && (
        <Banner
          variant="danger"
          description={error}
          button={
            <Button variant="danger-soft" size="sm" onClick={() => void fetchKeys()}>
              Retry
            </Button>
          }
        />
      )}

      {/* API Keys Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-[var(--gy-primary)]" />
            <Typography variant="h3" weight="bold" className="text-base text-[var(--gy-text)]">
              Active API keys
            </Typography>
            <Chip size="sm" variant="neutral">
              {apiKeys.length}
            </Chip>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={() => void fetchKeys()}
          >
            Refresh
          </Button>
        </div>

        <Card variant="default" padding="none" radius="xl" className="overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height="2.5rem" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <EmptyState
              size="md"
              icon={<KeyRound className="size-8" />}
              title="No API keys created"
              description="Generate an API key to securely connect external scripts, webhooks or automation workflows to your organization."
              action={
                canEdit ? (
                  <Button variant="primary" size="sm" leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
                    Generate API key
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table<OrgApiKey>
              columns={columns}
              data={apiKeys}
              rowKey={(k) => k.id}
              hoverable
              noBorder
              emptyStateLabel="No API keys created"
            />
          )}
        </Card>
      </section>

      {/* SaaS Integrations Catalog */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Blocks className="size-4 text-[var(--gy-primary)]" />
          <Typography variant="h3" weight="bold" className="text-base text-[var(--gy-text)]">
            Connected ecosystem tools
          </Typography>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ECOSYSTEM_TOOLS.map((tool) => (
            <Card key={tool.name} variant="default" padding="md" radius="lg" hoverEffect="border">
              <div className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[var(--gy-text)]">{tool.name}</h4>
                  <Chip size="sm" variant="neutral">
                    {tool.status}
                  </Chip>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-[var(--gy-text-secondary)]">{tool.description}</p>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    toast.info("Integration connectors can be configured in your Enterprise subscription tier.")
                  }
                >
                  Configure integration
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Create Key Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        size="sm"
        icon={<KeyRound className="size-4" />}
        title="Generate API key"
        footer={
          !newKeySecret ? (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form={CREATE_FORM_ID}
                variant="primary"
                disabled={creating || !keyName.trim()}
                isLoading={creating}
                loadingText="Generating..."
              >
                Generate key
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
                Done
              </Button>
            </div>
          )
        }
      >
        {!newKeySecret ? (
          <form id={CREATE_FORM_ID} onSubmit={handleCreateKey} className="space-y-4">
            {error && <Banner variant="danger" size="sm" description={error} />}
            <Input
              type="text"
              label="Key description / name"
              fullWidth
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. CI/CD Deployment Worker"
              required
              autoFocus
            />
          </form>
        ) : (
          <div className="space-y-4">
            <Banner
              variant="warning"
              description="Save this key now. For security purposes, this secret key will never be displayed again."
            />
            <Input
              type="text"
              label="API secret key"
              readOnly
              fullWidth
              className="font-mono"
              value={newKeySecret}
              rightIcon={
                copiedKey ? <Check className="size-4 text-[var(--gy-success)]" /> : <Copy className="size-4" />
              }
              onRightIconClick={() => copyToClipboard(newKeySecret)}
              helperText={copiedKey ? "Copied to clipboard" : "Click the icon to copy"}
            />
          </div>
        )}
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        size="sm"
        icon={<Trash2 className="size-4" />}
        title="Revoke API key?"
        subtitle={revokeTarget ? `"${revokeTarget.name}"` : undefined}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRevokeTarget(null)} disabled={revoking}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={revoking}
              loadingText="Revoking..."
              onClick={() => void handleRevokeKey()}
            >
              Revoke key
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--gy-text-secondary)]">
          Any applications using this key will be disconnected. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
