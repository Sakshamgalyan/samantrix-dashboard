"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
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
  ArrowRight,
  Crown,
  Layers,
  Lock,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useGetOrgFeaturesQuery,
  useToggleOrgFeatureMutation,
} from "@/features/features/context/api";
import { useFeatures } from "@/features/features/context";
import {
  resetFiltersAction,
  setActionErrorAction,
  setCategoryFilterAction,
  setSearchQueryAction,
  setStatusFilterAction,
  setTogglingKeyAction,
} from "@/features/features/context/action";
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  getFeatureIcon,
} from "@/features/features/common/constants";
import { FeatureCard } from "@/features/features/components/feature-card";
import type { FeatureStatusFilter } from "@/features/features/types/state";

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export const FeaturesContent = () => {
  const { organization, isOwner, isAdmin, user } = useAuth();
  const canEdit = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";
  const { toast } = useToast();

  const { state, dispatch } = useFeatures();
  const { togglingKey, actionError, searchQuery, categoryFilter, statusFilter } =
    state;

  const debouncedSearch = useDebounce(searchQuery, 250);

  const featuresQuery = useGetOrgFeaturesQuery();
  const { refetch, isLoading, isFetching } = featuresQuery;
  const [toggleFeature] = useToggleOrgFeatureMutation();
  const features = featuresQuery.data ?? [];

  const loadError = featuresQuery.error
    ? queryErrorMessage(featuresQuery.error, "Failed to load features.")
    : null;
  const error = actionError ?? loadError;

  const handleToggle = useCallback(
    async (featureKey: string, nextChecked: boolean) => {
      dispatch(setActionErrorAction(null));
      dispatch(setTogglingKeyAction(featureKey));
      try {
        await toggleFeature({ featureKey, isEnabled: nextChecked }).unwrap();
        toast.success(
          nextChecked
            ? `Feature '${featureKey}' enabled successfully.`
            : `Feature '${featureKey}' disabled.`,
        );
      } catch (err) {
        const msg = queryErrorMessage(err, "Failed to update feature.");
        dispatch(setActionErrorAction(msg));
        toast.error(msg);
      } finally {
        dispatch(setTogglingKeyAction(null));
      }
    },
    [toggleFeature, dispatch, toast],
  );

  // Statistics calculation across real database records
  const totalFeatures = features.length;
  const activeCount = features.filter((f) => f.isAllowed && f.isEnabled).length;
  const allowedCount = features.filter((f) => f.isAllowed).length;
  const lockedCount = features.filter((f) => !f.isAllowed).length;
  const activePercent = totalFeatures > 0 ? Math.round((activeCount / totalFeatures) * 100) : 0;
  const allowedPercent = totalFeatures > 0 ? Math.round((allowedCount / totalFeatures) * 100) : 0;

  const planTierName =
    organization?.planTier || (user?.organization?.planTier ?? "FREE");

  // Filter features based on search, category and status
  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      // 1. Search Query
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesName = (feature.name || "").toLowerCase().includes(q);
        const matchesKey = feature.key.toLowerCase().includes(q);
        const matchesDesc = (feature.description || "").toLowerCase().includes(q);
        const matchesCategory = (feature.category || "").toLowerCase().includes(q);
        if (!matchesName && !matchesKey && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      // 2. Category Filter
      if (categoryFilter !== "ALL") {
        const fCat = (feature.category || "").toLowerCase();
        const targetCat = categoryFilter.toLowerCase();
        if (!fCat.includes(targetCat) && !targetCat.includes(fCat)) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter === "ACTIVE") {
        return feature.isAllowed && feature.isEnabled;
      }
      if (statusFilter === "DISABLED") {
        return feature.isAllowed && !feature.isEnabled;
      }
      if (statusFilter === "LOCKED") {
        return !feature.isAllowed;
      }

      return true;
    });
  }, [features, debouncedSearch, categoryFilter, statusFilter]);

  // Compute category count map for badges
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("ALL", features.length);
    features.forEach((f) => {
      const cat = f.category || "General";
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return map;
  }, [features]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || categoryFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Feature operation error"
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
                Feature Catalog &amp; Entitlements
              </Chip>
              <Chip variant="primary" size="sm">
                {planTierName} Plan Tier
              </Chip>
              <Chip variant="neutral" size="sm">
                {activeCount} active modules
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Workspace Features &amp; Modules
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Configure live digital workplace capabilities, virtual office tools, and enterprise
              integrations scoped to your organization subscription.
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

            <Button
              variant="primary"
              size="sm"
              href="/organization/subscription"
              as={Link}
              rightIcon={<ArrowRight className="size-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              Manage Subscription
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Current Plan */}
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
              Current Plan
            </Typography>
            <div className={`${ICON_TILE} bg-amber-500/10 text-amber-500`}>
              <Crown className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <Typography
              variant="p"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-xl sm:text-2xl font-bold tracking-tight truncate"
            >
              {planTierName}
            </Typography>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              tier
            </Typography>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={100}
              variant="warning"
              size="sm"
              showLabel={false}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Subscription entitlement
          </Typography>
        </Card>

        {/* Metric 2: Active Features */}
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
              Active Features
            </Typography>
            <div className={`${ICON_TILE} bg-emerald-500/10 text-emerald-500`}>
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              <AnimatedNumber value={activeCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              / {totalFeatures} total
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
            {activePercent}% running in workplace
          </Typography>
        </Card>

        {/* Metric 3: Entitled Features */}
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
              Plan Entitled
            </Typography>
            <div className={`${ICON_TILE} bg-blue-500/10 text-blue-500`}>
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600">
              <AnimatedNumber value={allowedCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              / {totalFeatures} features
            </Typography>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={allowedPercent}
              variant="primary"
              size="sm"
              showLabel={false}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Unlocked by current plan
          </Typography>
        </Card>

        {/* Metric 4: Locked Features */}
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
              Locked Features
            </Typography>
            <div className={`${ICON_TILE} bg-purple-500/10 text-purple-500`}>
              <Lock className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600">
              <AnimatedNumber value={lockedCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              locked
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  totalFeatures > 0 ? (lockedCount / totalFeatures) * 100 : 0,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Requires tier upgrade
          </Typography>
        </Card>
      </div>

      {/* Filter & Search Controls */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs space-y-3.5"
      >
        {/* Top Controls Row: Search Input + Status Filter Pills */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full sm:w-72 lg:w-80">
            <Input
              size="sm"
              leftIcon={<Search className="size-3.5" />}
              placeholder="Search features..."
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
              Status:
            </Typography>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = statusFilter === opt.value;
              const icon =
                opt.value === "ACTIVE" ? (
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                ) : opt.value === "LOCKED" ? (
                  <Lock className="size-2.5" />
                ) : opt.value === "DISABLED" ? (
                  <span className="inline-block size-1.5 rounded-full bg-neutral-400" />
                ) : undefined;

              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  clickable
                  selected={isSelected}
                  variant={isSelected ? "primary" : "neutral"}
                  icon={icon}
                  onClick={() =>
                    dispatch(setStatusFilterAction(opt.value as FeatureStatusFilter))
                  }
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

        {/* Category Pills Row */}
        <div className="border-t border-[var(--gy-border)] pt-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Typography
              variant="span"
              textColor="var(--gy-text-subtle)"
              className="mr-1 text-xs shrink-0 hidden sm:inline"
            >
              Category:
            </Typography>

            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = categoryFilter === cat.value;
              const count =
                cat.value === "ALL"
                  ? totalFeatures
                  : categoryCounts.get(cat.value) ?? 0;

              if (cat.value !== "ALL" && count === 0) {
                return null;
              }

              const IconComp =
                cat.value === "ALL" ? Layers : getFeatureIcon("", cat.value);

              return (
                <Chip
                  key={cat.value}
                  size="sm"
                  clickable
                  selected={isSelected}
                  variant={isSelected ? "primary" : "neutral"}
                  icon={<IconComp className="size-2.5" />}
                  onClick={() => dispatch(setCategoryFilterAction(cat.value))}
                  className="shrink-0"
                >
                  {cat.label} ({count})
                </Chip>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Features Grid Area */}
      {isLoading && features.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="180px" className="rounded-xl" />
          ))}
        </div>
      ) : filteredFeatures.length === 0 ? (
        <EmptyState
          variant="glass"
          size="sm"
          title="No features matched your filters"
          description={
            hasActiveFilters
              ? "We couldn't find any feature matching your search query or selected category."
              : "No features currently registered in your organization catalog."
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
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredFeatures.map((item) => (
            <FeatureCard
              key={item.key}
              feature={item}
              canEdit={canEdit}
              isToggling={togglingKey === item.key}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
