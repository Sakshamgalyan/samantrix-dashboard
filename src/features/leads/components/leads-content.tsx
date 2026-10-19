"use client";

import { Button, Tabs } from "@galyan/ui";
import { Download, Target, Users } from "lucide-react";
import { AdminLoadError } from "@/components/layout/common/states";
import { GlassSection } from "@/components/layout/common/glass-section";
import { useLeadsContext } from "@/features/leads/context";
import { LeadsKpis } from "@/features/leads/components/leads-kpis";
import { LeadsToolbar } from "@/features/leads/components/leads-toolbar";
import { LeadsTable } from "@/features/leads/components/leads-table";
import { WaitlistPanel } from "@/features/leads/components/waitlist-panel";
import { LeadDetailDrawer } from "@/features/leads/components/lead-detail-drawer";

export const LeadsContent = () => {
  const { state, setTab, refresh, exportCsv } = useLeadsContext();
  const { tab, summary, refreshing } = state;

  const tabs = [
    {
      id: "pipeline",
      label: "Pipeline",
      icon: <Target className="size-3.5" />,
      badge: summary?.pipeline.open,
    },
    {
      id: "waitlist",
      label: "Waitlist",
      icon: <Users className="size-3.5" />,
      badge: summary?.waitlist.queued,
    },
  ];

  return (
    <div className="space-y-4">
      <LeadsKpis />

      <GlassSection
        title={
          <Tabs
            items={tabs}
            activeTab={tab}
            onTabChange={(id) => setTab(id as "pipeline" | "waitlist")}
            variant="ghost"
            size="sm"
          />
        }
        aside={
          <div className="flex items-center gap-2">
            {tab === "pipeline" && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="size-3.5" />}
                onClick={() => void exportCsv()}
              >
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        }
      >
        {tab === "pipeline" ? (
          state.listError && state.items.length === 0 ? (
            <AdminLoadError title="Leads unavailable" message={state.listError} onRetry={() => void refresh()} />
          ) : (
            <div className="space-y-3">
              <LeadsToolbar />
              <LeadsTable />
            </div>
          )
        ) : (
          <WaitlistPanel />
        )}
      </GlassSection>

      <LeadDetailDrawer />
    </div>
  );
};
