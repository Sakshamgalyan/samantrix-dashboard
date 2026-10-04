import type React from "react";
import { api, ApiError } from "@/lib/api";
import type {
  AdminOrganizationDetail,
  AdminOrganizationsResponse,
  OrganizationsAction,
  UpdateOrganizationStatusRequest,
  UpdateOrganizationStatusResponse,
} from "../types";
import {
  detailFailure,
  detailSuccess,
  loadFailure,
  loadSuccess,
} from "./action";

export const getApiErrorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback;

/** Loads every organization with platform-wide counts into context. */
export async function fetchOrganizationsApi(
  dispatch: React.Dispatch<OrganizationsAction>,
): Promise<void> {
  try {
    const data = await api.get<AdminOrganizationsResponse>(
      "/organizations/admin",
    );
    dispatch(loadSuccess(data));
  } catch (err) {
    dispatch(
      loadFailure(getApiErrorMessage(err, "Couldn't load organizations.")),
    );
  }
}

/** Loads one organization's members, subscription and recent invoices into context. */
export async function fetchOrganizationDetailApi(
  orgId: string,
  dispatch: React.Dispatch<OrganizationsAction>,
): Promise<void> {
  try {
    const detail = await api.get<AdminOrganizationDetail>(
      `/organizations/admin/${orgId}`,
    );
    dispatch(detailSuccess(detail));
  } catch (err) {
    dispatch(
      detailFailure(
        orgId,
        getApiErrorMessage(err, "Couldn't load this organization."),
      ),
    );
  }
}

/** Activates or suspends an organization; throws ApiError on a rejected transition. */
export function updateOrganizationStatusApi(
  orgId: string,
  body: UpdateOrganizationStatusRequest,
): Promise<UpdateOrganizationStatusResponse> {
  return api.patch<UpdateOrganizationStatusResponse>(
    `/organizations/admin/${orgId}/status`,
    body,
  );
}
