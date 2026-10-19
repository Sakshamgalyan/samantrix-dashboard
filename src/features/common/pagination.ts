import { PAGE_SIZE } from "@/features/common/constants";

/** `meta` of every paginated backend response (`createPaginatedResponse`). */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Standard paginated envelope: one page of rows plus its meta. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export type PageQueryParams = Record<string, string | number | boolean>;

/**
 * Query string for one page: `page`, `limit` (always {@link PAGE_SIZE}) plus any filters.
 * Empty filters (`""`, `"ALL"`, null/undefined) are dropped so equal filters give equal cache keys.
 */
export function pageParams(
  page: number,
  filters: Record<string, string | number | boolean | null | undefined> = {},
): PageQueryParams {
  const params: PageQueryParams = { page, limit: PAGE_SIZE };
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "" || value === "ALL") continue;
    params[key] = typeof value === "string" ? value.trim() : value;
  }
  return params;
}

/** Galyan `Table` pagination config from a response meta (false hides the pager). */
export function tablePagination(meta: PaginationMeta | null | undefined) {
  if (!meta || meta.totalPages <= 1) return false as const;
  return {
    currentPage: meta.page,
    totalPages: meta.totalPages,
    totalItems: meta.total,
    itemsPerPage: meta.limit,
  };
}
