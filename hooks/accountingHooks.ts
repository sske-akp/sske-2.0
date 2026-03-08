import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAccounts,
  fetchJournalEntries,
  fetchJournalEntryDetail,
  createManualJournalEntry,
  fetchTrialBalance,
  fetchProfitLoss,
  fetchBalanceSheet,
  fetchAgingReceivables,
} from "@/services/accountingServices";
import {
  Account,
  JournalEntry,
  JournalEntryFilters,
  ManualJournalEntryForm,
  TrialBalanceReport,
  ProfitLossReport,
  BalanceSheetReport,
  AgingReceivablesReport,
} from "@/types/accounting";

export function useAccounts() {
  return useQuery<Account[], Error>({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });
}

export function useJournalEntries(filters?: JournalEntryFilters) {
  return useQuery<JournalEntry[], Error>({
    queryKey: ["journal-entries", filters],
    queryFn: () => fetchJournalEntries(filters),
  });
}

export function useJournalEntryDetail(id: string) {
  return useQuery<JournalEntry, Error>({
    queryKey: ["journal-entry", id],
    queryFn: () => fetchJournalEntryDetail(id),
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<JournalEntry, Error, ManualJournalEntryForm>({
    mutationFn: createManualJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}

export function useTrialBalance(asOf?: string) {
  return useQuery<TrialBalanceReport, Error>({
    queryKey: ["trial-balance", asOf],
    queryFn: () => fetchTrialBalance(asOf),
  });
}

export function useProfitLoss(from?: string, to?: string) {
  return useQuery<ProfitLossReport, Error>({
    queryKey: ["profit-loss", from, to],
    queryFn: () => fetchProfitLoss(from!, to!),
    enabled: !!from && !!to,
  });
}

export function useBalanceSheet(asOf?: string) {
  return useQuery<BalanceSheetReport, Error>({
    queryKey: ["balance-sheet", asOf],
    queryFn: () => fetchBalanceSheet(asOf),
  });
}

export function useAgingReceivables() {
  return useQuery<AgingReceivablesReport, Error>({
    queryKey: ["aging-receivables"],
    queryFn: fetchAgingReceivables,
  });
}
