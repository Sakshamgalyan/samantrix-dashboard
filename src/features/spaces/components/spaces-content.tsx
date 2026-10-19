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
  Boxes,
  Building2,
  Headphones,
  Lock,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { useDebounce } from "@/hooks/use-debounce";
import { DeleteModal } from "@/components/common/delete-modal";
import { useSpaces } from "../context";
import {
  closeDeleteModalAction,
  openConfigModalAction,
  openCreateModalAction,
  openDeleteModalAction,
  openEditModalAction,
  resetFiltersAction,
  setActionErrorAction,
  setSearchQueryAction,
  setTypeFilterAction,
} from "../context/action";
import {
  useDeleteOrgRoomMutation,
  useGetOrgOfficeQuery,
  useGetOrgRoomsQuery,
} from "../context/api";
import { FILTER_OPTIONS, OFFICE_THEMES, ROOM_TYPE_META } from "../common/constants";
import { SpaceCard } from "./space-card";
import { SpaceModal } from "./space-modal";
import { OfficeConfigModal } from "./office-config-modal";

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export function SpacesContent() {
  const { isOwner, isAdmin, user } = useAuth();
  const canEdit = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";
  const { toast } = useToast();

  const { state, dispatch } = useSpaces();
  const { searchQuery, typeFilter, actionError, deletingRoom } = state;

  const debouncedSearch = useDebounce(searchQuery, 250);

  const roomsQuery = useGetOrgRoomsQuery();
  const officeQuery = useGetOrgOfficeQuery();
  const { refetch: refetchRooms, isLoading: isRoomsLoading, isFetching: isRoomsFetching } = roomsQuery;
  const { refetch: refetchOffice, isFetching: isOfficeFetching } = officeQuery;
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteOrgRoomMutation();
  const rooms = roomsQuery.data ?? [];
  const office = officeQuery.data;
  const officeConfig = office?.layoutSettings?.officeConfig || {};
  const currentTheme =
    OFFICE_THEMES.find((t) => t.key === office?.mapAssetKey) || OFFICE_THEMES[0];

  const isRefreshing = isRoomsFetching || isOfficeFetching;

  const handleRefresh = useCallback(() => {
    void refetchRooms();
    void refetchOffice();
  }, [refetchRooms, refetchOffice]);

  const loadError = roomsQuery.error
    ? queryErrorMessage(roomsQuery.error, "Failed to load office spaces.")
    : null;
  const error = actionError ?? loadError;

  // Filter rooms based on search and type filter
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesType = room.type.toLowerCase().includes(q);
        if (!matchesName && !matchesType) return false;
      }

      if (typeFilter !== "ALL") {
        if (room.type !== typeFilter) return false;
      }

      return true;
    });
  }, [rooms, debouncedSearch, typeFilter]);

  // Statistics calculation
  const totalSpaces = rooms.length;
  const totalOccupants = rooms.reduce((acc, r) => acc + (r.occupantCount || 0), 0);
  const meetingSpacesCount = rooms.filter(
    (r) => r.type === "MEETING" || r.type === "CONFERENCE",
  ).length;
  const privateOrFocusCount = rooms.filter(
    (r) => r.type === "FOCUS_ROOM" || r.type === "CABIN" || r.isPrivate,
  ).length;

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingRoom) return;
    try {
      await deleteRoom(deletingRoom.id).unwrap();
      toast.success(`Space '${deletingRoom.name}' deleted successfully.`);
      dispatch(closeDeleteModalAction());
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to delete space.");
      dispatch(setActionErrorAction(msg));
      toast.error(msg);
    }
  }, [deletingRoom, deleteRoom, dispatch, toast]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || typeFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Space management error"
          description={error}
          button={
            <Button variant="danger-soft" size="xs" onClick={handleRefresh}>
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
                Virtual workplace &amp; zones
              </Chip>
              <Chip variant="neutral" size="sm">
                {totalSpaces} configured spaces
              </Chip>
              <Chip variant="primary" size="sm">
                {totalOccupants} active avatars
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Office Spaces &amp; Virtual Zones
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Manage 3D virtual office rooms, interactive meeting zones, focus pods,
              and live occupancy across your Simantrix workplace.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              disabled={isRefreshing}
              onClick={handleRefresh}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>

            {canEdit && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch(openConfigModalAction(office))}
                  leftIcon={<Settings2 className="size-3.5" />}
                  className="flex-1 sm:flex-initial"
                >
                  Configure Office
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => dispatch(openCreateModalAction())}
                  leftIcon={<Plus className="size-3.5" />}
                  className="flex-1 sm:flex-initial"
                >
                  Create Space
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Campus Architecture & Settings Overview Strip */}
      {office && (
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
        >
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Typography
                    variant="h4"
                    weight="semibold"
                    textColor="var(--gy-text)"
                    className="text-sm sm:text-base font-semibold truncate"
                  >
                    {office.name}
                  </Typography>
                  <Chip size="xs" variant="primary" icon={<Sparkles className="size-2.5" />}>
                    {currentTheme?.name ?? "Corporate Tech"}
                  </Chip>
                  <Chip size="xs" variant="neutral">
                    {officeConfig.defaultDimension === "2d" ? "2D Default" : "3D Default"}
                  </Chip>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-subtle)"
                    className="text-xs"
                  >
                    Capacity:{" "}
                    <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
                      {office.occupantCount} / {office.maxCapacity} avatars
                    </Typography>
                  </Typography>
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-subtle)"
                    className="text-xs"
                  >
                    Proximity Voice:{" "}
                    <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
                      {officeConfig.proximityVoiceRadius ?? 120} units
                    </Typography>
                  </Typography>
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-subtle)"
                    className="text-xs"
                  >
                    Soundtrack:{" "}
                    <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
                      {officeConfig.ambientSound ?? "lofi_work"}
                    </Typography>
                  </Typography>
                </div>
              </div>
            </div>

            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch(openConfigModalAction(office))}
                leftIcon={<SlidersHorizontal className="size-3.5" />}
                className="shrink-0 w-full sm:w-auto"
              >
                Edit Settings
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Spaces */}
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
              Total Spaces
            </Typography>
            <div className={`${ICON_TILE} bg-indigo-500/10 text-indigo-500`}>
              <Boxes className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
              <AnimatedNumber value={totalSpaces} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              zones
            </Typography>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={100}
              variant="primary"
              size="sm"
              showLabel={false}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Configured office zones
          </Typography>
        </Card>

        {/* Metric 2: Live Occupants */}
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
              Live Occupants
            </Typography>
            <div className={`${ICON_TILE} bg-emerald-500/10 text-emerald-500`}>
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              <AnimatedNumber value={totalOccupants} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              avatars
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  totalOccupants > 0 ? (totalOccupants / (office?.maxCapacity || 100)) * 100 : 0,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Active avatars in rooms
          </Typography>
        </Card>

        {/* Metric 3: Meetings & Collab */}
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
              Meeting &amp; Collab
            </Typography>
            <div className={`${ICON_TILE} bg-blue-500/10 text-blue-500`}>
              <Video className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600">
              <AnimatedNumber value={meetingSpacesCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              rooms
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  totalSpaces > 0 ? (meetingSpacesCount / totalSpaces) * 100 : 0,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Video &amp; screenshare zones
          </Typography>
        </Card>

        {/* Metric 4: Private & Focus */}
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
              Private &amp; Focus
            </Typography>
            <div className={`${ICON_TILE} bg-purple-500/10 text-purple-500`}>
              <Headphones className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600">
              <AnimatedNumber value={privateOrFocusCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              pods
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  totalSpaces > 0 ? (privateOrFocusCount / totalSpaces) * 100 : 0,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Restricted or quiet pods
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
              placeholder="Search spaces by name or type..."
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
              Filter:
            </Typography>
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = typeFilter === opt.value;
              const meta =
                opt.value !== "ALL"
                  ? ROOM_TYPE_META[opt.value as keyof typeof ROOM_TYPE_META]
                  : null;
              const IconComp = meta ? meta.icon : Sparkles;

              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  clickable
                  selected={isSelected}
                  variant={isSelected ? "primary" : "neutral"}
                  icon={<IconComp className="size-3" />}
                  onClick={() => dispatch(setTypeFilterAction(opt.value))}
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

      {/* Spaces Grid */}
      {isRoomsLoading && rooms.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="180px" className="rounded-xl" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          variant="glass"
          size="sm"
          title="No spaces match your filters"
          description={
            hasActiveFilters
              ? "We couldn't find any office space matching your search query or zone filter."
              : "No office spaces have been created yet. Set up rooms for your virtual workplace!"
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
                Create your first space
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredRooms.map((room) => (
            <SpaceCard
              key={room.id}
              room={room}
              canEdit={canEdit}
              onEdit={(r) => dispatch(openEditModalAction(r))}
              onDelete={(r) => dispatch(openDeleteModalAction(r))}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <SpaceModal />

      {/* Global Office Space Configuration Modal */}
      <OfficeConfigModal />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deletingRoom !== null}
        onClose={() => dispatch(closeDeleteModalAction())}
        onConfirm={handleConfirmDelete}
        itemName={deletingRoom?.name}
        itemType="space zone"
        isDeleting={isDeleting}
        warningMessage="Deleting this space will disconnect any active occupants and remove associated proximity voice zones from the virtual office scene."
      />
    </div>
  );
}
