"use client";

import React from "react";
import { Card, Input, Tabs } from "@galyan/ui";
import { Search, X } from "lucide-react";
import { NOTIFICATION_TABS } from "@/features/notifications/common/constants";
import { useNotifications } from "@/features/notifications/context";
import {
  setCategoryAction,
  setSearchAction,
} from "@/features/notifications/context/action";
import type { NotificationCategory } from "@/features/notifications/types/api";

export const NotificationFilters: React.FC = () => {
  const { state, dispatch } = useNotifications();
  const { search, activeCategory } = state;

  return (
    <Card variant="glass" radius="xl" padding="sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full overflow-x-auto no-scrollbar lg:max-w-xl">
          <Tabs
            items={NOTIFICATION_TABS}
            activeTab={activeCategory}
            onTabChange={(id) =>
              dispatch(setCategoryAction(id as NotificationCategory))
            }
            variant="card"
            size="sm"
            fullWidth={false}
          />
        </div>

        <div className="w-full lg:w-72 relative">
          <Input
            size="sm"
            placeholder="Search alerts by title or body..."
            value={search}
            onChange={(e) => dispatch(setSearchAction(e.target.value))}
            leftIcon={<Search className="size-3.5 text-[var(--gy-text-subtle)]" />}
            rightIcon={
              search ? (
                <button
                  type="button"
                  onClick={() => dispatch(setSearchAction(""))}
                  className="rounded p-0.5 hover:bg-[var(--gy-surface-muted)] text-[var(--gy-text-subtle)]"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              ) : undefined
            }
          />
        </div>
      </div>
    </Card>
  );
};

export default NotificationFilters;
