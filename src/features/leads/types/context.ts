import type React from "react";
import type {
  CreateQuoteRequest,
  LeadDetail,
  QuoteStatus,
  UpdateLeadRequest,
} from "@/features/leads/types/api";
import type { LeadsAction } from "@/features/leads/types/actions";
import type {
  DetailDialog,
  LeadsFilters,
  LeadsPageState,
  LeadsTab,
  WaitlistFilters,
} from "@/features/leads/types/state";
import type { LeadActivityFormValues, LeadEmailFormValues } from "@/features/leads/types/forms";

export interface LeadsPermissions {
  /** Contact, notes, status, quotes (superadmin, manager, member). */
  canWork: boolean;
  /** Delete leads (superadmin, manager). */
  canDelete: boolean;
}

export interface LeadsContextType {
  state: LeadsPageState;
  dispatch: React.Dispatch<LeadsAction>;
  permissions: LeadsPermissions;

  setTab: (tab: LeadsTab) => void;
  setFilters: (filters: Partial<Omit<LeadsFilters, "page">>) => void;
  setSearchInput: (value: string) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  exportCsv: () => Promise<void>;

  openDetail: (id: string) => void;
  closeDetail: () => void;
  setDialog: (dialog: DetailDialog) => void;

  /** Mutations on the open lead; resolve true on success. */
  updateLead: (body: UpdateLeadRequest, successMessage?: string) => Promise<boolean>;
  logActivity: (values: LeadActivityFormValues) => Promise<boolean>;
  sendEmail: (values: LeadEmailFormValues) => Promise<boolean>;
  createQuote: (body: CreateQuoteRequest, send: boolean) => Promise<boolean>;
  sendQuote: (quoteId: string) => Promise<boolean>;
  setQuoteStatus: (quoteId: string, status: QuoteStatus) => Promise<boolean>;
  deleteLead: () => Promise<boolean>;

  setWaitlistSelection: (ids: string[]) => void;
  /** Waitlist filters are applied on the server; each resets to page 1. */
  setWaitlistStatus: (status: WaitlistFilters["status"]) => void;
  setWaitlistSearchInput: (value: string) => void;
  setWaitlistPage: (page: number) => void;
  /** Page of the open lead's timeline. */
  setTimelinePage: (page: number) => void;
  inviteWaitlist: () => Promise<boolean>;
  openWaitlistLead: (id: string) => void;

  /** The lead open in the drawer, if loaded. */
  openLead: LeadDetail | null;
}
