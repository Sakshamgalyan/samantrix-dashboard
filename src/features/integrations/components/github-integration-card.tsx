"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { z } from "zod";
import {
  Card,
  Button,
  Chip,
  useToast,
  Banner,
  Input,
  Typography,
  Modal,
} from "@galyan/ui";
import {
  GitBranch,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  KeyRound,
  AlertTriangle,
  HelpCircle,
  FolderGit2,
} from "lucide-react";
import {
  useGetGitHubOrgIntegrationQuery,
  useUpdateGitHubOrgIntegrationMutation,
} from "@/features/integrations/context/api";
import { queryErrorMessage } from "@/store";
import { GITHUB_WEBHOOK_URL } from "@/features/integrations/common/constants";
import { useIntegrations } from "@/features/integrations/context";
import {
  setDeleteRepoTargetAction,
  setDeletingRepoAction,
  setShowSecretAction,
  setCopiedWebhookAction,
  setCopiedSecretAction,
  setConfirmRotateOpenAction,
  setRotatingSecretAction,
} from "@/features/integrations/context/action";
import { DeleteModal } from "@/components/common/delete-modal";

const addRepoSchema = z.object({
  repoUrl: z
    .string()
    .trim()
    .min(1, "Repository URL is required")
    .regex(
      /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$/,
      "Please enter a valid GitHub repository URL (e.g. https://github.com/org/repo)",
    ),
});

type AddRepoFormValues = z.infer<typeof addRepoSchema>;

interface GitHubIntegrationCardProps {
  canEdit: boolean;
}

