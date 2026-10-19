"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth";
import { pageParams } from "@/features/common/pagination";
import { useGetDevelopersSummaryQuery } from "@/features/developers/context/api";
import { useGetLeadsQuery, useGetLeadsSummaryQuery } from "@/features/leads/context/api";
import {
  useGetAdminOrganizationsQuery,
  useGetAdminOrganizationsSummaryQuery,
} from "@/features/organizations/context/api";
import { useGetPaymentsQuery, useGetPaymentsSummaryQuery } from "@/features/payments/context/api";
import { useGetRevenueReportQuery } from "@/features/revenue/context/api";
import { POLL_INTERVAL_MS } from "@/store";
import { hasPermission, isSuperadmin } from "@/utils/roles";
import { useGetPlatformOverviewQuery } from "@/features/overview/admin/api";
import type { AdminOverviewData, LeadRow, LeadsSummary } from "@/features/overview/admin/types";

/**
 * Recent rows come from page 1 of each list (`pageParams(1)`), the same request and cache
 * entry as the first page of the Leads, Organizations and Payments screens, then sliced.
 */
const FIRST_PAGE = pageParams(1);
const RECENT_LEADS = 6;
const RECENT_ORGANIZATIONS = 4;
const RECENT_PAYMENTS = 5;

/**
 * Everything the developer-console home shows. Counts and KPIs come from summary endpoints
 * (shared with the sidebar badge and the KPI cards of each page); the activity feed reads the
 * first page of the leads, organizations and payments lists. A section whose data fails, or
 * that the caller's role can't read, is simply left out. Refreshes every minute.
 */
export function useAdminOverview() {
  const { user } = useAuth();
  const canSeeDevelopers = hasPermission(user, "developers:manage");
  const canSeePayments = hasPermission(user, "payments:view");
  const superadmin = isSuperadmin(user);

  const poll = { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true };
  const platform = useGetPlatformOverviewQuery(undefined, poll);
  const leads = useGetLeadsSummaryQuery(undefined, poll);
  const recentLeads = useGetLeadsQuery(FIRST_PAGE, poll);
  const orgs = useGetAdminOrganizationsSummaryQuery(undefined, poll);
  const recentOrgs = useGetAdminOrganizationsQuery(FIRST_PAGE, poll);
  const developers = useGetDevelopersSummaryQuery(undefined, { ...poll, skip: !canSeeDevelopers });
  const paymentsSummary = useGetPaymentsSummaryQuery(undefined, { ...poll, skip: !canSeePayments });
  const payments = useGetPaymentsQuery(FIRST_PAGE, { ...poll, skip: !canSeePayments });
  const revenueReport = useGetRevenueReportQuery(undefined, { ...poll, skip: !superadmin });

  const sources = [
    platform,
    leads,
    recentLeads,
    orgs,
    recentOrgs,
    developers,
    paymentsSummary,
    payments,
    revenueReport,
  ];
  // First paint waits until every requested source has answered (successfully or not)
  const settled = sources.every((q) => !q.isLoading);
  const loadedAt = Math.max(0, ...sources.map((q) => q.fulfilledTimeStamp ?? q.startedTimeStamp ?? 0));

  const data = useMemo<AdminOverviewData | null>(() => {
    if (!settled) return null;
    return {
      platform: platform.data ?? null,
      leads: (leads.data as LeadsSummary | undefined) ?? null,
      recentLeads: ((recentLeads.data?.data ?? []) as LeadRow[]).slice(0, RECENT_LEADS),
      organizations: orgs.data?.counts ?? null,
      recentOrganizations: (recentOrgs.data?.data ?? []).slice(0, RECENT_ORGANIZATIONS),
      developers: canSeeDevelopers ? (developers.data?.counts ?? null) : null,
      paymentsSummary: canSeePayments ? (paymentsSummary.data ?? null) : null,
      recentPayments: canSeePayments ? (payments.data?.data ?? []).slice(0, RECENT_PAYMENTS) : [],
      revenue: superadmin && revenueReport.data ? revenueReport.data : null,
      loadedAt: loadedAt > 0 ? new Date(loadedAt).toISOString() : new Date().toISOString(),
    };
  }, [
    settled,
    platform.data,
    leads.data,
    recentLeads.data,
    orgs.data,
    recentOrgs.data,
    developers.data,
    paymentsSummary.data,
    payments.data,
    revenueReport.data,
    canSeeDevelopers,
    canSeePayments,
    superadmin,
    loadedAt,
  ]);

  return { data };
}
