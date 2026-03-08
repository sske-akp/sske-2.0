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

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const res = await fetch(`${baseUrl}/accounts/?limit=500`);
  if (!res.ok) throw new Error("Failed to fetch accounts");
  const data: AccountAPI[] = await res.json();
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

  const res = await fetch(`${baseUrl}/journal-entries/?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch journal entries");
  const data: JournalEntryAPI[] = await res.json();
  return data.map(mapJournalEntry);
}

export async function fetchJournalEntryDetail(
  id: string
): Promise<JournalEntry> {
  const res = await fetch(`${baseUrl}/journal-entries/${id}`);
  if (!res.ok) throw new Error("Journal entry not found");
  const data: JournalEntryAPI = await res.json();
  return mapJournalEntry(data);
}

export async function createManualJournalEntry(
  form: ManualJournalEntryForm
): Promise<JournalEntry> {
  const res = await fetch(`${baseUrl}/journal-entries/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entry_date: form.entryDate,
      description: form.description,
      reference_type: form.referenceType || "adjustment",
      lines: form.lines.map((l) => ({
        account_id: l.accountId,
        debit: l.debit,
        credit: l.credit,
        description: l.description || null,
      })),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create journal entry");
  }
  const data: JournalEntryAPI = await res.json();
  return mapJournalEntry(data);
}

// --- Reports ---

export async function fetchTrialBalance(
  asOf?: string
): Promise<TrialBalanceReport> {
  const params = asOf ? `?as_of=${asOf}` : "";
  const res = await fetch(`${baseUrl}/reports/trial-balance${params}`);
  if (!res.ok) throw new Error("Failed to fetch trial balance");
  const data = await res.json();
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
  const res = await fetch(
    `${baseUrl}/reports/profit-loss?from=${from}&to=${to}`
  );
  if (!res.ok) throw new Error("Failed to fetch P&L report");
  const data = await res.json();
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
  const res = await fetch(`${baseUrl}/reports/balance-sheet${params}`);
  if (!res.ok) throw new Error("Failed to fetch balance sheet");
  const data = await res.json();
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
  const res = await fetch(`${baseUrl}/reports/aging-receivables`);
  if (!res.ok) throw new Error("Failed to fetch aging receivables");
  const data = await res.json();
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
