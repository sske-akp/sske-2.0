import {
  AccountAPI,
  Account,
  JournalEntryAPI,
  JournalEntry,
  JournalLine,
  JournalEntryFilters,
  ManualJournalEntryForm,
  TrialBalanceReport,
  ProfitLossReport,
  BalanceSheetReport,
  AgingReceivablesReport,
  AgingRow,
} from "@/types/accounting";
import { apiFetch } from "@/lib/apiClient";

// --- Mappers ---

function mapAccount(api: AccountAPI): Account {
  return {
    id: api.id,
    code: api.code,
    name: api.name,
    accountType: api.account_type,
    parentId: api.parent_id,
    isSystem: api.is_system,
  };
}

function mapJournalEntry(api: JournalEntryAPI): JournalEntry {
  const lines: JournalLine[] = (api.lines ?? []).map((l) => ({
    id: l.id,
    journalEntryId: l.journal_entry_id,
    accountId: l.account_id,
    debit: l.debit ?? 0,
    credit: l.credit ?? 0,
    description: l.description,
  }));
  return {
    id: api.id,
    entryNumber: api.entry_number,
    entryDate: api.entry_date,
    description: api.description,
    referenceType: api.reference_type,
    referenceId: api.reference_id,
    isAuto: api.is_auto,
    createdAt: api.created_at,
    lines,
    totalDebit: lines.reduce((s, l) => s + l.debit, 0),
    totalCredit: lines.reduce((s, l) => s + l.credit, 0),
  };
}

// --- Accounts ---

export async function fetchAccounts(): Promise<Account[]> {
  const data = await apiFetch<AccountAPI[]>("/accounts/?limit=500");
  return data.map(mapAccount);
}

// --- Journal Entries ---

export async function fetchJournalEntries(
  filters?: JournalEntryFilters
): Promise<JournalEntry[]> {
  const params = new URLSearchParams();
  params.set("limit", "200");
  if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters?.dateTo) params.set("date_to", filters.dateTo);
  if (filters?.accountId) params.set("account_id", filters.accountId);
  if (filters?.referenceType) params.set("reference_type", filters.referenceType);

  const data = await apiFetch<JournalEntryAPI[]>(
    `/journal-entries/?${params.toString()}`
  );
  return data.map(mapJournalEntry);
}

export async function fetchJournalEntryDetail(
  id: string
): Promise<JournalEntry> {
  const data = await apiFetch<JournalEntryAPI>(`/journal-entries/${id}`);
  return mapJournalEntry(data);
}

export async function createManualJournalEntry(
  form: ManualJournalEntryForm
): Promise<JournalEntry> {
  const data = await apiFetch<JournalEntryAPI>("/journal-entries/", {
    method: "POST",
    json: {
      entry_date: form.entryDate,
      description: form.description,
      reference_type: form.referenceType || "adjustment",
      lines: form.lines.map((l) => ({
        account_id: l.accountId,
        debit: l.debit,
        credit: l.credit,
        description: l.description || null,
      })),
    },
  });
  return mapJournalEntry(data);
}

// --- Reports ---

export async function fetchTrialBalance(
  asOf?: string
): Promise<TrialBalanceReport> {
  const params = asOf ? `?as_of=${asOf}` : "";
  const data = await apiFetch<{
    as_of: string;
    accounts: { account_code: string; account_name: string; account_type: string; total_debit: number; total_credit: number; balance: number }[];
    total_debit: number;
    total_credit: number;
    is_balanced: boolean;
  }>(`/reports/trial-balance${params}`);
  return {
    asOf: data.as_of,
    accounts: data.accounts.map(
      (a: { account_code: string; account_name: string; account_type: string; total_debit: number; total_credit: number; balance: number }) => ({
        accountCode: a.account_code,
        accountName: a.account_name,
        accountType: a.account_type,
        totalDebit: a.total_debit,
        totalCredit: a.total_credit,
        balance: a.balance,
      })
    ),
    totalDebit: data.total_debit,
    totalCredit: data.total_credit,
    isBalanced: data.is_balanced,
  };
}

export async function fetchProfitLoss(
  from: string,
  to: string
): Promise<ProfitLossReport> {
  const data = await apiFetch<{
    from: string;
    to: string;
    income: { account_code: string; account_name: string; amount: number }[];
    expenses: { account_code: string; account_name: string; amount: number }[];
    total_income: number;
    total_expenses: number;
    net_profit: number;
  }>(`/reports/profit-loss?from=${from}&to=${to}`);
  return {
    from: data.from,
    to: data.to,
    income: data.income.map(
      (i: { account_code: string; account_name: string; amount: number }) => ({
        accountCode: i.account_code,
        accountName: i.account_name,
        amount: i.amount,
      })
    ),
    expenses: data.expenses.map(
      (e: { account_code: string; account_name: string; amount: number }) => ({
        accountCode: e.account_code,
        accountName: e.account_name,
        amount: e.amount,
      })
    ),
    totalIncome: data.total_income,
    totalExpenses: data.total_expenses,
    netProfit: data.net_profit,
  };
}

export async function fetchBalanceSheet(
  asOf?: string
): Promise<BalanceSheetReport> {
  const params = asOf ? `?as_of=${asOf}` : "";
  const data = await apiFetch<{
    as_of: string;
    assets: { account_code: string; account_name: string; balance: number }[];
    liabilities: { account_code: string; account_name: string; balance: number }[];
    equity: { account_code: string; account_name: string; balance: number }[];
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    is_balanced: boolean;
  }>(`/reports/balance-sheet${params}`);
  const mapItem = (i: { account_code: string; account_name: string; balance: number }) => ({
    accountCode: i.account_code,
    accountName: i.account_name,
    balance: i.balance,
  });
  return {
    asOf: data.as_of,
    assets: data.assets.map(mapItem),
    liabilities: data.liabilities.map(mapItem),
    equity: data.equity.map(mapItem),
    totalAssets: data.total_assets,
    totalLiabilities: data.total_liabilities,
    totalEquity: data.total_equity,
    isBalanced: data.is_balanced,
  };
}

export async function fetchAgingReceivables(): Promise<AgingReceivablesReport> {
  const data = await apiFetch<{
    as_of: string;
    customers: { customer_id: string; customer_name: string; current: number; days_31_60: number; days_61_90: number; days_90_plus: number; total: number }[];
  }>("/reports/aging-receivables");
  return {
    asOf: data.as_of,
    customers: data.customers.map(
      (c: { customer_id: string; customer_name: string; current: number; days_31_60: number; days_61_90: number; days_90_plus: number; total: number }): AgingRow => ({
        customerId: c.customer_id,
        customerName: c.customer_name,
        current: c.current,
        days31_60: c.days_31_60,
        days61_90: c.days_61_90,
        days90Plus: c.days_90_plus,
        total: c.total,
      })
    ),
  };
}
