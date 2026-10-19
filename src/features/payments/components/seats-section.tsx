"use client";

import { useEffect, useState } from "react";
import { Button, Chip, Input, ProgressBar } from "@galyan/ui";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatDate } from "@/utils/format";
import { getBarVariant, PLAN_LABELS } from "@/features/payments/common/constants";
import { usePaymentsContext } from "@/features/payments/context";

/** Seats bought vs active members per organization, paged, searched and filtered on the server. */
export const SeatsSection = ({ className }: { className?: string }) => {
  const { state, setSeatFilters } = usePaymentsContext();
  const { seatFilters } = state;
  const [search, setSearch] = useState(seatFilters.search);

  // Debounce the search box into the server filter (which goes back to page 1)
  useEffect(() => {
    if (search === seatFilters.search) return;
    const t = setTimeout(() => setSeatFilters({ search }), 350);
    return () => clearTimeout(t);
  }, [search, seatFilters.search, setSeatFilters]);

  if (!state.seats) return null;
  const { data: rows, meta } = state.seats;
  const paidOnly = seatFilters.paidOnly;

  return (
    <GlassSection
      className={className}
      title="Seats by organization"
      subtitle="Purchased seats against active members"
      aside={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            variant={paidOnly ? "soft" : "ghost"}
            size="xs"
            className="w-full sm:w-auto"
            onClick={() => setSeatFilters({ paidOnly: !paidOnly })}
          >
            {paidOnly ? "Paid plans" : "All organizations"}
          </Button>
          <div className="w-full sm:w-44">
            <Input
              size="sm"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="size-3.5" />}
              className="w-full"
            />
          </div>
        </div>
      }
    >
      {rows.length === 0 ? (
        <SectionEmpty
          icon={<Users className="size-5" />}
          title={paidOnly ? "No paid seats yet" : "No organizations"}
          description={
            paidOnly
              ? "Seats appear here once an organization buys a plan or a payment is recorded."
              : undefined
          }
        />
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              key={row.organization.id}
              className={`${GLASS_ROW} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 py-2.5`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="truncate text-sm font-medium text-[var(--gy-text)]"
                    title={row.organization.name}
                  >
                    {row.organization.name}
                  </span>
                  <Chip variant="soft" size="xs">
                    {PLAN_LABELS[row.planTier] ?? row.planTier}
                  </Chip>
                  {row.overLimit && (
                    <Chip variant="danger" size="xs">
                      Over limit
                    </Chip>
                  )}
                </div>
                <span className="mt-0.5 block truncate text-xs text-[var(--gy-text-subtle)]">
                  {row.seatsPurchased > 0
                    ? `${row.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}${
                        row.provider
                          ? ` · ${row.provider === "MANUAL" ? "manual" : "Razorpay"}`
                          : ""
                      }${row.renewsAt ? ` · renews ${formatDate(row.renewsAt)}` : ""}`
                    : row.subscriptionStatus === "trialing"
                      ? "On trial"
                      : "No paid plan"}
                </span>
              </div>
              <div className="w-full sm:w-56 shrink-0">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[var(--gy-text-secondary)]">
                    {row.seatsUsed} / {row.seatsPurchased || "—"} seats
                  </span>
                  <span className="font-medium text-[var(--gy-text)]">
                    {row.utilisation != null ? `${row.utilisation}%` : ""}
                  </span>
                </div>
                <ProgressBar
                  progress={Math.min(100, row.utilisation ?? 0)}
                  size="sm"
                  variant={getBarVariant(row)}
                  showLabel={false}
                />
              </div>
            </div>
          ))}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1 text-xs text-[var(--gy-text-subtle)]">
              <span>
                Page {meta.page} of {meta.totalPages} · {meta.total} organizations
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  aria-label="Previous page"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setSeatFilters({ page: meta.page - 1 })}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  aria-label="Next page"
                  disabled={!meta.hasNextPage}
                  onClick={() => setSeatFilters({ page: meta.page + 1 })}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassSection>
  );
};
