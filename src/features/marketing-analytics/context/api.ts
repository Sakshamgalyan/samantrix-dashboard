import type React from "react";
import { api, ApiError } from "@/lib/api";
import type {
  MarketingAction,
  MarketingRange,
  MarketingReport,
  VisitorsResponse,
} from "../types";
import { VISITS_PAGE_SIZE } from "../common/constants";
import {
  reportFailure,
  reportSuccess,
  visitsFailure,
  visitsLoading,
  visitsSuccess,
} from "./action";

/** Loads the marketing report for a 7/30/90-day window into context. */
export async function loadReportApi(
  range: MarketingRange,
  dispatch: React.Dispatch<MarketingAction>,
): Promise<void> {
  try {
    dispatch(
      reportSuccess(
        await api.get<MarketingReport>(`/analytics/marketing?range=${range}`),
      ),
    );
  } catch (err) {
    dispatch(
      reportFailure(
        err instanceof ApiError
          ? err.message
          : "Couldn't load marketing analytics.",
      ),
    );
  }
}

/** Loads one page of the most recent visits (newest first) into context. */
export async function loadVisitsApi(
  page: number,
  dispatch: React.Dispatch<MarketingAction>,
): Promise<void> {
  dispatch(visitsLoading());
  try {
    dispatch(
      visitsSuccess(
        await api.get<VisitorsResponse>(
          `/analytics/visitors?page=${page}&limit=${VISITS_PAGE_SIZE}&sortBy=createdAt&sortOrder=desc`,
        ),
      ),
    );
  } catch (err) {
    dispatch(
      visitsFailure(
        err instanceof ApiError ? err.message : "Couldn't load recent visits.",
      ),
    );
  }
}