export function GitHubIntegrationCard({ canEdit }: GitHubIntegrationCardProps) {
  const { toast } = useToast();
  const { state, dispatch } = useIntegrations();
  const {
    deleteRepoTarget,
    deletingRepo,
    showSecret,
    copiedWebhook,
    copiedSecret,
    confirmRotateOpen,
    rotatingSecret,
  } = state;

  const {
    data: integration,
    isLoading,
    error: queryError,
  } = useGetGitHubOrgIntegrationQuery();
  const [updateIntegration, { isLoading: isUpdating }] =
    useUpdateGitHubOrgIntegrationMutation();

  const allowedRepos = integration?.allowedRepoUrls || [];
  const webhookSecret = integration?.webhookSecret || "";
  const webhookUrl = GITHUB_WEBHOOK_URL;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<AddRepoFormValues>({
    resolver: zodResolver(addRepoSchema),
    defaultValues: { repoUrl: "" },
  });

  const handleAddRepo = async (values: AddRepoFormValues) => {
    if (!canEdit) return;

    let cleanUrl = values.repoUrl
      .trim()
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (
      allowedRepos.map((u) => u.toLowerCase()).includes(cleanUrl.toLowerCase())
    ) {
      toast.warning("This repository is already authorized.");
      return;
    }

    try {
      await updateIntegration({
        allowedRepoUrls: [...allowedRepos, cleanUrl],
      }).unwrap();
      toast.success("GitHub repository authorized successfully.");
      reset();
    } catch (err) {
      toast.error(queryErrorMessage(err, "Failed to add repository."));
    }
  };

  const handleConfirmRemoveRepo = async () => {
    if (!canEdit || !deleteRepoTarget) return;

    dispatch(setDeletingRepoAction(true));
    try {
      await updateIntegration({
        allowedRepoUrls: allowedRepos.filter((u) => u !== deleteRepoTarget),
      }).unwrap();
      toast.success("Repository removed successfully.");
      dispatch(setDeleteRepoTargetAction(null));
    } catch (err) {
      toast.error(queryErrorMessage(err, "Failed to remove repository."));
    } finally {
      dispatch(setDeletingRepoAction(false));
    }
  };

  const handleRotateSecret = async () => {
    if (!canEdit) return;

    dispatch(setRotatingSecretAction(true));
    try {
      await updateIntegration({
        allowedRepoUrls: allowedRepos,
        rotateSecret: true,
      }).unwrap();
      toast.success("HMAC Webhook secret regenerated.");
      dispatch(setConfirmRotateOpenAction(false));
    } catch (err) {
      toast.error(queryErrorMessage(err, "Failed to regenerate secret."));
    } finally {
      dispatch(setRotatingSecretAction(false));
    }
  };

  const handleCopy = (text: string, type: "webhook" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "webhook") {
      dispatch(setCopiedWebhookAction(true));
      setTimeout(() => dispatch(setCopiedWebhookAction(false)), 2000);
    } else {
      dispatch(setCopiedSecretAction(true));
      setTimeout(() => dispatch(setCopiedSecretAction(false)), 2000);
    }
    toast.success("Copied to clipboard.");
  };

  return (
    <Card variant="glass" radius="lg" padding="md" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--gy-primary-soft,#6366f11a)] text-[var(--gy-primary,#6366f1)]">
            <GitBranch className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h5" weight="semibold" textColor="var(--gy-text)">
                GitHub Multi-Repo Synchronization
              </Typography>
              <Chip size="xs" variant="success" icon={<Sparkles className="size-3" />}>
                ENTERPRISE
              </Chip>
            </div>
            <Typography variant="small" textColor="var(--gy-text-secondary)">
              Authorize GitHub repositories for your organization. Digital workplace members can view branches,
              synchronize code changes, and receive real-time commit push notifications.
            </Typography>
          </div>
        </div>
      </div>

      {queryError && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Failed to load GitHub integration settings"
          description={queryErrorMessage(
            queryError,
            "Check enterprise license or network connectivity.",
          )}
        />
      )}

      {/* Add Repository Form */}
      {canEdit ? (
        <form
          onSubmit={handleSubmit(handleAddRepo)}
          className="flex flex-col gap-2.5 sm:flex-row sm:items-start"
          noValidate
        >
          <div className="flex-1">
            <Input
              type="url"
              size="sm"
              placeholder="https://github.com/organization/repository"
              leftIcon={<GitBranch className="size-4 text-[var(--gy-text-secondary)]" />}
              hasError={Boolean(formErrors.repoUrl)}
              error={formErrors.repoUrl?.message}
              disabled={isUpdating}
              fullWidth
              {...register("repoUrl")}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            disabled={isUpdating}
            isLoading={isUpdating}
            loadingText="Authorizing..."
          >
            Authorize Repository
          </Button>
        </form>
      ) : (
        <div className="rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-hover)] p-3 flex items-center gap-2.5">
          <Shield className="size-4 text-[var(--gy-primary)] shrink-0" />
          <Typography variant="small" textColor="var(--gy-text-secondary)" as="span">
            Repository authorizations can only be managed by Superadmins and Organization Owners/Admins.
          </Typography>
        </div>
      )}

      {/* Connected Repositories Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="size-4 text-[var(--gy-primary)]" />
            <Typography variant="small" weight="semibold" textColor="var(--gy-text)">
              Authorized Repositories ({allowedRepos.length})
            </Typography>
          </div>
          {allowedRepos.length > 0 && (
            <Chip size="xs" variant="neutral">
              Auto-Sync Active
            </Chip>
          )}
        </div>

        {allowedRepos.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-dashed border-[var(--gy-border)] p-6 text-center">
            <Typography variant="small" textColor="var(--gy-text-secondary)" align="center">
              No repositories authorized yet. Enter a GitHub repository URL above to enable real-time workplace code integration.
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {allowedRepos.map((url) => {
              const cleanPath = url
                .replace("https://github.com/", "")
                .replace("http://github.com/", "");
              const parts = cleanPath.split("/");
              const owner = parts[0] || "";
              const repo = parts[1] || cleanPath;

              return (
                <div
                  key={url}
                  className="flex items-center justify-between rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface)] p-3 transition-colors hover:border-[var(--gy-primary-soft,#6366f140)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--gy-surface-hover)] text-[var(--gy-primary)]">
                      <GitBranch className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <Typography
                          variant="small"
                          as="span"
                          textColor="var(--gy-text-secondary)"
                          className="truncate text-[11px]"
                        >
                          {owner} /
                        </Typography>
                        <Typography
                          variant="small"
                          as="span"
                          weight="semibold"
                          textColor="var(--gy-text)"
                          className="truncate text-xs"
                        >
                          {repo}
                        </Typography>
                      </div>
                      <Typography
                        variant="small"
                        as="span"
                        textColor="var(--gy-text-subtle)"
                        className="text-[10px] block truncate"
                      >
                        {url}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      as="a"
                      variant="ghost"
                      size="xs"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="size-7 p-0 text-[var(--gy-text-secondary)] hover:text-[var(--gy-text)]"
                      title="Open on GitHub"
                      aria-label="Open on GitHub"
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>

                    {canEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => dispatch(setDeleteRepoTargetAction(url))}
                        disabled={isUpdating || deletingRepo}
                        className="size-7 p-0 text-[var(--gy-danger,#ef4444)] hover:bg-[var(--gy-danger-soft,#fee2e2)] transition-colors"
                        title="Remove repository"
                        aria-label={`Remove repository ${cleanPath}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Webhook Configuration */}
      <div className="border-t border-[var(--gy-border)] pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-[var(--gy-primary)]" />
            <Typography variant="small" weight="semibold" textColor="var(--gy-text)">
              GitHub Webhook Setup (HMAC-SHA256)
            </Typography>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => dispatch(setConfirmRotateOpenAction(true))}
              disabled={isUpdating || rotatingSecret}
            >
              Rotate Secret
            </Button>
          )}
        </div>

        <Typography variant="small" textColor="var(--gy-text-secondary)">
          Configure a webhook in each authorized GitHub repository (
          <Typography
            variant="small"
            as="span"
            textColor="var(--gy-text)"
            className="font-mono font-medium px-1 rounded bg-[var(--gy-surface-hover)]"
          >
            Settings → Webhooks → Add webhook
          </Typography>
          ) with Content type <code className="font-mono text-xs text-[var(--gy-primary)]">application/json</code>.
        </Typography>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Payload URL */}
          <div className="rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface)] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Typography variant="small" as="span" textColor="var(--gy-text-secondary)" className="text-[11px] font-medium uppercase tracking-wider">
                Payload URL
              </Typography>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => handleCopy(webhookUrl, "webhook")}
                className="flex items-center gap-1 text-[var(--gy-primary)] hover:underline p-0 h-auto"
                aria-label={copiedWebhook ? "Webhook URL copied" : "Copy Webhook URL"}
              >
                {copiedWebhook ? (
                  <Check className="size-3 text-emerald-400" />
                ) : (
                  <Copy className="size-3" />
                )}
                <Typography variant="small" as="span" textColor="var(--gy-primary)">
                  {copiedWebhook ? "Copied" : "Copy"}
                </Typography>
              </Button>
            </div>
            <Typography variant="small" textColor="var(--gy-text)" className="font-mono text-xs truncate select-all block bg-[var(--gy-surface-hover)] p-2 rounded-lg">
              {webhookUrl}
            </Typography>
          </div>

          {/* Webhook Secret */}
          <div className="rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface)] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Typography variant="small" as="span" textColor="var(--gy-text-secondary)" className="text-[11px] font-medium uppercase tracking-wider">
                  Secret (HMAC-SHA256)
                </Typography>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => dispatch(setShowSecretAction(!showSecret))}
                  className="p-0.5 text-[var(--gy-text-secondary)] hover:text-[var(--gy-text)] h-auto"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => handleCopy(webhookSecret, "secret")}
                className="flex items-center gap-1 text-[var(--gy-primary)] hover:underline p-0 h-auto"
                aria-label={copiedSecret ? "Webhook secret copied" : "Copy Webhook secret"}
              >
                {copiedSecret ? (
                  <Check className="size-3 text-emerald-400" />
                ) : (
                  <Copy className="size-3" />
                )}
                <Typography variant="small" as="span" textColor="var(--gy-primary)">
                  {copiedSecret ? "Copied" : "Copy"}
                </Typography>
              </Button>
            </div>
            <Typography variant="small" textColor="var(--gy-text)" className="font-mono text-xs truncate select-all block bg-[var(--gy-surface-hover)] p-2 rounded-lg">
              {showSecret ? webhookSecret : "••••••••••••••••••••••••••••••••"}
            </Typography>
          </div>
        </div>
      </div>

      {/* Delete Repository Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteRepoTarget)}
        onClose={() => dispatch(setDeleteRepoTargetAction(null))}
        onConfirm={handleConfirmRemoveRepo}
        title="Remove Authorized Repository"
        itemName={deleteRepoTarget?.replace(/^https?:\/\/github\.com\//, "") || undefined}
        itemType="GitHub repository"
        confirmText="Remove Repository"
        isDeleting={deletingRepo}
        loadingText="Removing..."
        warningMessage="De-authorizing this repository will terminate live branch tracking, webhook notifications, and room collaboration bindings for your workspace."
      />

      {/* Rotate Secret Confirmation Modal */}
      <Modal
        isOpen={confirmRotateOpen}
        onClose={() => dispatch(setConfirmRotateOpenAction(false))}
        size="sm"
        icon={
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--gy-warning-soft,#fef3c7)] text-[var(--gy-warning,#f59e0b)]">
            <AlertTriangle className="size-4 shrink-0" />
          </div>
        }
        title="Regenerate Webhook Secret?"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(setConfirmRotateOpenAction(false))}
              disabled={rotatingSecret}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={rotatingSecret}
              loadingText="Regenerating..."
              onClick={handleRotateSecret}
            >
              Yes, Rotate Secret
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1">
          <Typography variant="small" textColor="var(--gy-text-secondary)">
            Rotating this secret will immediately invalidate the active HMAC key. Any existing GitHub webhooks will fail verification until updated in repository settings.
          </Typography>
        </div>
      </Modal>
    </Card>
  );
}
