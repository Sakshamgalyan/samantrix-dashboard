"use client";

import React, { useCallback, useMemo } from "react";
import {
  AnimatedNumber,
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  ProgressBar,
  Skeleton,
  Typography,
  useToast,
} from "@galyan/ui";
import {
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Cpu,
  Layers,
  Plus,
  Radio,
  RotateCcw,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { useDebounce } from "@/hooks/use-debounce";
import { DeleteModal } from "@/components/common/delete-modal";
import { useAiAssistants } from "../context";
import {
  closeDeleteModalAction,
  openCreateModalAction,
  openDeleteModalAction,
  openEditModalAction,
  resetFiltersAction,
  setActionErrorAction,
  setArchetypeFilterAction,
  setSearchQueryAction,
  setTogglingIdAction,
} from "../context/action";
import {
  useDeleteOrgAiAssistantMutation,
  useGetOrgAiAssistantsQuery,
  useToggleOrgAiAssistantMutation,
} from "../context/api";
import { FILTER_OPTIONS, getArchetypeMeta } from "../common/constants";
import { AssistantCard } from "./assistant-card";
import { AssistantModal } from "./assistant-modal";

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export function AiAssistantsContent() {
  const { isOwner, isAdmin, user } = useAuth();
  const canEdit = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";
  const { toast } = useToast();

  const { state, dispatch } = useAiAssistants();
  const {
    searchQuery,
    archetypeFilter,
    actionError,
    deletingAssistant,
    togglingId,
  } = state;

  const debouncedSearch = useDebounce(searchQuery, 250);

  const assistantsQuery = useGetOrgAiAssistantsQuery();
  const { refetch, isLoading, isFetching } = assistantsQuery;
  const [toggleAssistant] = useToggleOrgAiAssistantMutation();
  const [deleteAssistant, { isLoading: isDeleting }] =
    useDeleteOrgAiAssistantMutation();
  const assistants = assistantsQuery.data ?? [];

  const loadError = assistantsQuery.error
    ? queryErrorMessage(assistantsQuery.error, "Failed to load AI assistants.")
    : null;
  const error = actionError ?? loadError;

  const handleToggle = useCallback(
    async (assistantId: string, nextChecked: boolean) => {
      dispatch(setActionErrorAction(null));
      dispatch(setTogglingIdAction(assistantId));
      try {
        await toggleAssistant({ assistantId, isEnabled: nextChecked }).unwrap();
        toast.success(
          nextChecked
            ? "AI Assistant activated in preview mode."
            : "AI Assistant disabled.",
        );
      } catch (err) {
        const msg = queryErrorMessage(err, "Failed to toggle assistant.");
        dispatch(setActionErrorAction(msg));
        toast.error(msg);
      } finally {
        dispatch(setTogglingIdAction(null));
      }
    },
    [toggleAssistant, dispatch, toast],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingAssistant) return;
    try {
      await deleteAssistant(deletingAssistant.id).unwrap();
      toast.success(`Assistant '${deletingAssistant.name}' removed.`);
      dispatch(closeDeleteModalAction());
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to delete assistant.");
      dispatch(setActionErrorAction(msg));
      toast.error(msg);
    }
  }, [deletingAssistant, deleteAssistant, dispatch, toast]);

  // Statistics calculation
  const totalBots = assistants.length;
  const activeBots = assistants.filter((a) => a.isEnabled).length;
  const meetingAutomations = assistants.filter(
    (a) => a.autoJoinMeetings && a.isEnabled,
  ).length;
  const distinctModelsCount = new Set(assistants.map((a) => a.model)).size;
  const activePercent = totalBots > 0 ? Math.round((activeBots / totalBots) * 100) : 0;

  // Filter assistants based on search and archetype
  const filteredAssistants = useMemo(() => {
    return assistants.filter((assistant) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesName = assistant.name.toLowerCase().includes(q);
        const matchesDesc = assistant.description.toLowerCase().includes(q);
        const matchesModel = assistant.model.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesModel) return false;
      }

      if (archetypeFilter !== "ALL") {
        if (assistant.archetype !== archetypeFilter) return false;
      }

      return true;
    });
  }, [assistants, debouncedSearch, archetypeFilter]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || archetypeFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="AI Assistant operation error"
          description={error}
          button={
            <Button variant="danger-soft" size="xs" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm">
                AI Workplace Intelligence
              </Chip>
              <Chip variant="primary" size="sm" icon={<Calendar className="size-3" />}>
                Official Launch: April 6, 2027
              </Chip>
              <Chip variant="neutral" size="sm">
                {totalBots} configured bots
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              AI Assistant Studio &amp; Autonomous Bots
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Deploy autonomous AI copilots into your virtual workplace — meeting summarizers,
              lobby concierge, standup bots, and custom LLM tools ahead of global release.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />}
              disabled={isFetching}
              onClick={() => void refetch()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => dispatch(openCreateModalAction())}
                leftIcon={<Plus className="size-3.5" />}
                className="flex-1 sm:flex-initial"
              >
                Deploy Assistant
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Official Launch Roadmap Card */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-primary)]/30 bg-gradient-to-r from-[var(--gy-primary)]/[0.04] via-[var(--gy-surface)] to-[var(--gy-primary)]/[0.02] shadow-xs"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--gy-primary)] text-[var(--gy-primary-fg)] shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Typography
                  variant="h4"
                  weight="semibold"
                  textColor="var(--gy-text)"
                  className="text-base tracking-tight"
                >
                  Global Launch Date: April 6, 2027
                </Typography>
                <Chip size="xs" variant="success" icon={<CheckCircle2 className="size-2.5" />}>
                  Synchronized with Home &amp; Backend
                </Chip>
              </div>
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs sm:text-sm leading-relaxed"
              >
                The Simantrix AI Intelligence Suite is active in Pre-Launch Preview. Assistants configured here integrate with permission-checked backend tools, meeting intelligence, and virtual room avatars.
              </Typography>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-[var(--gy-border)] lg:border-t-0">
            <Chip size="xs" variant="neutral" icon={<ShieldCheck className="size-3 text-emerald-500" />}>
              100% RBAC Tool Execution
            </Chip>
            <Chip size="xs" variant="neutral" icon={<Layers className="size-3 text-indigo-500" />}>
              Tenant Isolated Data
            </Chip>
          </div>
        </div>
      </Card>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Active Assistants */}
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
              Active in Preview
            </Typography>
            <div className={`${ICON_TILE} bg-emerald-500/10 text-emerald-500`}>
              <BrainCircuit className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              <AnimatedNumber value={activeBots} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              / {totalBots} bots
            </Typography>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={activePercent}
              variant="success"
              size="sm"
              showLabel={false}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            {activePercent}% online in workplace
          </Typography>
        </Card>

        {/* Metric 2: Meeting Automations */}
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
              Meeting Scribes
            </Typography>
            <div className={`${ICON_TILE} bg-indigo-500/10 text-indigo-500`}>
              <Radio className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-indigo-600">
              <AnimatedNumber value={meetingAutomations} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              automated
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  totalBots > 0 ? (meetingAutomations / totalBots) * 100 : 0,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Auto-joining video huddles
          </Typography>
        </Card>

        {/* Metric 3: LLM Model Engines */}
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
              Model Engines
            </Typography>
            <div className={`${ICON_TILE} bg-purple-500/10 text-purple-500`}>
              <Cpu className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600">
              <AnimatedNumber value={distinctModelsCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              engines
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, distinctModelsCount * 25)}%` }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Claude, GPT-4o &amp; Gemini
          </Typography>
        </Card>

        {/* Metric 4: Total Bot Archetypes */}
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
              Studio Fleet
            </Typography>
            <div className={`${ICON_TILE} bg-amber-500/10 text-amber-500`}>
              <Bot className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600">
              <AnimatedNumber value={totalBots} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              assistants
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Configured workspace bots
          </Typography>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full sm:w-72 lg:w-80">
            <Input
              size="sm"
              leftIcon={<Search className="size-3.5" />}
              placeholder="Search bots by name, model, or instructions..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQueryAction(e.target.value))}
              clearable={Boolean(searchQuery)}
              onClear={() => dispatch(setSearchQueryAction(""))}
              fullWidth
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Typography
              variant="span"
              textColor="var(--gy-text-subtle)"
              className="mr-1 text-xs shrink-0 hidden sm:inline"
            >
              Archetype:
            </Typography>
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = archetypeFilter === opt.value;
              const meta =
                opt.value !== "ALL" ? getArchetypeMeta(opt.value) : null;
              const IconComp = meta ? meta.icon : Sparkles;

              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  clickable
                  selected={isSelected}
                  variant={isSelected ? "primary" : "neutral"}
                  icon={<IconComp className="size-3" />}
                  onClick={() => dispatch(setArchetypeFilterAction(opt.value))}
                  className="shrink-0"
                >
                  {opt.label}
                </Chip>
              );
            })}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(resetFiltersAction())}
                leftIcon={<RotateCcw className="size-3" />}
                className="shrink-0 ml-1"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Assistants Grid */}
      {isLoading && assistants.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="190px" className="rounded-xl" />
          ))}
        </div>
      ) : filteredAssistants.length === 0 ? (
        <EmptyState
          variant="glass"
          size="sm"
          title="No AI assistants found"
          description={
            hasActiveFilters
              ? "We couldn't find any AI bot matching your search query or archetype filter."
              : "No AI bots deployed in your organization yet. Prepare your assistants for the April 6 launch!"
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch(resetFiltersAction())}
                leftIcon={<RotateCcw className="size-3" />}
              >
                Clear all filters
              </Button>
            ) : canEdit ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => dispatch(openCreateModalAction())}
                leftIcon={<Plus className="size-3" />}
              >
                Deploy your first assistant
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredAssistants.map((assistant) => (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
              canEdit={canEdit}
              isToggling={togglingId === assistant.id}
              onToggle={handleToggle}
              onEdit={(a) => dispatch(openEditModalAction(a))}
              onDelete={(a) => dispatch(openDeleteModalAction(a))}
            />
          ))}
        </div>
      )}

      {/* Assistant Modal */}
      <AssistantModal />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deletingAssistant !== null}
        onClose={() => dispatch(closeDeleteModalAction())}
        onConfirm={handleConfirmDelete}
        itemName={deletingAssistant?.name}
        itemType="AI assistant"
        isDeleting={isDeleting}
        warningMessage="Deleting this assistant will immediately deactivate its background tasks and remove it from video meetings and office spaces."
      />
    </div>
  );
}
